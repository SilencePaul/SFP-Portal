import { validationResult } from "express-validator";
import Application from "../models/Application.js";
import Animal from "../models/Animal.js";

export const getAllApplications = async (req, res, next) => {
  try {
    const applications = await Application.findAll({
      include: [
        {
          model: Animal,
          attributes: ["unique_id", "name", "species", "photo_gallery"],
        },
        {
          model: Applicant,
          attributes: ["id", "first_name", "last_name", "email"],
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
          attributes: ["unique_id", "name", "species", "photo_gallery"],
        },
        {
          model: Applicant,
          attributes: ["id", "first_name", "last_name", "email"],
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
          attributes: ["unique_id", "name", "species", "photo_gallery"],
        },
        {
          model: Applicant,
          attributes: ["id", "first_name", "last_name", "email"],
        },
      ],
    });

    res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};

export const getApplicationsByApplicant = async (req, res, next) => {
  try {
    const { applicantId } = req.params;
    const id = parseInt(applicantId);

    const applications = await Application.findAll({
      where: { applicant_id: id },
      include: [
        {
          model: Animal,
          attributes: ["unique_id", "name", "species", "photo_gallery"],
        },
        {
          model: Applicant,
          attributes: ["id", "first_name", "last_name", "email"],
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

    const { animal_id, applicant_id, ...applicationData } = req.body;

    // Check if animal exists
    const animal = await Animal.findByPk(animal_id);
    if (!animal) {
      return res.status(404).json({ message: "Animal not found" });
    }

    // Check if applicant exists
    const applicant = await Applicant.findByPk(applicant_id);
    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    // Create new application
    const newApplication = await Application.create({
      ...applicationData,
      animal_id: animal_id,
      applicant_id: applicant_id,
    });

    // Return with details
    const applicationWithDetails = await Application.findByPk(
      newApplication.id,
      {
        include: [
          {
            model: Animal,
            attributes: ["unique_id", "name", "species", "photo_gallery"],
          },
          {
            model: Applicant,
            attributes: ["id", "first_name", "last_name", "email"],
          },
        ],
      }
    );

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

    // Update status
    await application.update({ status });

    // Return with details
    const updatedApplication = await Application.findByPk(applicationId, {
      include: [
        {
          model: Animal,
          attributes: ["unique_id", "name", "species", "photo_gallery"],
        },
        {
          model: Applicant,
          attributes: ["id", "first_name", "last_name", "email"],
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
