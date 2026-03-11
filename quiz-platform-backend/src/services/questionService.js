import questionRepo from "../repositories/questionRepo.js";

const createQuestion = async (data,quizId) => {

  const question = await questionRepo.createQuestion({
    quiz_id: quizId,
    question: data.question,
    option_a: data.option_a,
    option_b: data.option_b,
    option_c: data.option_c,
    option_d: data.option_d,
    correct_answer: data.correct_answer,
    marks: data.marks
  });

  return question;
};

const getQuestions = async (quizId) => {

  return await questionRepo.getQuestions(quizId);

};

export default {
  createQuestion,
  getQuestions,
};