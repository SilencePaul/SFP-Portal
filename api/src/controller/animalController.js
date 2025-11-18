import { validationResult } from "express-validator";
import Animal from "../models/Animal.js";
import Volunteer from "../models/Volunteer.js";

export const getAllAnimals = async (req, res, next) => {
  try {
    const userRole = String(req.user?.role || "").toLowerCase();
    const userId = req.user?.sub;

    let whereClause = {};

    // Foster can only see animals they created
    if (userRole === "foster") {
      whereClause.volunteer_id = Number(userId);
    }
    // Admin sees all animals

    const animals = await Animal.findAll({
      where: whereClause,
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

    // Foster can only view animals they created
    const userRole = String(req.user?.role || "").toLowerCase();
    const userId = req.user?.sub;

    if (
      userRole === "foster" &&
      Number(animal.volunteer_id) !== Number(userId)
    ) {
      return res
        .status(403)
        .json({ message: "You can only view animals you created" });
    }

    res.status(200).json(animal);
  } catch (error) {
    next(error);
  }
};

export const getAvailableAnimals = async (req, res, next) => {
  try {
    const availableAnimals = await Animal.findAll({
      where: { status: "published" },
      include: [{ model: Volunteer }],
    });

    res.status(200).json(availableAnimals);
  } catch (error) {
    next(error);
  }
};

export const getAdoptedAnimals = async (req, res, next) => {
  try {
    const adoptedAnimals = await Animal.findAll({
      where: { status: "adopted" },
      include: [{ model: Volunteer }],
    });

    res.status(200).json(adoptedAnimals);
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

    const userRole = String(req.user?.role || "").toLowerCase();
    const userId = req.user?.sub;

    let creatorVolunteerId = volunteer_id;

    if (userRole === "foster") {
      // Foster always creates animals for themselves
      creatorVolunteerId = Number(userId);
    } else if (userRole === "admin") {
      // Admin can specify volunteer_id or default to themselves
      creatorVolunteerId = volunteer_id || Number(userId);
    } else {
      // Only admin and foster can create animals
      return res
        .status(403)
        .json({ message: "Only admin and foster can create animals" });
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

    // Only admin can update animals
    const userRole = String(req.user?.role || "").toLowerCase();

    if (userRole !== "admin") {
      return res.status(403).json({ message: "Only admin can update animals" });
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

    // Only admin can change animal status
    const userRole = String(req.user?.role || "").toLowerCase();

    if (userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin can update animal status" });
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

    // Only admin can delete animals
    const userRole = String(req.user?.role || "").toLowerCase();

    if (userRole !== "admin") {
      return res.status(403).json({ message: "Only admin can delete animals" });
    }

    // Delete from database
    await animal.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
