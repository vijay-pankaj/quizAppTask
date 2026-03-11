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
  "/bundle",
  authMiddleware,
  // roleMiddleware(2,3),
  bundleController.getBundles
);
router.put("/bundle/:id",authMiddleware, bundleController.updateBundle);
router.delete("/bundle/:id",authMiddleware, bundleController.deleteBundle);

import quizController from "../controllers/quizController.js";

router.post(
  "/quiz1",
  authMiddleware,
  roleMiddleware(2),
  quizController.createQuiz
);

router.get(
  "/quizzes/:bundleId",
  // authMiddleware,
  // roleMiddleware(2),
  quizController.getQuizzes
);
router.put("/client/quiz/:id",authMiddleware, quizController.updateQuiz);
router.delete("/admin/quiz/:id",authMiddleware, quizController.deleteQuiz);
import questionController from "../controllers/questionController.js";

router.post(
  "/question/:id",
  // authMiddleware,
  // roleMiddleware(2),
  questionController.createQuestion
);

router.get(
  "/question/:quizId",
  // authMiddleware,
  // roleMiddleware(2),
  questionController.getQuestions
);
export default router;