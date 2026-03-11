import models from "../../models/index.js";

const startQuiz = async (data) => {

  return await models.QuizAttempt.create(data);

};

export default {
  startQuiz
};