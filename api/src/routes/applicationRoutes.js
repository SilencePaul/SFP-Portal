import express from "express";
import {
  getAllApplications,
  getApplicationById,
  getApplicationsByAnimal,
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
    body("full_name").notEmpty().withMessage("Full name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
  ],
  createApplication
);

// Protected routes (requires authentication)
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "interviewer"),
  getAllApplications
);
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "interviewer"),
  [param("id").isInt().withMessage("Valid application ID is required")],
  getApplicationById
);
router.get(
  "/animal/:animalId",
  authMiddleware,
  roleMiddleware("admin", "interviewer", "foster"),
  [param("animalId").notEmpty().withMessage("Animal ID is required")],
  getApplicationsByAnimal
);
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin", "interviewer"),
  [
    param("id").isInt().withMessage("Valid application ID is required"),
    body("status").notEmpty().withMessage("Status is required"),
  ],
  updateApplicationStatus
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  [param("id").isInt().withMessage("Valid application ID is required")],
  deleteApplication
);

export default router;
