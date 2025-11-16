import { validationResult } from "express-validator";
import Interview from "../models/Interview.js";
import Application from "../models/Application.js";
import Volunteer from "../models/Volunteer.js";

export const getAllInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.findAll({
      include: [
        { model: Application, attributes: ["id", "status"] },
        {
          model: Volunteer,
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: Applicant,
          attributes: ["id", "first_name", "last_name", "email"],
        },
      ],
    });

    res.status(200).json(interviews);
  } catch (error) {
    next(error);
  }
};

export const getInterviewById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const interviewId = parseInt(id);

    const interview = await Interview.findByPk(interviewId, {
      include: [
        { model: Application, attributes: ["id", "status"] },
        {
          model: Volunteer,
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: Applicant,
          attributes: ["id", "first_name", "last_name", "email"],
        },
      ],
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    res.status(200).json(interview);
  } catch (error) {
    next(error);
  }
};

export const getInterviewsByApplication = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const id = parseInt(applicationId);

    const interviews = await Interview.findAll({
      where: { application_id: id },
      include: [
        { model: Application, attributes: ["id", "status"] },
        {
          model: Volunteer,
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: Applicant,
          attributes: ["id", "first_name", "last_name", "email"],
        },
      ],
    });

    res.status(200).json(interviews);
  } catch (error) {
    next(error);
  }
};

export const getInterviewsByVolunteer = async (req, res, next) => {
  try {
    const { volunteerId } = req.params;
    const id = parseInt(volunteerId);

    const interviews = await Interview.findAll({
      where: { volunteer_id: id },
      include: [
        { model: Application, attributes: ["id", "status"] },
        {
          model: Volunteer,
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: Applicant,
          attributes: ["id", "first_name", "last_name", "email"],
        },
      ],
    });

    res.status(200).json(interviews);
  } catch (error) {
    next(error);
  }
};

export const scheduleInterview = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { application_id, volunteer_id, applicant_id, ...interviewData } =
      req.body;

    // Check if application exists
    const application = await Application.findByPk(application_id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Check if volunteer exists
    const volunteer = await Volunteer.findByPk(volunteer_id);
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    // Check if applicant exists
    const applicant = await Applicant.findByPk(applicant_id);
    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    // Get volunteer name
    const volunteerName = `${volunteer.first_name} ${volunteer.last_name}`;

    // Create new interview
    const newInterview = await Interview.create({
      ...interviewData,
      application_id: application_id,
      volunteer_id: volunteer_id,
      volunteer_name: volunteerName,
      applicant_id: applicant_id,
    });

    // Return with details
    const interviewWithDetails = await Interview.findByPk(newInterview.id, {
      include: [
        { model: Application, attributes: ["id", "status"] },
        {
          model: Volunteer,
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: Applicant,
          attributes: ["id", "first_name", "last_name", "email"],
        },
      ],
    });

    res.status(201).json(interviewWithDetails);
  } catch (error) {
    next(error);
  }
};

export const updateInterviewResult = async (req, res, next) => {
  try {
    const { id } = req.params;
    const interviewId = parseInt(id);
    const { interview_result } = req.body;

    // Find interview in database
    const interview = await Interview.findByPk(interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Update result
    await interview.update({ interview_result });

    // Return with details
    const updatedInterview = await Interview.findByPk(interviewId, {
      include: [
        { model: Application, attributes: ["id", "status"] },
        {
          model: Volunteer,
          attributes: ["id", "first_name", "last_name", "email"],
        },
        {
          model: Applicant,
          attributes: ["id", "first_name", "last_name", "email"],
        },
      ],
    });

    res.status(200).json(updatedInterview);
  } catch (error) {
    next(error);
  }
};

export const deleteInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const interviewId = parseInt(id);

    // Find interview in database
    const interview = await Interview.findByPk(interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Delete from database
    await interview.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
