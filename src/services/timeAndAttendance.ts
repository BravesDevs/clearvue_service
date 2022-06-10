/**
 * All the service layer methods for the TIME AND ATTENDANCE.
 */
const { EasyPromiseAll } = require('easy-promise-all');
const _ = require('lodash')
import { ErrorCodes, ErrorResponse, TimeAndAttendanceStatus } from "./../common";
import {
    addTimeAndAttendanceData,
    createTimeAndAttendance,
    getTimeAndAttendanceList,
    getTimeAndAttendance,
    getTimeAndAttendanceDetail,
    getWorkerByEmployeeIdAndAgencyId,
    getTimeAndAttendanceById,
    deleteTimeAndAttendanceById,
    getTimeAndAttendanceCount,
    getTimeAndAttendanceDataCount,
    getSiteById
} from "./../models";
import { MessageActions } from "./../common";
import { uploadFileOnS3, deleteObject, notifyBugsnag } from './../utils';
import { config } from "../configurations";

const uuid = require('uuid');

/**
 * Service to add T&A.
 */
export const addTimeAndAttendance = async (fileContent, timeAndAttendanceData, payload, loggedInUser) => {
    try {
        const exisitingTimeAndAttendance = await getTimeAndAttendance({
            startDate: payload.start_date,
            endDate: payload.end_date,
            agencyId: payload.agency_id,
            clientId: payload.client_id,
            siteId: payload.site_id
        });
        if (exisitingTimeAndAttendance) {
            return [409, ErrorResponse.FileAlreadyExists];
        }
        const fileName = uuid.v4();
        // upload s3
        const url = await uploadFileOnS3(
            config.BUCKET_NAME,
            config.TIME_AND_ATTENDANCE_FOLDER,
            fileName,
            "csv",
            fileContent
        );
        const timeAndAttendanceMetaData = {
            path: url.location,
            name: fileName,
            week: payload.week,
            status: TimeAndAttendanceStatus.PROCESSED,
            clientId: payload.client_id,
            agencyId: payload.agency_id,
            siteId: payload.site_id,
            startDate: payload.start_date,
            endDate: payload.end_date,
            createdBy: loggedInUser.user_id,
            updatedBy: loggedInUser.user_id,
        }
        let timeAndAttendance = await createTimeAndAttendance(timeAndAttendanceMetaData)
        timeAndAttendance = await getTimeAndAttendanceById(timeAndAttendance.id);
        const { site, workers } = await EasyPromiseAll({
            site: getSiteById(payload.site_id),
            workers: getWorkerByEmployeeIdAndAgencyId(_.map(timeAndAttendanceData, 'employee_id'), payload.agency_id)
        });
        const workerNotFound = [];
        for (let i = 0; i < timeAndAttendanceData.length; i++) {
            const worker = _.find(workers, { employee_id: timeAndAttendanceData[i].employee_id, agency_id: payload.agency_id })
            if(worker){
                timeAndAttendanceData[i].workerId = worker.id;
                timeAndAttendanceData[i].shiftId = worker.shift_id;
                timeAndAttendanceData[i].departmentId = worker.department_id;
            } else {
                workerNotFound.push(timeAndAttendanceData[i].employee_id)
            }
            timeAndAttendanceData[i].payrollRef = timeAndAttendanceData[i].payroll_ref;
            timeAndAttendanceData[i].weeklyHours = timeAndAttendanceData[i].week_hours;
            timeAndAttendanceData[i].payType = timeAndAttendanceData[i].pay_type;
            timeAndAttendanceData[i].payRate = timeAndAttendanceData[i].pay_rate;
            timeAndAttendanceData[i].totalCharge = timeAndAttendanceData[i].total_charges;
            timeAndAttendanceData[i].standardCharge = timeAndAttendanceData[i].standard_charges;
            timeAndAttendanceData[i].overtimeCharge = timeAndAttendanceData[i].overtime_charges;
            timeAndAttendanceData[i].chargeRate = timeAndAttendanceData[i].charge_rate;
            timeAndAttendanceData[i].standardPay = timeAndAttendanceData[i].standard_pay;
            timeAndAttendanceData[i].overtimePay = timeAndAttendanceData[i].overtime_pay;
            timeAndAttendanceData[i].day_1 = timeAndAttendanceData[i].sun;
            timeAndAttendanceData[i].day_2 = timeAndAttendanceData[i].mon;
            timeAndAttendanceData[i].day_3 = timeAndAttendanceData[i].tue;
            timeAndAttendanceData[i].day_4 = timeAndAttendanceData[i].wed;
            timeAndAttendanceData[i].day_5 = timeAndAttendanceData[i].thu;
            timeAndAttendanceData[i].day_6 = timeAndAttendanceData[i].fri;
            timeAndAttendanceData[i].day_7 = timeAndAttendanceData[i].sat;
            timeAndAttendanceData[i].clientId = payload.client_id;
            timeAndAttendanceData[i].agencyId = payload.agency_id;
            timeAndAttendanceData[i].siteId = payload.site_id;
            timeAndAttendanceData[i].regionId = site.region_id;
            timeAndAttendanceData[i].createdBy = loggedInUser.user_id;
            timeAndAttendanceData[i].updatedBy = loggedInUser.user_id;
            timeAndAttendanceData[i].timeAndAttendanceId = timeAndAttendance.id;
            timeAndAttendanceData[i].week = payload.week;
            timeAndAttendanceData[i].startDate = payload.start_date;
            timeAndAttendanceData[i].endDate = payload.end_date;
        }
        if (_.size(workerNotFound)) {
            await deleteObject(config.BUCKET_NAME, config.TIME_AND_ATTENDANCE_FOLDER, timeAndAttendance.name)
            await deleteTimeAndAttendanceById(timeAndAttendance.id);
            return [400, {
                ok: false,
                message: `worker id does not match for employee id(s): ${workerNotFound}`
            }]
        }
        await addTimeAndAttendanceData(timeAndAttendanceData);
        // await addPayroll(timeAndAttendance.id, loggedInUser.user_id);
        return [201, {
            'ok': true,
            message: MessageActions.CREATE_TIME_AND_ATTENDANCE,
        }]
    } catch (err) {
        if (err.code === ErrorCodes.dbReferenceError) {
            return [404, ErrorResponse.ResourceNotFound]    // Return 404 if any foreign key contraint is not available in DB
        } else {
            notifyBugsnag(err);
            return [500, err.message]
        }
    }

};

/**
 * Service to GET T&A.
 */
export const getListOfTimeAndAttendanceService = async (client_id, page, limit, sortBy, sortType) => {
    const { timeAndAttendanceList, count } = await EasyPromiseAll({
        timeAndAttendanceList: getTimeAndAttendanceList(`client_id = ${client_id}`, page, limit, sortBy, sortType),
        count: getTimeAndAttendanceCount({ clientId: client_id })
    });
    return [200, {
        ok: true,
        time_and_attendance_list: timeAndAttendanceList,
        count
    }];
}

/**
 * Service to GET T&A details.
 */
export const getDetailOfTimeAndAttendanceService = async (id, page, limit, sortBy, sortType) => {
    const { timeAndAttendanceDetail, count } = await EasyPromiseAll({
        timeAndAttendanceDetail: getTimeAndAttendanceDetail(id, page, limit, sortBy, sortType),
        count: getTimeAndAttendanceDataCount(id)
    });
    return [200, {
        ok: true,
        time_and_attendance_detail: timeAndAttendanceDetail,
        count
    }];
}


