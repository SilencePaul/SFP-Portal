import express from "express";
import {
  getAllApplicants,
  getApplicantById,
  createApplicant,
  updateApplicant,
  deleteApplicant,
} from "../controller/applicantController.js";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";
import { body } from "express-validator";

const router = express.Router();

// Public routes
router.post(
  "/",
  [
    body("first_name").notEmpty().withMessage("First name is required"),
    body("last_name").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone_number").notEmpty().withMessage("Phone number is required"),
    body("interview_language")
      .isIn(["Cantonese", "English", "Mandarin"])
      .withMessage("Valid interview language is required"),
    body("information_channel")
      .notEmpty()
      .withMessage("Information channel is required"),
    body("home_address").notEmpty().withMessage("Home address is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("province").notEmpty().withMessage("Province is required"),
    body("zip_code").notEmpty().withMessage("ZIP code is required"),
    body("age_group")
      .isIn(["under_18", "18_25", "26_35", "36_65", "65_plus"])
      .withMessage("Valid age group is required"),
    body("main_caregiver").notEmpty().withMessage("Main caregiver is required"),
  ],
  createApplicant
);

// Protected routes (requires authentication)
router.get(
  "/",
  authMiddleware,
  roleMiddleware("Adoption Interviewer", "Coordinator"),
  getAllApplicants
);
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("Adoption Interviewer", "Coordinator"),
  getApplicantById
);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("Coordinator"),
  [
    body("first_name")
      .optional()
      .notEmpty()
      .withMessage("First name cannot be empty"),
    body("last_name")
      .optional()
      .notEmpty()
      .withMessage("Last name cannot be empty"),
    body("email").optional().isEmail().withMessage("Valid email is required"),
    body("phone_number")
      .optional()
      .notEmpty()
      .withMessage("Phone number cannot be empty"),
  ],
  updateApplicant
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("Coordinator"),
  deleteApplicant
);

export default router;
