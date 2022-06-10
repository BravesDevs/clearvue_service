const _ = require('lodash');
const moment = require('moment');
import { MessageActions, ErrorResponse } from "./../common";
import { getSurveyCategories, getWorkerStartDateById, getSurveyQuestions, addNewSurvey, addNewAnswer, getSubmittedSurveyCount, getSurveyAnalysis, downloadSurveyAnalysis } from "./../models";

/**
 * Service to GET Survey Category.
 */
export const getSurveyCategoryService = async (workerId = null) => {
    const selectKeys = workerId ? ['id', 'name', 'triggered_week'] : ['id', 'name']
    const whereClause = workerId ? 'is_visible = 1' : ''
    let surveyCategories = await getSurveyCategories(selectKeys, whereClause);
    if (workerId) {
        const worker = await getWorkerStartDateById(workerId);
        const currentWeek = moment().diff(worker.start_date, 'weeks');
        surveyCategories = _.map(surveyCategories, (category) => {
            category.isVisible = true;
            if (category.triggered_week === 1 && currentWeek > 1) {
                category.isVisible = false
            } else if (category.triggered_week === 2 && (currentWeek < 1 || currentWeek > 2)) {
                category.isVisible = false
            } else if (category.triggered_week === 4 && (currentWeek < 2 || currentWeek > 4)) {
                category.isVisible = false
            } else if (category.triggered_week === 8 && (currentWeek < 4 || currentWeek > 8)) {
                category.isVisible = false
            } else if (category.triggered_week === 12 && (currentWeek < 8 || currentWeek > 12)) {
                category.isVisible = false
            }
            if (category.name === "Exit Survey" && worker.is_active === 1) {
                category.isVisible = false
            }
            delete category.triggered_week
            return category;
        })
    }
    return [200, {
        ok: true,
        surveys: surveyCategories,
    }];
}

/**
 * Service to GET Survey Analysis.
 */
export const getSurveyAnalysisService = async (surveyId, query) => {
    let whereClause = `survey_result.surveyId = ${surveyId}`;
    if(query.client_id){
        whereClause = `${whereClause} and survey_result.clientId = ${query.client_id}`
    }
    if(query.agency_id){
        whereClause = `${whereClause} and survey_result.agencyId = ${query.agency_id}`
    }
    if(query.site_id){
        whereClause = `${whereClause} and survey_result.siteId = ${query.site_id}`
    }
    if(query.start_date && query.end_date){
        whereClause = `${whereClause} and survey_result.created_at >= '${moment(query.start_date).format('YYYY-MM-DD 00:00:01')}' and survey_result.created_at <= '${moment(query.end_date).format('YYYY-MM-DD 23:59:59')}'`
    }
    let surveyAnalysis = await getSurveyAnalysis(whereClause);
    let response = []
    _.map(surveyAnalysis, (survey) => {
        let formattedSurvey = _.find(response, {id: survey.question_id});
        if(survey.value != 0) {
            if(formattedSurvey) {
                formattedSurvey.options.push({
                    name: survey.option_type = 'Rating' ? `${survey.name} Stars` : survey.name,
                    count: survey.value
                })
            } else {
                let analysis = {
                    id: survey.question_id,
                    question_text: survey.question_text,
                    label: survey.label,
                    options: [{
                        name: survey.option_type = 'Rating' ? `${survey.name} Stars` : survey.name,
                        count: survey.value
                    }]
                };
                response.push(analysis)
            }
        }
    })
    return [200, {
        ok: true,
        questions: response,
    }];
}

/**
 * Service to downbload Survey Analysis.
 */
export const downloadSurveyAnalysisService = async (surveyId, query) => {
    let whereClause = `survey_result.surveyId = ${surveyId}`;
    if(query.client_id){
        whereClause = `${whereClause} and survey_result.clientId = ${query.client_id}`
    }
    if(query.agency_id){
        whereClause = `${whereClause} and survey_result.agencyId = ${query.agency_id}`
    }
    if(query.site_id){
        whereClause = `${whereClause} and survey_result.siteId = ${query.site_id}`
    }
    if(query.start_date && query.end_date){
        whereClause = `${whereClause} and survey_result.created_at >= '${moment(query.start_date).format('YYYY-MM-DD 00:00:01')}' and survey_result.created_at <= '${moment(query.end_date).format('YYYY-MM-DD 23:59:59')}'`
    }
    let questions = await getSurveyQuestions(surveyId, ['id','question_text','label']);
    questions = _.map(questions, (question) => {
        question.question_text = question.question_text.replace(/,/g, "")
        return question
    });
    let surveyAnalysis = await downloadSurveyAnalysis(whereClause);
    let response = []
    _.map(surveyAnalysis, (survey) => {
        const question_id = survey.question_id;
        let formattedSurvey = _.find(response, {created_at: survey.created_at});
        if(formattedSurvey) {
            // let formattedQuestions = _.find(formattedSurvey.questions, {question_id: survey.question_id});
            let formattedQuestions = formattedSurvey.questions[question_id];
            if(formattedQuestions && survey.answer) {
                formattedQuestions.answer.push(survey.answer)
            } else {
                formattedSurvey.questions[question_id] = {
                    "rating": survey.rating,
                    "answer": survey.answer ? [survey.answer] : [],
                }
            }
        } else {
            let analysis = {
                id: survey.id,
                worker_id: survey.worker_id,
                worker_first_name: survey.worker_first_name,
                worker_last_name: survey.worker_last_name,
                shift_name: survey.shift_name,
                site_name: survey.site_name,
                department_name: survey.department_name,
                worker_employee_id: survey.worker_employee_id,
                worker_role: survey.worker_role,
                questions: {},
                created_at: survey.created_at
            };
            analysis.questions[question_id] = {
                    "rating": survey.rating,
                    "answer": survey.answer ? [survey.answer] : [],
                }
            response.push(analysis)
        }
    })
    return [200, {
        ok: true,
        questions: questions,
        surveys: response,
    }];
}

/**
 * Service to GET Survey Questions.
 */
export const getSurveyQuestionsService = async (surveyId) => {
    let surveyQuestions = await getSurveyQuestions(surveyId, ['id','question_text','label','sequence','option_type','options']);
    surveyQuestions = _.map(surveyQuestions, (question) => {
        question.options = question.options ? JSON.parse(question.options) : question.options;
        return question;
    })
    return [200, {
        ok: true,
        questions: surveyQuestions,
    }];
}

/**
 * Service to add Survey.
 */
export const addSurveyService = async (result, loggedInUserId) => {
    const submittedSurveyCount = await getSubmittedSurveyCount({ 
        workerId: result[0].workerId, 
        agencyId: result[0].agencyId, 
        clientId: result[0].clientId, 
        siteId:result[0].siteId, 
        surveyId: result[0].surveyId, 
        questionId: result[0].questionId})
    if(submittedSurveyCount >= 2) {
        return [409, ErrorResponse.SurveyAlreadyFilled]
    }
    const responseWithNoMcq = [];
    const answerData = [];
    for (let response of result) {
        response.createdBy = loggedInUserId;
        if (response.hasOwnProperty('rating') && response.rating != null) {
            responseWithNoMcq.push(response);
        } else {
            const { "answer": answer, ...resultObj } = response;
            const surveyResult = await addNewSurvey(resultObj);
            for (let ans of answer) {
                answerData.push({
                    answer: ans,
                    createdBy: loggedInUserId,
                    resultId: surveyResult[0]
                })
            }
        }
    }
    if(_.size(responseWithNoMcq)){
        await addNewSurvey(responseWithNoMcq);
    }
    if(_.size(answerData)){
        await addNewAnswer(answerData);
    }
    return [200, {
        ok: true,
        message: MessageActions.SURVEY_RESPONSE
    }];
}
