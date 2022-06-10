const express = require('express');

import { site, UserType } from './../common';
import { authorizeJwtToken } from './../middlewares/auth';
import { checkPermission } from '../middlewares/permission';
import { addSite, getSites, updateSite, getSitesDropDown, siteRatingsAPI, detailedSiteRatingsAPI } from '../api';

export const router = express.Router();

router.route(site.SITE).post(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN]), addSite);
router.route(site.SITE).get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.AGENCY_ADMIN, UserType.CLIENT_SITE, UserType.CLIENT_REGIONAL]), getSites);
router.route(site.SITE_DROPDOWN).get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.AGENCY_ADMIN, UserType.CLIENT_SITE, UserType.CLIENT_REGIONAL]), getSitesDropDown);
router.route(site.UPDATE_SITE).put(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN]), updateSite);
router.route(site.SITE_RATINGS).get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), siteRatingsAPI)
router.route(site.SITE_RATINGS_DETAILS).get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.AGENCY_ADMIN]), detailedSiteRatingsAPI)