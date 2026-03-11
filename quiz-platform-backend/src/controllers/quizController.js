import models from "../../models/index.js";
import quizService from "../services/quizService.js";
const createQuiz = async (req, res) => {

  try {
    console.log(req.body.categoryId)
    
    const bundleId = await models.Bundle.findOne({where:{id:req.body.categoryId}})

    const quiz = await quizService.createQuiz(req.body,bundleId.id);

    res.status(201).json({
      success: true,
      data: quiz,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

const getQuizzes = async (req, res) => {

  try {

    const bundleId = req.params.bundleId;

    const quizzes = await quizService.getQuizzes(req.query, bundleId);

    res.status(200).json({
      success: true,
      data: quizzes,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

export default {
  createQuiz,
  getQuizzes,
};