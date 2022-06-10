import { getRepository } from 'typeorm';
import { SurveyQuestions } from '..';

export const getSurveyQuestions: any = async (surveyId, dataToSelect) => {
    const surveyQuestionRepository = getRepository(SurveyQuestions);
    return await surveyQuestionRepository.createQueryBuilder('survey_questions')
    .select(dataToSelect)
    .where(`survey_questions.survey_id = '${surveyId}'`)
    .execute()
}