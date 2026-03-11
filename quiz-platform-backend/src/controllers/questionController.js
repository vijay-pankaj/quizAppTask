import models from "../../models/index.js";
import questionService from "../services/questionService.js";

const createQuestion = async (req, res) => {

  try {

    const quizId = req.params.id;

    const quiz = await models.Quiz.findByPk(quizId);

    if (!quiz) {

      return res.status(404).json({
        success: false,
        message: "Quiz does not exist"
      });

    }

    const question = await questionService.createQuestion(req.body, quizId);

    return res.status(201).json({
      success: true,
      data: question
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


const getQuestions = async (req, res) => {

  try {

    const quizId = req.params.quizId;

    const questions = await questionService.getQuestions(quizId);

    return res.status(200).json({
      success: true,
      data: questions
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

export default {
  createQuestion,
  getQuestions
};