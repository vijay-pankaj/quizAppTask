import express from "express";
import studentController from "../controllers/studentController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
const router = express.Router();

router.post("/register", studentController.registerStudent);
router.post(
  "/submit-quiz/:id",
  authMiddleware,
  roleMiddleware(3),
  studentController.submitQuiz
);
router.post(
  "/start-quiz/:id",
  authMiddleware,
  roleMiddleware(3),
  studentController.startQuiz
);
router.get(
  "/bundle/:id/quizzes",
  authMiddleware,
  roleMiddleware(3),
  studentController.getQuestions
);

export default router;