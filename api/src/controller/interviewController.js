import { validationResult } from "express-validator";
import Interview from "../models/Interview.js";
import Application from "../models/Application.js";
import Volunteer from "../models/Volunteer.js";

// Get all interviews (admin only) or assigned interviews (interviewer)
export const getAllInterviews = async (req, res, next) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    let whereClause = {};

    // Interviewers can only see interviews assigned to them
    if (userRole === "interviewer") {
      whereClause = { volunteer_id: userId };
    }
    // Admin can see all interviews (no where clause)

    const interviews = await Interview.findAll({
      where: whereClause,
      include: [
        {
          model: Application,
          attributes: [
            "id",
            "animal_id",
            "status",
            "full_name",
            "email",
            "phone",
          ],
        },
        {
          model: Volunteer,
          attributes: ["id", "first_name", "last_name", "email", "role"],
        },
      ],
      order: [["interview_time", "DESC"]],
    });

    res.status(200).json(interviews);
  } catch (error) {
    next(error);
  }
};

// Get interview by ID (admin sees all, interviewer sees only assigned)
export const getInterviewById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const interviewId = parseInt(id);
    const userRole = req.user?.role;
    const userId = req.user?.id;

    const interview = await Interview.findByPk(interviewId, {
      include: [
        {
          model: Application,
          attributes: [
            "id",
            "animal_id",
            "status",
            "full_name",
            "email",
            "phone",
          ],
        },
        {
          model: Volunteer,
          attributes: ["id", "first_name", "last_name", "email", "role"],
        },
      ],
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Interviewer can only see interviews assigned to them
    if (userRole === "interviewer" && interview.volunteer_id !== userId) {
      return res
        .status(403)
        .json({ message: "Access denied: not assigned to this interview" });
    }

    res.status(200).json(interview);
  } catch (error) {
    next(error);
  }
};

// Get interviews by application (admin only)
export const getInterviewsByApplication = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const id = parseInt(applicationId);

    const interviews = await Interview.findAll({
      where: { application_id: id },
      include: [
        {
          model: Application,
          attributes: [
            "id",
            "animal_id",
            "status",
            "full_name",
            "email",
            "phone",
          ],
        },
        {
          model: Volunteer,
          attributes: ["id", "first_name", "last_name", "email", "role"],
        },
      ],
    });

    res.status(200).json(interviews);
  } catch (error) {
    next(error);
  }
};

// Create interview (admin only) - requires application_id and volunteer_id (interviewer)
export const createInterview = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { application_id, volunteer_id, interview_time } = req.body;

    // Check if application exists
    const application = await Application.findByPk(application_id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Check if volunteer (interviewer) exists
    const volunteer = await Volunteer.findByPk(volunteer_id);
    if (!volunteer) {
      return res.status(404).json({ message: "Interviewer not found" });
    }

    // Ensure selected volunteer has interviewer role
    if (volunteer.role !== "interviewer" && volunteer.role !== "admin") {
      return res
        .status(400)
        .json({
          message: "Selected volunteer must have interviewer or admin role",
        });
    }

    // Get volunteer name
    const volunteerName = `${volunteer.first_name} ${volunteer.last_name}`;

    // Create new interview
    const newInterview = await Interview.create({
      application_id,
      volunteer_id,
      volunteer_name: volunteerName,
      interview_time: interview_time || null,
      interview_result: null,
      final_decision: "pending",
    });

    // Return with details
    const interviewWithDetails = await Interview.findByPk(newInterview.id, {
      include: [
        {
          model: Application,
          attributes: [
            "id",
            "animal_id",
            "status",
            "full_name",
            "email",
            "phone",
          ],
        },
        {
          model: Volunteer,
          attributes: ["id", "first_name", "last_name", "email", "role"],
        },
      ],
    });

    res.status(201).json(interviewWithDetails);
  } catch (error) {
    next(error);
  }
};

// Update interview (different logic for admin vs interviewer)
export const updateInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const interviewId = parseInt(id);
    const userRole = req.user?.role;
    const userId = req.user?.id;

    const { interview_time, interview_result, final_decision } = req.body;

    // Find interview in database
    const interview = await Interview.findByPk(interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Interviewer can only update interviews assigned to them
    if (userRole === "interviewer" && interview.volunteer_id !== userId) {
      return res
        .status(403)
        .json({ message: "Access denied: not assigned to this interview" });
    }

    const updates = {};

    // Interview time logic: can only be set once
    if (interview_time !== undefined) {
      if (interview.interview_time) {
        return res
          .status(400)
          .json({
            message: "Interview time already set and cannot be updated",
          });
      }
      updates.interview_time = interview_time;
    }

    // Interview result: interviewer can set, admin can modify
    if (interview_result !== undefined) {
      updates.interview_result = interview_result;
    }

    // Final decision: only admin can set
    if (final_decision !== undefined) {
      if (userRole !== "admin") {
        return res
          .status(403)
          .json({ message: "Only admin can set final decision" });
      }
      if (!["pending", "approved", "rejected"].includes(final_decision)) {
        return res
          .status(400)
          .json({ message: "Invalid final decision value" });
      }
      updates.final_decision = final_decision;
    }

    // Update interview
    await interview.update(updates);

    // Return with details
    const updatedInterview = await Interview.findByPk(interviewId, {
      include: [
        {
          model: Application,
          attributes: [
            "id",
            "animal_id",
            "status",
            "full_name",
            "email",
            "phone",
          ],
        },
        {
          model: Volunteer,
          attributes: ["id", "first_name", "last_name", "email", "role"],
        },
      ],
    });

    res.status(200).json(updatedInterview);
  } catch (error) {
    next(error);
  }
};

// Delete interview (admin only)
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
