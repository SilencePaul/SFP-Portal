import { validationResult } from "express-validator";
import Contract from "../models/Contract.js";
import Animal from "../models/Animal.js";
import Application from "../models/Application.js";

export const getAllContracts = async (req, res, next) => {
  try {
    const contracts = await Contract.findAll({
      include: [
        {
          model: Application,
          attributes: ["id", "full_name", "email", "status"],
        },
        { model: Animal, attributes: ["unique_id", "name", "species"] },
      ],
    });

    res.status(200).json(contracts);
  } catch (error) {
    next(error);
  }
};

export const getContractById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contractId = parseInt(id);

    const contract = await Contract.findByPk(contractId, {
      include: [
        {
          model: Application,
          attributes: ["id", "full_name", "email", "status"],
        },
        { model: Animal, attributes: ["unique_id", "name", "species"] },
      ],
    });

    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    res.status(200).json(contract);
  } catch (error) {
    next(error);
  }
};

export const getContractsByAnimal = async (req, res, next) => {
  try {
    const { animalId } = req.params;

    const contracts = await Contract.findAll({
      where: { animal_id: animalId },
      include: [
        { model: Animal, attributes: ["unique_id", "name", "species"] },
      ],
    });

    res.status(200).json(contracts);
  } catch (error) {
    next(error);
  }
};

export const createContract = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { application_id, ...contractData } = req.body;

    // Check if application exists
    const application = await Application.findByPk(application_id, {
      include: [{ model: Animal, attributes: ["unique_id"] }],
    });
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Create new contract
    const newContract = await Contract.create({
      ...contractData,
      application_id: application_id,
      animal_id: application.animal_id,
    });

    // Return with details
    const contractWithDetails = await Contract.findByPk(newContract.id, {
      include: [
        {
          model: Application,
          attributes: ["id", "full_name", "email", "status"],
        },
        { model: Animal, attributes: ["unique_id", "name", "species"] },
      ],
    });

    res.status(201).json(contractWithDetails);
  } catch (error) {
    next(error);
  }
};

export const updateContract = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contractId = parseInt(id);
    const updateData = req.body;

    // Find contract in database
    const contract = await Contract.findByPk(contractId);

    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    // Update contract
    await contract.update(updateData);

    // Return with details
    const updatedContract = await Contract.findByPk(contractId, {
      include: [
        {
          model: Application,
          attributes: ["id", "full_name", "email", "status"],
        },
        { model: Animal, attributes: ["unique_id", "name", "species"] },
      ],
    });

    res.status(200).json(updatedContract);
  } catch (error) {
    next(error);
  }
};

export const deleteContract = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contractId = parseInt(id);

    // Find contract in database
    const contract = await Contract.findByPk(contractId);

    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    // Delete from database
    await contract.destroy();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
