/**
 * All the service layer methods for the Agency.
 */
const _ = require('lodash');
import { config } from "./../configurations";
import { CreateAgencyDTO, ErrorResponse } from "./../common";
import {
    createAgency, updateAgency, getAgencyList, getAgencyById, getAssociatedAgencies,
    getDashboardAgencyRatingsHelper, getAgencyRatingsWithLabelHelper, getAverageAgencyRatings, getAgencyWiseReviewsCount
} from "./../models";
import { uploadFileOnS3 } from "../utils";
import { MessageActions } from "./../common";

/**
 * create agency.
 * @param  {CreateAgencyDTO} payload
 */
export const createAgencyService = async (payload: CreateAgencyDTO, loggedInUser) => {
    const agencyPayload = {
        name: payload.name,
        city: payload.city,
        country: payload.country,
        postCode: payload.postCode,
        address: {
            address_line_1: payload.address_line_1,
            address_line_2: payload.address_line_2 || '',
            address_line_3: payload.address_line_3 || '',
        },
        createdBy: loggedInUser.user_id,
        updatedBy: loggedInUser.user_id,
    }
    let agency = await createAgency(agencyPayload);
    return [201, {
        ok: true,
        message: MessageActions.CREATE_AGENCY,
        agency_id: agency.id,
    }];
};

/**
 * update agency.
 * @param id
 * @param  {UpdateAgencyDTO} payload
 * @param loggedInUser
 * @param image
 */
export const updateAgencyService = async (id, payload, loggedInUser, image) => {
    let agencytoUpdate = await getAgencyById(id);

    if (!agencytoUpdate) {
        return [404, ErrorResponse.ResourceNotFound];
    }
    if (payload.profile && (payload.profile === "null")) {
        delete payload.profile
    } else if (image) {
        let resourceName = "AGENCY" + id + image.extension;
        payload["resource"] = config.BUCKET_URL + "/" + config.PROFILE_BUCKET_FOLDER + "/" + resourceName;
        await uploadFileOnS3(config.BUCKET_NAME, config.PROFILE_BUCKET_FOLDER, resourceName, image.mime, image.data);
    }
    payload.address = {
        address_line_1: payload.address_line_1,
        address_line_2: payload.address_line_2 || '',
        address_line_3: payload.address_line_3 || ''
    }
    payload.updatedBy = loggedInUser.user_id
    delete payload.address_line_1
    delete payload.address_line_2
    delete payload.address_line_3

    let agency = await updateAgency(id, payload);
    return [200, {
        ok: true,
        message: MessageActions.UPDATE_AGENCY,
        agency_id: agency.id
    }];
};

/**
 * get agency list.
 * @param loggedInUser
 * @param data
 */
export const getAgencyListService = async (loggedInUser, data) => {

    let agencyList = await getAgencyList(loggedInUser, data.page || 1, data.limit || 10, data.sort_by || "agency_name", data.sort_type || "asc");
    let count = 0;
    if (agencyList.count) {
        count = parseInt(agencyList.count);
        agencyList = _.map(agencyList, (object) => {
            object.association_id = parseInt(object.association_id);
            object.agency_id = parseInt(object.agency_id);
            object.address = JSON.parse(object.address);
            return object;
        })
    }

    return [200, {
        "ok": true,
        "count": count,
        "agency_list": agencyList
    }];
};

/**
 * get agency by id.
 * @param id
 */
export const getAgencyByIdService = async (id: string) => {

    let agency = await getAgencyById(id);
    let url: any;
    if (agency.resource == null) {
        url = config.BUCKET_URL + "/" + config.PROFILE_BUCKET_FOLDER + "/" + config.DEFAULT_IMAGE;
    } else {
        url = agency.resource;
    }
    delete agency.resource;
    agency.address = JSON.parse(agency.address);
    agency.profile_url = url
    return [200, {
        "ok": true,
        "agency": agency
    }];
};


/**
 * Agency Ratings Service.
 * @param data
 * @param loggedInUser
 */
export const agencyRatingsService = async (data, loggedInUser) => {
    if (!_.size(data)) {
        return [400, ErrorResponse.BadRequestError]
    }
    let { client_id, agency_id } = data;
    let response: any;
    let whereClause1 = `survey_question.belongs_to='AGENCY'`
    let whereClause2: string = 'survey_result.rating is not null AND ';
    if (client_id) {
        //Get List of associated agencies.
        let agencies = await getAssociatedAgencies(client_id);
        if (_.size(agencies)) {
            let agencyIdList = agencies.map(element => parseInt(element.agencyId));
            whereClause2 += `survey_result.agency_id IN (${agencyIdList}) AND survey_result.client_id=${client_id}`
        }
        else {
            return [200, {
                "ok": true,
                "average_rating": 0,
                "reviews_count": 0,
                "label_wise_ratings": [{
                    "label": "Role Expectations",
                    "ratings": "0.0"
                },
                {
                    "label": "Leadership",
                    "ratings": "0.0"
                },
                {
                    "label": "Engagement",
                    "ratings": "0.0"
                },
                {
                    "label": "Payroll",
                    "ratings": "0.0"
                },
                {
                    "label": "Identification",
                    "ratings": "0.0"
                }]
            }]
        }
    }
    else {
        //Get agency wise ratings
        whereClause2 += `survey_result.agency_id = ${agency_id}`;
    }
    response = await getDashboardAgencyRatingsHelper(whereClause1, whereClause2);
    let reviews_count = response.reviews_count.map(object => parseInt(object.reviews_count));
    let { average_rating, label_wise_ratings } = response;

    return [200, {
        "ok": true,
        average_rating: parseFloat(average_rating.ratings),
        reviews_count: _.sum(reviews_count),
        label_wise_ratings
    }]
};


/**
 * Agency Ratings Service.
 * @param data
 * @param loggedInUser
 */
export const detailedAgencyRatingsService = async (data, loggedInUser) => {
    if (!_.size(data)) {
        return [400, ErrorResponse.BadRequestError]
    }
    let agencyWiseRatings: any;
    let agencies = await getAssociatedAgencies(data.client_id);
    if (_.size(agencies)) {
        let agencyIdList = agencies.map(element => parseInt(element.agencyId));
        let whereClause = `survey_result.rating is not null AND survey_question.belongs_to='AGENCY' AND survey_result.agency_id IN (${agencyIdList}) AND survey_result.client_id=${data.client_id}`;
        agencyWiseRatings = await getAgencyRatingsWithLabelHelper(whereClause);
        let agencyWiseAverageRatings = await getAverageAgencyRatings(whereClause);
        let agencyWiseReviewsCount = await getAgencyWiseReviewsCount(whereClause);

        let grouped = _.groupBy(agencyWiseRatings, object => object.agency_name);

        let response: any = []

        Object.keys(grouped).forEach(key => {
            let reviewsCount = [];
            reviewsCount = grouped[key].map(object => parseInt(object.reviews_count))
            let label_wise_ratings = grouped[key].map(object => { return { "label": object.label, "ratings": object.ratings } })
            let obj = agencyWiseReviewsCount.find(o => o.agency_id === grouped[key][0].agency_id);
            response.push({
                name: key,
                reviews_count: parseInt(obj.reviews_count),
                average_rating: parseFloat(agencyWiseAverageRatings.find(object => object.agency_name === key).ratings),
                label_wise_ratings
            })
        })

        return [200, { ok: true, 'ratings': response || [] }]
    }
    else {
        return [200, { ok: true, ratings: {} }]
    }
};
