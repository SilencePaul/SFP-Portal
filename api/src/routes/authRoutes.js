import express from "express";
import { login, verifyToken } from "../controller/authController.js";
import { authMiddleware } from "../middleware/auth.js";
import { body } from "express-validator";

const router = express.Router();

// Public routes
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

// Protected routes
router.get("/verify", authMiddleware, verifyToken);

export default router;
