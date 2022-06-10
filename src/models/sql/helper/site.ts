import { getRepository, In } from 'typeorm';
import { Region, Site, SurveyQuestions } from '../';
import { SurveyResult } from '../entities/SurveyResult';

/**
 * create site
 */

export const addSite: any = async (data) => {
    const siteRepository = getRepository(Site);
    return await siteRepository.save(data);
};

export const getSites: any = async (whereClause) => {
    const siteRepository = getRepository(Site);
    let response = await siteRepository.createQueryBuilder('site')
        .innerJoin('site.region', 'region')
        .leftJoin('site.userSiteAssociations', 'user_site_association')
        .select(['DISTINCT(site.id) AS id', 'site.name AS name', 'site.region_id AS region_id',
            'site.address AS address', 'site.post_code AS post_code', 'site.city AS city',
            'site.country AS country', 'region.name AS region_name',
            'site.created_at AS created_at', 'site.created_by AS created_by',
            'site.updated_at AS updated_at', 'site.updated_by AS updated_by'])
        .where(whereClause)
        .orderBy('site.name', 'ASC')
        .getRawMany();
    return response;
};

export const getSitesForDropdown: any = async (clientId) => {
    const siteRepository = getRepository(Site);
    let response = await siteRepository.createQueryBuilder('site')
        .select(['site.id AS id', 'site.name AS name'])
        .where('site.clientId = :clientId', { clientId })
        .orderBy('site.name', 'ASC')
        .getRawMany();
    return response;
};

export const getRegionIdFromSite: any = async (adminId) => {
    const siteRepository = getRepository(Site);
    let response = await siteRepository.createQueryBuilder('site')
        .innerJoin('site.userSiteAssociations', 'user_site_association')
        .select(['site.region_id AS regionId'])
        .where('user_site_association.userId = :adminId', { adminId })
        .getRawMany();
    return response;
};
export const getSitesByNames: any = async (names) => {
    const siteRepository = getRepository(Site);
    return await siteRepository.find(
        {
            where: { name: In(names) },
            select: ['id', 'name']
        }
    );
};
/**
 * get site By Id
 */
export const getSiteById: any = async (id) => {
    const siteRepository = getRepository(Site);
    return await siteRepository.createQueryBuilder("site")
        .innerJoin('site.userSiteAssociations', 'user_site_association')
        .where("site.id = :id", { id })
        .select(['name', 'region_id', 'client_id', 'GROUP_CONCAT(user_site_association.user_id) as site_admins'])
        .getRawOne();
};

/**
 * update site
 */
export const updateSite: any = async (id, body) => {
    const siteRepository = getRepository(Site);
    body.updatedAt = new Date();
    return await siteRepository.update({ id }, body);
};

/**
 * Average Ratings for dashboard.
 */
export const getDashboardRatingsHelper: any = async (whereClause1: string, whereClause2: string) => {
    let response: any = {};
    response.average_rating = await getRepository(SurveyResult).createQueryBuilder('survey_result')
        .innerJoin('survey_result.question', 'survey_question')
        .innerJoin('survey_result.site', 'site')
        .select(['IFNULL(FORMAT(avg(survey_result.rating),1),0.0) as ratings'])
        .where(whereClause1 + " AND " + whereClause2)
        .getRawOne();

    response.reviews_count = await getRepository(SurveyResult).createQueryBuilder('survey_result')
        .innerJoin('survey_result.question', 'survey_question')
        .innerJoin('survey_result.site', 'site')
        .select(['count(distinct(survey_result.survey_id)) as reviews_count'])
        .where(whereClause1 + " AND " + whereClause2)
        .groupBy('survey_result.site_id')
        .getRawMany();

    whereClause1 += ` GROUP BY survey_question.label`;

    response.label_wise_ratings = await getRepository(SurveyQuestions).createQueryBuilder('survey_question')
        .leftJoin('survey_question.surveyResults', 'survey_result', whereClause2)
        .leftJoin('survey_result.site', 'site')
        .select(['survey_question.label as label, IFNULL(FORMAT(avg(survey_result.rating),1),0.0) as ratings'])
        .where(whereClause1)
        .getRawMany();

    return response;
};

/**
 * Individual site ratings with labels.
 */
export const getSiteRatingsWithLabelHelper: any = async (whereClause: string) => {
    return await getRepository(SurveyResult).createQueryBuilder('survey_result')
        .innerJoin('survey_result.question', 'survey_question')
        .innerJoin('survey_result.site', 'site')
        .select(['DISTINCT(site.id) as site_id', 'site.name as site_name',
            'COUNT(survey_result.id) as reviews_count',
            'survey_question.label as label', 'IFNULL(FORMAT(avg(survey_result.rating),1),0.0) as ratings'])
        .where(whereClause)
        .groupBy('site.name, survey_question.label')
        .getRawMany()
};

/**
 * Individual site ratings with labels.
 */
export const getAverageSiteRatings: any = async (whereClause: string) => {
    return await getRepository(SurveyResult).createQueryBuilder('survey_result')
        .innerJoin('survey_result.question', 'survey_question')
        .innerJoin('survey_result.site', 'site')
        .select(['DISTINCT(site.id) as site_id', 'site.name as site_name',
            'IFNULL(FORMAT(avg(survey_result.rating),1),0.0) as ratings'])
        .where(whereClause)
        .groupBy('site.name')
        .getRawMany()
};


/**
 * Individual site reviews count.
 */
 export const getSiteWiseReviewsCount: any = async (whereClause: string) => {
    return await getRepository(SurveyResult).createQueryBuilder('survey_result')
        .innerJoin('survey_result.question', 'survey_question')
        .select(['survey_result.site_id as site_id, count(distinct(survey_result.survey_id)) as reviews_count'])
        .where(whereClause)
        .groupBy('survey_result.site_id')
        .getRawMany();
};
