import express from "express";
import {
  getAllApplications,
  getApplicationById,
  getApplicationsByAnimal,
  getApplicationsByApplicant,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
} from "../controller/applicationController.js";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";
import { body, param } from "express-validator";

const router = express.Router();

// Public routes
router.post(
  "/",
  [
    body("animal_id").notEmpty().withMessage("Animal ID is required"),
    body("applicant_id")
      .isInt({ min: 1 })
      .withMessage("Valid applicant ID is required"),
    body("answers").isObject().withMessage("Answers must be an object"),
    body("status").optional().isString().withMessage("Status must be a string"),
  ],
  createApplication
);

// Protected routes (requires authentication)
router.get(
  "/",
  authMiddleware,
  roleMiddleware("Adoption Interviewer", "Coordinator"),
  getAllApplications
);
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("Adoption Interviewer", "Coordinator", "Applicant"),
  [param("id").isInt().withMessage("Valid application ID is required")],
  getApplicationById
);
router.get(
  "/animal/:animalId",
  authMiddleware,
  roleMiddleware("Adoption Interviewer", "Coordinator", "Foster"),
  [param("animalId").notEmpty().withMessage("Animal ID is required")],
  getApplicationsByAnimal
);
router.get(
  "/applicant/:applicantId",
  authMiddleware,
  roleMiddleware("Adoption Interviewer", "Coordinator", "Applicant"),
  [param("applicantId").isInt().withMessage("Valid applicant ID is required")],
  getApplicationsByApplicant
);
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("Adoption Interviewer", "Coordinator"),
  [
    param("id").isInt().withMessage("Valid application ID is required"),
    body("status").notEmpty().withMessage("Status is required"),
  ],
  updateApplicationStatus
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("Coordinator"),
  [param("id").isInt().withMessage("Valid application ID is required")],
  deleteApplication
);

export default router;
