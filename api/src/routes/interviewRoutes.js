import express from "express";
import {
  getAllInterviews,
  getInterviewById,
  getInterviewsByApplication,
  createInterview,
  updateInterview,
  deleteInterview,
} from "../controller/interviewController.js";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";
import { body, param } from "express-validator";

const router = express.Router();

// Get all interviews (admin sees all, interviewer sees assigned)
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "interviewer"),
  getAllInterviews
);

// Get interview by ID (admin sees all, interviewer sees assigned only)
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "interviewer"),
  [param("id").isInt().withMessage("Valid interview ID is required")],
  getInterviewById
);

// Get interviews by application ID (admin only)
router.get(
  "/application/:applicationId",
  authMiddleware,
  roleMiddleware("admin"),
  [
    param("applicationId")
      .isInt()
      .withMessage("Valid application ID is required"),
  ],
  getInterviewsByApplication
);

// Create interview (admin only) - requires application_id and volunteer_id
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  [
    body("application_id")
      .isInt()
      .withMessage("Valid application ID is required"),
    body("volunteer_id")
      .isInt()
      .withMessage("Valid interviewer (volunteer) ID is required"),
    body("interview_time")
      .optional()
      .isISO8601()
      .withMessage("Interview time must be a valid ISO8601 date"),
  ],
  createInterview
);

// Update interview (admin can update all fields, interviewer can set time once & result)
router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "interviewer"),
  [
    param("id").isInt().withMessage("Valid interview ID is required"),
    body("interview_time")
      .optional()
      .isISO8601()
      .withMessage("Interview time must be a valid ISO8601 date"),
    body("interview_result")
      .optional()
      .isString()
      .withMessage("Interview result must be a string"),
    body("final_decision")
      .optional()
      .isIn(["pending", "approved", "rejected"])
      .withMessage("Final decision must be pending, approved, or rejected"),
  ],
  updateInterview
);

// Delete interview (admin only)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  [param("id").isInt().withMessage("Valid interview ID is required")],
  deleteInterview
);

export default router;
