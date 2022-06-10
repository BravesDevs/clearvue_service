import { getRepository, getConnection } from 'typeorm';
import { AgencyClientAssociation, AgencyDetails, SurveyQuestions, SurveyResult, User } from '../';
import { UserType, databaseSeparator } from '../../../common';

/**
 * create agency
 */
export const createAgency: any = async (body) => {
    const agencyRepository = getRepository(AgencyDetails);
    return await agencyRepository.save(body);
};

/**
 * update agency
 */
export const updateAgency: any = async (id, body) => {
    const agencyRepository = getRepository(AgencyDetails);
    body.updatedAt = new Date();
    return await agencyRepository.update({ id }, body);
};

/**
 * get agency list
 */
export const getAgencyList: any = async (loggedInUser, page, limit, sortBy, sortType) => {
    let response: any;
    //Get all the client details associated with the agency.
    if ((parseInt(loggedInUser.user_type_id) === UserType.CLIENT_ADMIN) ||
        (parseInt(loggedInUser.user_type_id) === UserType.CLIENT_SITE) ||
        (parseInt(loggedInUser.user_type_id) === UserType.CLIENT_REGIONAL)) {

        let userRepository = getRepository(User);
        let data = await userRepository.createQueryBuilder("user").select(["user.client_id as client_id"]).where({ id: parseInt(loggedInUser.user_id) }).getRawOne();
        const clientid = parseInt(data.client_id);
        const agencyclientAssocRepository = getRepository(AgencyClientAssociation);
        response = await agencyclientAssocRepository.createQueryBuilder("agency_client_association")
            .leftJoin("agency_client_association.agency", "agency_details")
            .select([
                "agency_client_association.id as association_id",
                "agency_details.id as agency_id",
                "agency_details.name as agency_name",
                "agency_details.address as address",
                "agency_details.post_code as post_code",
                "agency_details.city as city",
                "agency_details.country as country",
                "agency_details.created_at as created_at",
            ]).where({ clientId: clientid })
            .orderBy(sortBy, sortType)
            .addOrderBy('agency_client_association.id', sortType.toUpperCase())
            .offset((page - 1) * limit)
            .limit(limit)
            .execute()
        response["count"] = await agencyclientAssocRepository.count({ where: { clientId: clientid } })
        return response;

    }
    // //Get all the agencies.
    else {
        const agencyDetailsRepository = getRepository(AgencyDetails);
        response = await agencyDetailsRepository.createQueryBuilder("agency_details")
            .select([
                "agency_details.id as agency_id",
                "agency_details.name as agency_name",
                "agency_details.address as address",
                "agency_details.post_code as post_code",
                "agency_details.city as city",
                "agency_details.country as country",
                "agency_details.created_at as created_at"
            ])
            .orderBy(sortBy, sortType)
            .addOrderBy('agency_details.id', sortType.toUpperCase())
            .offset((page - 1) * limit)
            .limit(limit)
            .execute();
        response["count"] = await agencyDetailsRepository.count()
        return response;
    }
};

/**
 * get agency By Id
 */
export const getAgencyById: any = async (id, isCountRequired = true) => {
    const agencyRepository = getRepository(AgencyDetails);
    let response = await agencyRepository.createQueryBuilder("agency_details")
        .where("agency_details.id = :id", { id })
        .select(['id', 'name', 'address', 'country', 'city', 'post_code', 'resource'])
        .getRawOne();

    response["count"] = isCountRequired ? agencyRepository.count() : null;

    return response;
};


/**
 * Get associated agencies (name + id)
 */
export const getAssociatedAgenciesList: any = async (requestArgs: object, whereClauseString: string) => {

    let innerJoinString: string = "INNER JOIN agency_details ON agency_client_association.agency_id = agency_details.id ";

    if (requestArgs.hasOwnProperty('site_id')) {
        innerJoinString += " INNER JOIN site ON agency_client_association.client_id = site.client_id ";
    }
    if (requestArgs.hasOwnProperty('region_id')) {
        innerJoinString += " INNER JOIN region ON agency_client_association.client_id = region.client_id ";
    }
    if (requestArgs.hasOwnProperty('department_id')) {
        innerJoinString += " INNER JOIN departments ON agency_client_association.client_id = departments.client_id ";
    }
    if (requestArgs.hasOwnProperty('shift_id')) {
        innerJoinString += " INNER JOIN shift ON agency_client_association.client_id = shift.client_id ";
    }

    let response = await getConnection().query(`
        SELECT DISTINCT agency_details.id AS agency_detail_id, agency_details.name AS agency_name, CONCAT(agency_details.id , '${databaseSeparator}' , agency_details.name) 
            AS agency_detail
        FROM agency_client_association
            ${innerJoinString}
        WHERE ${whereClauseString}
        ORDER BY agency_detail_id
    `);

    return response;
};


export const getDashboardAgencyRatingsHelper: any = async (whereClause1: string, whereClause2: string) => {
    let response: any = {};
    response.average_rating = await getRepository(SurveyResult).createQueryBuilder('survey_result')
        .innerJoin('survey_result.question', 'survey_question')
        .select(['IFNULL(FORMAT(avg(survey_result.rating),1),0.0) as ratings'])
        .where(whereClause1 + " AND " + whereClause2)
        .getRawOne();

    response.reviews_count = await getRepository(SurveyResult).createQueryBuilder('survey_result')
        .innerJoin('survey_result.question', 'survey_question')
        .select(['count(distinct(survey_result.survey_id)) as reviews_count'])
        .where(whereClause1 + " AND " + whereClause2)
        .groupBy('survey_result.agency_id')
        .getRawMany();

    whereClause1 += ` GROUP BY survey_question.label`;

    response.label_wise_ratings = await getRepository(SurveyQuestions).createQueryBuilder('survey_question')
        .leftJoin('survey_question.surveyResults', 'survey_result', whereClause2)
        .select(['survey_question.label as label, IFNULL(FORMAT(avg(survey_result.rating),1),0.0) as ratings'])
        .where(whereClause1)
        .getRawMany();

    return response;
};


/**
 * Individual site ratings with labels.
 */
export const getAgencyRatingsWithLabelHelper: any = async (whereClause: string) => {
    return await getRepository(SurveyResult).createQueryBuilder('survey_result')
        .innerJoin('survey_result.question', 'survey_question')
        .innerJoin('survey_result.agency', 'agency')
        .select(['DISTINCT(agency.id) as agency_id', 'agency.name as agency_name',
            'count(distinct(survey_result.survey_id)) as reviews_count',
            'survey_question.label as label', 'IFNULL(FORMAT(avg(survey_result.rating),1),0.0) as ratings'])
        .where(whereClause)
        .groupBy('agency.name, survey_question.label')
        .getRawMany()
};


/**
 * Individual site ratings with labels.
 */
export const getAverageAgencyRatings: any = async (whereClause: string) => {
    return await getRepository(SurveyResult).createQueryBuilder('survey_result')
        .innerJoin('survey_result.question', 'survey_question')
        .innerJoin('survey_result.agency', 'agency')
        .select(['DISTINCT(agency.id) as agency_id', 'agency.name as agency_name',
            'IFNULL(FORMAT(avg(survey_result.rating),1),0.0) as ratings'])
        .where(whereClause)
        .groupBy('agency.name')
        .getRawMany()
};

/**
 * Individual agency ratings with labels.
 */
export const getAgencyWiseReviewsCount: any = async (whereClause: string) => {
    return await getRepository(SurveyResult).createQueryBuilder('survey_result')
        .innerJoin('survey_result.question', 'survey_question')
        .select(['survey_result.agency_id as agency_id, count(distinct(survey_result.survey_id)) as reviews_count'])
        .where(whereClause)
        .groupBy('survey_result.agency_id')
        .getRawMany();
};
