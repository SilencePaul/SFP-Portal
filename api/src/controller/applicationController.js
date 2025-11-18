import { validationResult } from "express-validator";
import Application from "../models/Application.js";
import Animal from "../models/Animal.js";
import { sendApplicationConfirmationEmail, sendApplicationStatusUpdateEmail } from "../services/emailService.js";

export const getAllApplications = async (req, res, next) => {
  try {
    const applications = await Application.findAll({
      include: [
        {
          model: Animal,
          attributes: ["unique_id", "name", "species", "image_urls"],
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
          attributes: ["unique_id", "name", "species", "image_urls"],
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
          attributes: ["unique_id", "name", "species", "image_urls"],
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
            attributes: ["unique_id", "name", "species", "image_urls"],
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
    }).catch(err => {
      console.error('Failed to send confirmation email:', err);
      // Don't fail the request if email fails
    });

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

    // Find application in database
    const application = await Application.findByPk(applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const oldStatus = application.status;

    // Update status
    await application.update({ status });

    // Return with details
    const updatedApplication = await Application.findByPk(applicationId, {
      include: [
        {
          model: Animal,
          attributes: ["unique_id", "name", "species", "image_urls"],
        },
      ],
    });

    // Send status update email if status changed (non-blocking)
    if (oldStatus !== status) {
      const animal = updatedApplication.Animal;
      sendApplicationStatusUpdateEmail({
        email: application.email,
        full_name: application.full_name,
        animal_id: application.animal_id,
        animal_name: animal?.name || 'Animal',
        application_id: application.id,
      }, status).catch(err => {
        console.error('Failed to send status update email:', err);
        // Don't fail the request if email fails
      });
    }

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
