const _ = require('lodash')
import { Integer } from "aws-sdk/clients/apigateway";
import { AddAndUpdateSiteDTO, ErrorResponse, UserType } from "../common";
import {
    addSite, getSites, getSiteById, updateSite, getClientRegion, getSitesForDropdown,
    getDashboardRatingsHelper, getSiteRatingsWithLabelHelper, getAverageSiteRatings, getAssociatedClients, getSiteWiseReviewsCount
} from "../models";
import { MessageActions } from "./../common";


/**
 * Service to add new site in the site
 * @param  {AddAndUpdateSiteDTO} payload
 */
export const addNewSite = async (payload: AddAndUpdateSiteDTO, loggedInUser) => {
    const data = {
        name: payload.name,
        regionId: payload.region_id,
        clientId: payload.client_id,
        address: {
            address_line_1: payload.address_line_1,
            address_line_2: payload.address_line_2 || '',
            address_line_3: payload.address_line_3 || ''
        },
        postCode: payload.post_code,
        city: payload.city,
        country: payload.country,
        createdBy: loggedInUser.user_id,
        updatedBy: loggedInUser.user_id
    }
    let siteDetails = await addSite(data);
    if (!siteDetails) {
        return [404, ErrorResponse.ResourceNotFound];
    }
    return [
        201,
        {
            ok: true,
            message: MessageActions.CREATE_SITE,
            site_id: parseInt(siteDetails.id)
        },
    ];
};
//Service to get sites for logged in client role.
export const getAllSites = async (clientId: number, loggedInUser) => {
    let whereClause = '';
    if (parseInt(loggedInUser.user_type_id) === UserType.CLIENT_SITE) {
        whereClause = `site.clientId = ${clientId} AND user_site_association.userId = ${loggedInUser.user_id}`;
    }
    else if (parseInt(loggedInUser.user_type_id) === UserType.CLIENT_ADMIN || parseInt(loggedInUser.user_type_id) === UserType.AGENCY_ADMIN) {
        whereClause = `site.clientId = ${clientId}`;
    }
    else if (parseInt(loggedInUser.user_type_id) === UserType.CLIENT_REGIONAL) {
        let regions = await getClientRegion({ adminId: parseInt(loggedInUser.user_id) });
        let regionIds = _.map(regions, 'id');
        if (!regionIds) {
            return [200, {
                ok: true,
                sites: []
            }];
        }
        whereClause = `site.region_id IN (${regionIds})`
    }
    let siteDetails = await getSites(whereClause);
    if (!siteDetails) {
        return [404, ErrorResponse.ResourceNotFound];
    }
    if (!whereClause) {
        return [200, {
            ok: true,
            sites: []
        }];
    }
    siteDetails = _.map(siteDetails, (site) => {
        site.address = JSON.parse(site.address);
        return site;
    });
    return [
        200,
        {
            ok: true,
            sites: siteDetails
        },
    ];
};

export const getSitesDropDownService = async (clientId: number) => {
    let siteDetails = await getSitesForDropdown(clientId);
    return [
        200,
        {
            ok: true,
            sites: siteDetails
        },
    ];
};

/**
 * update site.
 * @param  {id}
 * @param  {CreateAndUpdateDepartmentDTO} payload
 */
export const updateSiteService = async (id: string, payload: AddAndUpdateSiteDTO, loggedInUser) => {
    let siteToUpdate = await getSiteById(id);

    if (!siteToUpdate) {
        return [404, ErrorResponse.ResourceNotFound];
    }
    const sitePayload = {
        name: payload.name,
        regionId: payload.region_id,
        clientId: payload.client_id,
        address: {
            address_line_1: payload.address_line_1,
            address_line_2: payload.address_line_2 || '',
            address_line_3: payload.address_line_3 || ''
        },
        postCode: payload.post_code,
        city: payload.city,
        country: payload.country,
        updatedBy: loggedInUser.user_id,
    }
    let site = await updateSite(id, sitePayload);
    return [200, {
        ok: true,
        message: MessageActions.UPDATE_SITE,
        site_id: site.id
    }];
};

/**
 * site ratings service.
 * @param  {data}
 * @param  {loggedInUser}
 */
export const siteAndClientRatingsService = async (data, loggedInUser) => {

    //Missing data validation
    if (!_.size(data)) {
        return [400, ErrorResponse.BadRequestError]
    }

    let { client_id, site_id, region_id, agency_id } = data;
    let response: any;
    let whereClause1: string = `survey_question.belongs_to='SITE'`;
    let whereClause2: string = '';

    //Get site ratings on client_id.
    if (client_id && !site_id && !region_id) {

        //Fetching the list of associated site id from the client_id.
        let sites = await getSites(`site.client_id=${client_id}`);
        if (sites.length) {
            let site_id_list = sites.map(object => parseInt(object.id));
            whereClause2 = `survey_result.site_id IN (${site_id_list}) AND survey_result.client_id = ${client_id} AND survey_result.rating is not null `;
        }
        else {
            return [200, {
                "ok": true,
                "average_rating": 0,
                "reviews_count": 0,
                "label_wise_ratings": [
                    {
                        "label": "Training",
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
                        "label": "Recognition",
                        "ratings": "0.0"
                    },
                    {
                        "label": "Identification",
                        "ratings": "0.0"
                    }
                ]
            }]
        }

    }
    else if (client_id && site_id && !region_id) {
        // Site ratings by site_id and client_id.
        whereClause2 = `survey_result.site_id = ${site_id} AND survey_result.client_id = ${client_id} AND survey_result.rating is not null`;
    }
    else if (client_id && region_id && !site_id) {
        //Site ratings by region_id.
        let sites = await getSites(`site.region_id=${region_id}`);
        if (sites.length) {
            let site_id_list = sites.map(object => parseInt(object.id));
            whereClause2 = `survey_result.site_id IN (${site_id_list}) AND survey_result.client_id = ${client_id} AND survey_result.rating is not null `;
        }
        else {
            return [200, {
                "ok": true,
                "average_rating": 0,
                "reviews_count": 0,
                "label_wise_ratings": [
                    {
                        "label": "Training",
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
                        "label": "Recognition",
                        "ratings": "0.0"
                    },
                    {
                        "label": "Identification",
                        "ratings": "0.0"
                    }
                ]
            }]
        }
    }
    else {
        let clients = await getAssociatedClients(agency_id);
        if (clients.length) {
            let clientIdList = clients.map(element => parseInt(element.clientId));
            whereClause2 = `survey_result.client_id IN (${clientIdList}) AND survey_result.rating is not null`
        }
        else {
            return [200, {
                "ok": true,
                "average_rating": 0,
                "reviews_count": 0,
                "label_wise_ratings": [
                    {
                        "label": "Training",
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
                        "label": "Recognition",
                        "ratings": "0.0"
                    },
                    {
                        "label": "Identification",
                        "ratings": "0.0"
                    }
                ]
            }]
        }
    }

    response = await getDashboardRatingsHelper(whereClause1, whereClause2);

    let { average_rating, label_wise_ratings } = response;
    let reviews_count = response.reviews_count.map(object => parseInt(object.reviews_count));

    return [200, {
        "ok": true,
        average_rating: parseFloat(average_rating.ratings),
        reviews_count: _.sum(reviews_count),
        label_wise_ratings
    }]
};


/**
 * site ratings service.
 * @param  {data}
 * @param  {loggedInUser}
 */
export const detailedSiteRatingsService = async (data, loggedInUser) => {
    if (!_.size(data)) {
        return [400, ErrorResponse.BadRequestError]
    }

    let { client_id, region_id } = data;
    let sites: any;
    let whereClause = `survey_result.rating is not null AND survey_question.belongs_to='SITE' AND`
    let site_id_list: Array<Integer> = [];
    let siteWiseRatings: any;
    if (client_id && !region_id) {
        sites = await getSites(`site.client_id=${client_id}`);
    }
    else {
        sites = await getSites(`site.region_id=${region_id}`);
    }
    if (!_.size(sites)) {
        return [200, { ok: true, ratings: {} }]
    }
    site_id_list = sites.map(object => parseInt(object.id));

    whereClause += ` survey_result.site_id IN (${site_id_list})`;

    siteWiseRatings = await getSiteRatingsWithLabelHelper(whereClause);
    let siteWiseAverageRatings = await getAverageSiteRatings(whereClause);

    let siteWiseReviewsCount = await getSiteWiseReviewsCount(whereClause);

    let grouped = _.groupBy(siteWiseRatings, object => object.site_name);

    let response: any = []

    Object.keys(grouped).forEach(key => {
        let reviewsCount = [];
        reviewsCount = grouped[key].map(object => parseInt(object.reviews_count))
        let label_wise_ratings = grouped[key].map(object => { return { "label": object.label, "ratings": object.ratings } })
        let obj = siteWiseReviewsCount.find(o => o.site_id === grouped[key][0].site_id);
        response.push({
            name: key,
            reviews_count: parseInt(obj.reviews_count),
            average_rating: parseFloat(siteWiseAverageRatings.find(object => object.site_name === key).ratings),
            label_wise_ratings
        })
    })

    return [200, { ok: true, 'ratings': response || [] }]
};


// Helper function to convert the array of objects into a single object for the label wise ratings.
export const modifyLabelWiseRatings = (array) => {
    return array.reduce((obj, item) => (obj[item.label] = parseFloat(item.ratings), obj), {});
}