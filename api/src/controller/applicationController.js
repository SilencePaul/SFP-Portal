import { validationResult } from "express-validator";
import Application from "../models/Application.js";
import Animal from "../models/Animal.js";
import Volunteer from "../models/Volunteer.js";
import Contract from "../models/Contract.js";
import crypto from "crypto";
import {
  sendApplicationConfirmationEmail,
  sendNewApplicationNotificationEmail,
} from "../services/emailService.js";

export const getAllApplications = async (req, res, next) => {
  try {
    const applications = await Application.findAll({
      include: [
        {
          model: Animal,
          attributes: ["unique_id", "name", "species", "image_urls", "status"],
        },
      ],
    });

    res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const applicationId = parseInt(id);

    const application = await Application.findByPk(applicationId, {
      include: [
        {
          model: Animal,
          attributes: ["unique_id", "name", "species", "image_urls", "status"],
        },
      ],
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json(application);
  } catch (error) {
    next(error);
  }
};

export const getApplicationsByAnimal = async (req, res, next) => {
  try {
    const { animalId } = req.params;

    const applications = await Application.findAll({
      where: { animal_id: animalId },
      include: [
        {
          model: Animal,
          attributes: ["unique_id", "name", "species", "image_urls", "status"],
        },
      ],
    });

    res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};

export const createApplication = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { animal_id, ...applicationData } = req.body;

    // Check if animal exists
    const animal = await Animal.findOne({ where: { unique_id: animal_id } });
    if (!animal) {
      return res.status(404).json({ message: "Animal not found" });
    }

    // Create new application
    const newApplication = await Application.create({
      ...applicationData,
      animal_id: animal_id,
      status: "submitted",
    });

    // Return with details
    const applicationWithDetails = await Application.findByPk(
      newApplication.id,
      {
        include: [
          {
            model: Animal,
            attributes: [
              "unique_id",
              "name",
              "species",
              "image_urls",
              "status",
            ],
          },
        ],
      }
    );

    // Send confirmation email (non-blocking)
    sendApplicationConfirmationEmail({
      email: applicationData.email,
      full_name: applicationData.full_name,
      animal_id: animal_id,
      animal_name: animal.name,
      application_id: newApplication.id,
    }).catch((err) => {
      console.error("Failed to send confirmation email:", err);
      // Don't fail the request if email fails
    });

    // Send notification emails to admin and interviewers (non-blocking)
    try {
      const recipients = await Volunteer.findAll({
        where: {
          role: ["admin", "interviewer"],
          status: "active",
        },
        attributes: ["id", "first_name", "last_name", "email"],
      });

      if (recipients.length > 0) {
        const recipientList = recipients.map((r) => ({
          name: `${r.first_name} ${r.last_name}`,
          email: r.email,
        }));

        sendNewApplicationNotificationEmail(
          {
            applicant_name: applicationData.full_name,
            applicant_email: applicationData.email,
            animal_id: animal_id,
            animal_name: animal.name,
            application_id: newApplication.id,
            phone_number: applicationData.phone_number,
            address: applicationData.address,
          },
          recipientList
        ).catch((err) => {
          console.error("Failed to send notification emails:", err);
          // Don't fail the request if email fails
        });
      }
    } catch (err) {
      console.error("Failed to fetch recipients for notification emails:", err);
      // Don't fail the request if email fails
    }

    res.status(201).json(applicationWithDetails);
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const applicationId = parseInt(id);
    const { status } = req.body;

    // Valid application statuses
    const validStatuses = [
      "submitted",
      "interview",
      "interview_scheduled",
      "under_review",
      "approved",
      "rejected",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Get user role
    const userRole = req.user?.role || "";
    const roles = Array.isArray(userRole) ? userRole : [userRole];
    const isAdmin = roles.includes("admin");
    const isInterviewer = roles.includes("interviewer");

    // Role-based authorization
    if (isAdmin) {
      // Admins can change to any status (including reverting approved back to other statuses)
      // No restrictions
    } else if (isInterviewer) {
      // Interviewers can only change to "interview" or "under_review" statuses
      const allowedStatuses = ["interview", "under_review"];
      if (!allowedStatuses.includes(status)) {
        return res.status(403).json({
          message:
            "Interviewers can only set status to 'interview' or 'under_review'",
        });
      }
    } else {
      // Other roles cannot change application status
      return res.status(403).json({
        message: "You don't have permission to update application status",
      });
    }

    // Find application in database
    const application = await Application.findByPk(applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const oldStatus = application.status;

    // Update status
    await application.update({ status });

    console.log(
      `✅ Application #${applicationId} status changed from "${oldStatus}" to "${status}" by ${
        isAdmin ? "admin" : "interviewer"
      }`
    );

    // If status changed to "approved", create contract and send email with token
    if (status === "approved" && oldStatus !== "approved") {
      try {
        // Get animal details
        const animal = await Animal.findOne({
          where: { unique_id: application.animal_id },
          attributes: ["id", "unique_id", "name", "species", "adoption_fee"],
        });

        if (animal) {
          // Generate secure token (48-hour expiry)
          const token = crypto.randomBytes(32).toString("hex");
          const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now

          // Create or update contract with token
          const [contract] = await Contract.findOrCreate({
            where: {
              application_id: applicationId,
              animal_id: animal.unique_id,
            },
            defaults: {
              application_id: applicationId,
              animal_id: animal.unique_id,
              adoption_fee: animal.adoption_fee,
              contract_token: token,
              token_expires_at: expiresAt,
              token_used: false,
            },
          });

          // If contract already existed, update it with new token
          if (!contract._options.isNewRecord) {
            await contract.update({
              contract_token: token,
              token_expires_at: expiresAt,
              token_used: false,
            });
          }

          // Generate contract signing link
          const frontendUrl =
            process.env.FRONTEND_URL || "http://localhost:3000";
          const contractLink = `${frontendUrl}/contract/sign?token=${token}`;

          // Send contract email (import from emailService.js)
          const { sendContractEmail } = await import(
            "../services/emailService.js"
          );
          await sendContractEmail({
            adopter_name: application.full_name,
            adopter_email: application.email,
            animal_name: animal.name,
            animal_id: animal.unique_id,
            contract_link: contractLink,
            expires_in_hours: 48,
          });

          console.log(
            `📧 Contract email sent to ${application.email} with token (expires in 48 hours)`
          );

          // Update animal status to "reserved" (will change to "adopted" after contract is signed)
          await animal.update({ status: "reserved" });
          console.log(
            `🔒 Animal ${animal.unique_id} status changed to "reserved" (pending contract signature)`
          );
        }
      } catch (error) {
        console.error(
          "⚠️  Application approved but contract email failed:",
          error
        );
        // Don't fail the request if email fails
      }
    }

    // Return with details
    const updatedApplication = await Application.findByPk(applicationId, {
      include: [
        {
          model: Animal,
          attributes: ["unique_id", "name", "species", "image_urls", "status"],
        },
      ],
    });

    res.status(200).json(updatedApplication);
  } catch (error) {
    next(error);
  }
};

export const deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const applicationId = parseInt(id);

    // Find application in database
    const application = await Application.findByPk(applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Delete from database
    await application.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
