/**
 * All the Survey related APIs.
 */

const express = require('express');
export const router = express.Router();

import { checkPermission } from './../middlewares/permission';
import { authorizeJwtToken } from './../middlewares/auth';
import { survey, UserType } from './../common';
import { getSurveyCategory, getSurveyQuestions, addSurvey, getSurveyAnalysis, downloadSurveyAnalysis } from '../api';
// APIs

router.route(survey.GET_SURVEY_CATEGORY)
  .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_SITE, UserType.CLIENT_REGIONAL, UserType.AGENCY_ADMIN, UserType.AGENCY_WORKER]), getSurveyCategory);
  
router.route(survey.GET_SURVEY_QUESTIONS)
  .get(authorizeJwtToken, checkPermission([UserType.AGENCY_WORKER]), getSurveyQuestions);
  
router.route(survey.ADD_SURVEY_RESPONSE)
  .post(authorizeJwtToken, checkPermission([UserType.AGENCY_WORKER]), addSurvey);
  
router.route(survey.GET_SURVEY_ANALYSIS)
  .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_SITE, UserType.CLIENT_REGIONAL, UserType.AGENCY_ADMIN]), getSurveyAnalysis);

router.route(survey.DOWNLOAD_SURVEY_ANALYSIS)
  .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_SITE, UserType.CLIENT_REGIONAL, UserType.AGENCY_ADMIN]), downloadSurveyAnalysis);