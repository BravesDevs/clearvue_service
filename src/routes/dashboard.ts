/**
 * All the job related APIs.
 */

const express = require('express');
export const router = express.Router();

import { checkPermission } from '../middlewares/permission';
import { authorizeJwtToken } from '../middlewares/auth';
import {
    activityAllStats, activityBottomDeck, dashboardLeaversBottonDeck, dashboardLeaversTopDeck, dashboardWorkForce,
    dashboardWorkForceBottomDeck, header, UserType, dashboardDemographics, trendsAnalysis
} from '../common';
import {
    getWorkerDemographicsData, getLengthOfService, getLeaversCountAndStarterRetention, getLeaversShiftUtilization,
    getAgencyWiseLeaversLengthOfService, getAgencyWiseLeaversCountAndStarterRetention, getAgencyWiseLeaversShiftUtilization, getWorkForceShiftUtilization,
    getWorkForceLengthOfService, getAgencyWiseWorkForceLengthOfService, getAgencyWiseWorkForceDemoGraphics, getAgencyWiseWorkShiftUtilization,
    getActivityAllStats, getActivityHeadCount, getActivitySpend, getActivityAverageHours, getHeaderStats,
    getLeaversAnalysis, getRatings, getWorkForcePoolUtilization, getLeavers, getActivityShiftDetails, getGenderAnalytics, getProximityAnalytics, getLeaverPoolUtilization,
    getAgeAnalytics, getSpendTrendsAnalystics, getHoursTrendsAnalystics, getTotalHeadsTrendsAnalystics, getLeaversTrendsAnalystics, getSiteRatingsTrendsAnalystics,
    getAgencyRatingsTrendsAnalystics, getCompanyRatingsTrendsAnalystics
} from '../api';

// Routes for work force top deck.
router.route(dashboardWorkForce.DASHBOARD_WORKER_DEMOGRAPHICS)
    .get(authorizeJwtToken, checkPermission([UserType.AGENCY_ADMIN, UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE]), getWorkerDemographicsData);

router.route(dashboardWorkForce.DASHBOARD_WORKER_SHIFT_UTILIZATION)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), getWorkForceShiftUtilization);

router.route(dashboardWorkForce.DASHBOARD_WORKER_LENGTH_OF_SERVICE)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), getWorkForceLengthOfService);

router.route(dashboardWorkForce.POOL_UTILIZATION)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), getWorkForcePoolUtilization);




//Dashboard Leavers top Deck
router.route(dashboardLeaversTopDeck.LEAVERS_COUNT_AND_STARTER_RETENTION)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), getLeaversCountAndStarterRetention);

router.route(dashboardLeaversTopDeck.LEAVERS_SHIFT_UTILIZATION)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), getLeaversShiftUtilization);

router.route(dashboardLeaversTopDeck.LEAVERS_LENGTH_OF_SERVICE)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), getLengthOfService);

router.route(dashboardLeaversTopDeck.POOL_UTILIZATION)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), getLeaverPoolUtilization);


//Routes for Leavers bottom deck

router.route(dashboardLeaversBottonDeck.AGENCY_WISE_LEAVERS_LENGTH_OF_SERVICE)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), getAgencyWiseLeaversLengthOfService);

router.route(dashboardLeaversBottonDeck.AGENCY_WISE_LEAVERS_COUNT_AND_STARTER_RETENTION)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), getAgencyWiseLeaversCountAndStarterRetention);

router.route(dashboardLeaversBottonDeck.AGENCY_WISE_LEAVERS_SHIFT_UTILIZATION)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), getAgencyWiseLeaversShiftUtilization);

router.route(dashboardLeaversBottonDeck.LEAVERS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), getLeavers);


//Routes for workforce bottom deck.
router.route(dashboardWorkForceBottomDeck.DASHBOARD_WORKER_LENGTH_OF_SERVICE)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), getAgencyWiseWorkForceLengthOfService);

router.route(dashboardWorkForceBottomDeck.DASHBOARD_WORKER_DEMOGRAPHICS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), getAgencyWiseWorkForceDemoGraphics);

router.route(dashboardWorkForceBottomDeck.DASHBOARD_WORKER_SHIFT_UTILIZATION)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), getAgencyWiseWorkShiftUtilization);

router.route(dashboardWorkForceBottomDeck.HEAD_COUNT)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), getActivityHeadCount);

//Routes for activity top deck.
router.route(activityAllStats.ALL_STATS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), getActivityAllStats);


//Routes for activity Bottom Deck
router.route(activityBottomDeck.SPEND)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), getActivitySpend);

router.route(activityBottomDeck.AVERAGE_HOURS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), getActivityAverageHours);

router.route(activityBottomDeck.SHIFT_DETAILS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), getActivityShiftDetails);


//Routes for Header.
router.route(header.HEADER_STATS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), getHeaderStats);

router.route(header.LEAVERS_ANALYSIS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), getLeaversAnalysis);

router.route(header.RATINGS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), getRatings);


// Routes for demographics page APIs
router.route(dashboardDemographics.GENDER)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), getGenderAnalytics);

router.route(dashboardDemographics.PROXIMITY)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), getProximityAnalytics);

router.route(dashboardDemographics.AGE)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_REGIONAL, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN]), getAgeAnalytics);

// Routes for trends page APIs
router.route(trendsAnalysis.GET_STANDARD_OVERTIME_SPEND)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.CLIENT_REGIONAL]), getSpendTrendsAnalystics);

router.route(trendsAnalysis.GET_STANDARD_OVERTIME_HOURS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.CLIENT_REGIONAL]), getHoursTrendsAnalystics);

router.route(trendsAnalysis.GET_TOTAL_HEADS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.CLIENT_REGIONAL]), getTotalHeadsTrendsAnalystics);

router.route(trendsAnalysis.GET_LEAVERS_ANALYSIS)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.CLIENT_REGIONAL]), getLeaversTrendsAnalystics);

router.route(trendsAnalysis.SITE_RATING)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.CLIENT_REGIONAL]), getSiteRatingsTrendsAnalystics);

router.route(trendsAnalysis.AGENCY_RATING)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.CLIENT_REGIONAL]), getAgencyRatingsTrendsAnalystics);

router.route(trendsAnalysis.COMPANY_RATING)
    .get(authorizeJwtToken, checkPermission([UserType.CLIENT_ADMIN, UserType.CLIENT_SITE, UserType.AGENCY_ADMIN, UserType.CLIENT_REGIONAL]), getCompanyRatingsTrendsAnalystics);
