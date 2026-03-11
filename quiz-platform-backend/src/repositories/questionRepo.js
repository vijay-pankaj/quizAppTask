import Question from "../../models/question.js";

const createQuestion = async (data) => {

  return await Question.create(data);

};

const getQuestions = async (quizId) => {

  return await Question.findAll({
    where: { quiz_id: quizId },
    order: [["createdAt", "DESC"]],
  });

};

export default {
  createQuestion,
  getQuestions,
};