/**
 * All the agency related APIs.
 */

const express = require('express');
export const router = express.Router();

import { checkPermission } from './../middlewares/permission';
import { authorizeJwtToken } from './../middlewares/auth';
import { agency, UserType } from './../common';
import { createAgency, updateAgency, getAgencyList, getAgencyById, agencyRatingsAPI, detailedAgencyRatingsAPI } from '../api';
const upload = require("express-fileupload");

// APIs
router.route(agency.CREATE_AND_GET_LIST_OF_AGENCY)
    .post(authorizeJwtToken, checkPermission([UserType.CLEARVUE_ADMIN]), createAgency)
    .get(authorizeJwtToken, checkPermission([UserType.CLEARVUE_ADMIN, UserType.CLIENT_ADMIN, UserType.CLIENT_SITE, UserType.CLIENT_REGIONAL]), getAgencyList);

router.route(agency.UPDATE_AND_GET_AGENCY)
    .put(authorizeJwtToken, checkPermission([UserType.CLEARVUE_ADMIN, UserType.AGENCY_ADMIN]), upload(), updateAgency)
    .get(authorizeJwtToken, checkPermission([UserType.CLEARVUE_ADMIN, UserType.AGENCY_ADMIN]), getAgencyById);

router.route(agency.AGENCY_RATINGS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), agencyRatingsAPI)

router.route(agency.AGENCY_RATINGS_DETAILS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), detailedAgencyRatingsAPI)