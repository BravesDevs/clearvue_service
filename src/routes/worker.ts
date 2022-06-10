/**
 * All the worker related APIs.
 */

const express = require('express');
export const router = express.Router();

import { checkPermission } from './../middlewares/permission';
import { authorizeJwtToken } from './../middlewares/auth';
import { worker, UserType } from './../common';
import {
    addNewWorker,
    bulkUploadWorkers,
    bulkUpdateWorkers,
    downloadSampleFile,
    getWorkersList,
    getWorkerDetailsByWorkerId,
    workerRegistrationAPI,
    workerLogin,
    getWorkersListWithoutPagination,
    checkWorkerAvailability,
    workerDocumentsUpload,
    workerProfileAPI,
    updateWorkerProfileByUserId,
    getWorkerGroupDetails,
    updateWorkerDetailByWorkerId,
    trackWorkerTrainingAPI, getWorkersNationality
} from '../api';

const upload = require("express-fileupload");
// APIs
router.route(worker.CREATE_OR_GET_WORKERS)
    .post(authorizeJwtToken, checkPermission([UserType.AGENCY_ADMIN]), addNewWorker)
    .get(authorizeJwtToken, checkPermission([UserType.AGENCY_ADMIN, UserType.CLIENT_ADMIN, UserType.CLIENT_SITE]), getWorkersList)

router.route(worker.BULK_UPLOAD_OR_UPDATE_WORKERS)
    .post(authorizeJwtToken, checkPermission([UserType.AGENCY_ADMIN]), upload(), bulkUploadWorkers)
    .put(authorizeJwtToken, checkPermission([UserType.AGENCY_ADMIN]), bulkUpdateWorkers)

router.route(worker.GET_SAMPLE_SHEET)
    .get(authorizeJwtToken, checkPermission([UserType.AGENCY_ADMIN, UserType.CLIENT_ADMIN]), downloadSampleFile)

router.route(worker.GET_AND_UPDATE_WORKER_DETAILS)
    .get(authorizeJwtToken, (checkPermission([UserType.AGENCY_ADMIN, UserType.CLIENT_ADMIN, UserType.CLIENT_SITE])), getWorkerDetailsByWorkerId)
    .put(authorizeJwtToken, (checkPermission([UserType.AGENCY_ADMIN, UserType.AGENCY_WORKER])), updateWorkerDetailByWorkerId)

router.route(worker.LOGIN).post(workerLogin)

router.route(worker.DOCUMENTS)
    .post(authorizeJwtToken, checkPermission([UserType.AGENCY_ADMIN, UserType.AGENCY_WORKER, UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.CLEARVUE_ADMIN]), upload(), workerDocumentsUpload)
    
router.route(worker.GET_WORKER_LISTING)
    .get(authorizeJwtToken, (checkPermission([UserType.AGENCY_ADMIN, UserType.CLIENT_SITE])), getWorkersListWithoutPagination)

router.route(worker.CHECK_EXISTENCE_WORKER).post(checkWorkerAvailability)

router.route(worker.SIGN_UP).post(workerRegistrationAPI)

router.route(worker.PROFILE)
    .get(authorizeJwtToken, checkPermission([UserType.AGENCY_WORKER]), workerProfileAPI)

router.route(worker.UPDATE_WORKER_PROFILE)
    .put(authorizeJwtToken, (checkPermission([UserType.AGENCY_ADMIN, UserType.AGENCY_WORKER])), updateWorkerProfileByUserId)

router.route(worker.GET_WORKER_GROUPS)
    .get(authorizeJwtToken, (checkPermission([UserType.AGENCY_ADMIN, UserType.CLIENT_SITE])), getWorkerGroupDetails)

router.route(worker.TRACK_TRAINING)
    .put(authorizeJwtToken, (checkPermission([UserType.AGENCY_WORKER])), trackWorkerTrainingAPI)

router.route(worker.WORKER_NATIONALITYT_LIST)
    .get(authorizeJwtToken, (checkPermission([UserType.AGENCY_ADMIN, UserType.CLIENT_SITE])), getWorkersNationality)
