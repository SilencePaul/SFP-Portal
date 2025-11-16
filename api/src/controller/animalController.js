import { validationResult } from "express-validator";
import Animal from "../models/Animal.js";
import Volunteer from "../models/Volunteer.js";

export const getAllAnimals = async (req, res, next) => {
  try {
    const animals = await Animal.findAll({
      include: [{ model: Volunteer }],
    });
    res.status(200).json(animals);
  } catch (error) {
    next(error);
  }
};

export const getAnimalById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const animal = await Animal.findByPk(id, {
      include: [{ model: Volunteer }],
    });

    if (!animal) {
      return res.status(404).json({ message: "Animal not found" });
    }

    res.status(200).json(animal);
  } catch (error) {
    next(error);
  }
};

export const getAvailableAnimals = async (req, res, next) => {
  try {
    const availableAnimals = await Animal.findAll({
      where: { status: "Published" },
      include: [{ model: Volunteer }],
    });

    res.status(200).json(availableAnimals);
  } catch (error) {
    next(error);
  }
};

export const createAnimal = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { volunteer_id, ...animalData } = req.body;

    // If the requester is a foster, ensure they create with their own volunteer id
    const userRole = String(req.user?.role || "").toUpperCase();
    const userId = req.user?.sub;

    let creatorVolunteerId = volunteer_id;
    if (userRole === "FOSTER") {
      // If a foster tries to create for another volunteer, deny
      if (volunteer_id && parseInt(volunteer_id) !== Number(userId)) {
        return res
          .status(403)
          .json({ message: "Fosters can only create animals for themselves" });
      }
      creatorVolunteerId = Number(userId);
    }

    // Check if volunteer exists
    const volunteer = await Volunteer.findByPk(creatorVolunteerId);

    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    // Generate unique_id
    const lastAnimal = await Animal.findOne({
      order: [["created_at", "DESC"]],
    });

    let nextNumber = 1;
    if (lastAnimal) {
      const lastId = lastAnimal.unique_id;
      const match = lastId.match(/^SFP-(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    const uniqueId = `SFP-${String(nextNumber).padStart(3, "0")}`;

    // Create new animal in database
    const newAnimal = await Animal.create({
      ...animalData,
      unique_id: uniqueId,
      volunteer_id: volunteer.id,
    });

    // Include volunteer data in response
    const animalWithVolunteer = await Animal.findByPk(uniqueId, {
      include: [{ model: Volunteer }],
    });

    res.status(201).json(animalWithVolunteer);
  } catch (error) {
    next(error);
  }
};

export const updateAnimal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { volunteer_id, ...updateData } = req.body;

    // Find animal in database
    const animal = await Animal.findByPk(id);

    if (!animal) {
      return res.status(404).json({ message: "Animal not found" });
    }

    // Authorization: FOSTER can only edit animals they created; COORDINATOR can edit all
    const userRole = String(req.user?.role || "").toUpperCase();
    const userId = req.user?.sub;
    if (userRole === "FOSTER") {
      if (Number(animal.volunteer_id) !== Number(userId)) {
        return res
          .status(403)
          .json({ message: "Fosters can only edit their own animals" });
      }
    }

    // Update volunteer if provided
    if (volunteer_id) {
      const volunteer = await Volunteer.findByPk(volunteer_id);

      if (!volunteer) {
        return res.status(404).json({ message: "Volunteer not found" });
      }

      updateData.volunteer_id = volunteer.id;
    }

    // Update animal in database
    await animal.update(updateData);

    // Include volunteer data in response
    const updatedAnimal = await Animal.findByPk(id, {
      include: [{ model: Volunteer }],
    });

    res.status(200).json(updatedAnimal);
  } catch (error) {
    next(error);
  }
};

export const updateAnimalState = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Find animal in database
    const animal = await Animal.findByPk(id);

    if (!animal) {
      return res.status(404).json({ message: "Animal not found" });
    }

    // Authorization: FOSTER can only change status for their own animals; COORDINATOR can change any
    const userRole = String(req.user?.role || "").toUpperCase();
    const userId = req.user?.sub;
    if (userRole === "FOSTER") {
      if (Number(animal.volunteer_id) !== Number(userId)) {
        return res.status(403).json({
          message: "Fosters can only change status for their own animals",
        });
      }
    }

    // Update status in database
    await animal.update({ status });

    // Include volunteer data in response
    const updatedAnimal = await Animal.findByPk(id, {
      include: [{ model: Volunteer }],
    });

    res.status(200).json(updatedAnimal);
  } catch (error) {
    next(error);
  }
};

export const deleteAnimal = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find animal in database
    const animal = await Animal.findByPk(id);

    if (!animal) {
      return res.status(404).json({ message: "Animal not found" });
    }

    // Authorization: FOSTER can only delete their own animals; COORDINATOR can delete any
    const userRole = String(req.user?.role || "").toUpperCase();
    const userId = req.user?.sub;
    if (userRole === "FOSTER") {
      if (Number(animal.volunteer_id) !== Number(userId)) {
        return res
          .status(403)
          .json({ message: "Fosters can only delete their own animals" });
      }
    }

    // Delete from database
    await animal.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
