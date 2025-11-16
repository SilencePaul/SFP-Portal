import express from "express";
import {
  getAllInterviews,
  getInterviewById,
  getInterviewsByApplication,
  getInterviewsByVolunteer,
  scheduleInterview,
  updateInterviewResult,
  deleteInterview,
} from "../controller/interviewController.js";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";
import { body, param } from "express-validator";
import Interview from "../models/Interview.js";
import Application from "../models/Application.js";
import Volunteer from "../models/Volunteer.js";

const router = express.Router();

// Protected routes (all interview routes require authentication)
router.get(
  "/",
  authMiddleware,
  roleMiddleware("Adoption Interviewer", "Coordinator"),
  getAllInterviews
);
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("Adoption Interviewer", "Coordinator", "Applicant"),
  [param("id").isInt().withMessage("Valid interview ID is required")],
  getInterviewById
);
router.get(
  "/application/:applicationId",
  authMiddleware,
  roleMiddleware("Adoption Interviewer", "Coordinator", "Applicant"),
  [
    param("applicationId")
      .isInt()
      .withMessage("Valid application ID is required"),
  ],
  getInterviewsByApplication
);
router.get(
  "/volunteer/:volunteerId",
  authMiddleware,
  roleMiddleware("Adoption Interviewer", "Coordinator"),
  [param("volunteerId").isInt().withMessage("Valid volunteer ID is required")],
  getInterviewsByVolunteer
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("Adoption Interviewer", "Coordinator"),
  [
    body("application_id")
      .isInt()
      .withMessage("Valid application ID is required"),
    body("volunteer_id").isInt().withMessage("Valid volunteer ID is required"),
    body("applicant_id").isInt().withMessage("Valid applicant ID is required"),
    body("interview_time")
      .isISO8601()
      .withMessage("Valid interview time is required"),
  ],
  scheduleInterview
);

router.patch(
  "/:id/result",
  authMiddleware,
  roleMiddleware("Adoption Interviewer"),
  [
    param("id").isInt().withMessage("Valid interview ID is required"),
    body("interview_result")
      .notEmpty()
      .withMessage("Interview result is required"),
  ],
  updateInterviewResult
);

router.patch(
  "/:id/time",
  authMiddleware,
  roleMiddleware("Adoption Interviewer", "Coordinator"),
  [
    param("id").isInt().withMessage("Valid interview ID is required"),
    body("interview_time")
      .isISO8601()
      .withMessage("Valid interview time is required"),
  ],
  // This is a new route, we need to implement the controller method
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { interview_time } = req.body;

      // Find interview in database
      const interview = await Interview.findByPk(id);

      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }

      // Update interview time
      await interview.update({ interview_time });

      // Return updated interview with details
      const updatedInterview = await Interview.findByPk(id, {
        include: [
          { model: Application, attributes: ["id", "status"] },
          {
            model: Volunteer,
            attributes: ["id", "first_name", "last_name", "email"],
          },
        ],
      });

      res.status(200).json(updatedInterview);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("Coordinator"),
  [param("id").isInt().withMessage("Valid interview ID is required")],
  deleteInterview
);

export default router;
