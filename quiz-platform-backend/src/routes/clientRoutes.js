import express from "express";
import bundleController from "../controllers/bundleController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post(
  "/bundle",
  authMiddleware,
  roleMiddleware(2),
  bundleController.createBundle
);

router.get(
  "/bundles",
  authMiddleware,
  roleMiddleware(2),
  bundleController.getBundles
);

import quizController from "../controllers/quizController.js";

router.post(
  "/quiz",
  authMiddleware,
  roleMiddleware(2),
  quizController.createQuiz
);

router.get(
  "/quizzes/:bundleId",
  authMiddleware,
  roleMiddleware(2),
  quizController.getQuizzes
);

import questionController from "../controllers/questionController.js";

router.post(
  "/question",
  authMiddleware,
  roleMiddleware(2),
  questionController.createQuestion
);

router.get(
  "/questions/:quizId",
  authMiddleware,
  roleMiddleware(2),
  questionController.getQuestions
);
export default router;