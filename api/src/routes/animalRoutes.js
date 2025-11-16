import express from "express";
import {
  getAllAnimals,
  getAnimalById,
  getAvailableAnimals,
  createAnimal,
  updateAnimal,
  updateAnimalState,
  deleteAnimal,
} from "../controller/animalController.js";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";
import { body } from "express-validator";

const router = express.Router();

// Public routes
router.get("/available", getAvailableAnimals);
router.get("/:id", getAnimalById);
// Volunteer-only: list all animals (internal view)
router.get("/", authMiddleware, roleMiddleware("VOLUNTEER"), getAllAnimals);

// Protected routes (requires authentication)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("Foster", "Coordinator"),
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("species").notEmpty().withMessage("Species is required"),
    body("gender")
      .isIn(["male", "female"])
      .withMessage("Gender must be male or female"),
    body("volunteer_id").isInt().withMessage("Valid volunteer ID is required"),
    body("date_of_birth")
      .isISO8601()
      .withMessage("Valid date of birth is required"),
    body("color").notEmpty().withMessage("Color is required"),
    body("weight").isFloat({ min: 0 }).withMessage("Valid weight is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("price").isFloat({ min: 0 }).withMessage("Valid price is required"),
  ],
  createAnimal
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("Foster", "Coordinator"),
  [
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("species")
      .optional()
      .notEmpty()
      .withMessage("Species cannot be empty"),
    body("gender")
      .optional()
      .isIn(["male", "female"])
      .withMessage("Gender must be male or female"),
    body("volunteer_id")
      .optional()
      .isInt()
      .withMessage("Valid volunteer ID is required"),
    body("date_of_birth")
      .optional()
      .isISO8601()
      .withMessage("Valid date of birth is required"),
    body("color").optional().notEmpty().withMessage("Color cannot be empty"),
    body("weight")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Valid weight is required"),
    body("description")
      .optional()
      .notEmpty()
      .withMessage("Description cannot be empty"),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Valid price is required"),
  ],
  updateAnimal
);

router.patch(
  "/:id/state",
  authMiddleware,
  roleMiddleware("Coordinator", "Adoption Interviewer"),
  [body("status").notEmpty().withMessage("Status is required")],
  updateAnimalState
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("Coordinator"),
  deleteAnimal
);

export default router;
