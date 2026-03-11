import models from "../../models/index.js";
import studentService from "../services/studentService.js";
const registerStudent = async (req, res) => {

  try {
    console.log(req.body)
    const student = await studentService.registerStudent(req.body);

    res.status(201).json({
      success: true,
      data: student
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};
const submitQuiz = async (req, res) => {

  try {

    const { attempt_id, answers } = req.body;

    const score = await studentService.submitQuiz(attempt_id, answers);

    res.status(200).json({
      success: true,
      score
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

const startQuiz = async (req, res) => {

  try {

    const attempt = await studentService.startQuiz(
      req.user.id,
      req.body.quiz_id
    );

    res.status(201).json({
      success: true,
      attempt_id: attempt.id
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};
export default {
  registerStudent,
  submitQuiz,
  startQuiz
};  