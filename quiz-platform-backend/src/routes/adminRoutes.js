import express from "express";
import adminController from "../controllers/adminController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post(
  "/create-client",
  authMiddleware,
  roleMiddleware(1),
  adminController.createClient
);
export default router;