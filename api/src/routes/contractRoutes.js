import express from "express";
import {
  getAllContracts,
  getContractById,
  getContractsByApplicant,
  getContractsByAnimal,
  createContract,
  updateContractSignature,
  deleteContract,
} from "../controller/contractController.js";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";
import { body, param } from "express-validator";

const router = express.Router();

// Protected routes (all contract routes require authentication)
router.get("/", authMiddleware, roleMiddleware("Coordinator"), getAllContracts);
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("Coordinator", "Applicant"),
  [param("id").isInt().withMessage("Valid contract ID is required")],
  getContractById
);
router.get(
  "/applicant/:applicantId",
  authMiddleware,
  roleMiddleware("Coordinator", "Applicant"),
  [param("applicantId").isInt().withMessage("Valid applicant ID is required")],
  getContractsByApplicant
);
router.get(
  "/animal/:animalId",
  authMiddleware,
  roleMiddleware("Coordinator", "Foster"),
  [param("animalId").notEmpty().withMessage("Animal ID is required")],
  getContractsByAnimal
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("Coordinator"),
  [
    body("applicant_id").isInt().withMessage("Valid applicant ID is required"),
    body("animal_id").notEmpty().withMessage("Valid animal ID is required"),
    body("payment_proof").notEmpty().withMessage("Payment proof is required"),
    body("signature")
      .optional()
      .notEmpty()
      .withMessage("Signature cannot be empty"),
  ],
  createContract
);

router.patch(
  "/:id/signature",
  authMiddleware,
  roleMiddleware("Coordinator", "Applicant"),
  [
    param("id").isInt().withMessage("Valid contract ID is required"),
    body("signature").notEmpty().withMessage("Signature is required"),
  ],
  updateContractSignature
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("Coordinator"),
  [param("id").isInt().withMessage("Valid contract ID is required")],
  deleteContract
);

export default router;
