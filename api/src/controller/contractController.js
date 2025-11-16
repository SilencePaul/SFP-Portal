import { validationResult } from "express-validator";
import Contract from "../models/Contract.js";
import Animal from "../models/Animal.js";

export const getAllContracts = async (req, res, next) => {
  try {
    const contracts = await Contract.findAll({
      include: [
        {
          model: Applicant,
          attributes: ["id", "first_name", "last_name", "email"],
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
          model: Applicant,
          attributes: ["id", "first_name", "last_name", "email"],
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

export const getContractsByApplicant = async (req, res, next) => {
  try {
    const { applicantId } = req.params;
    const id = parseInt(applicantId);

    const contracts = await Contract.findAll({
      where: { applicant_id: id },
      include: [
        {
          model: Applicant,
          attributes: ["id", "first_name", "last_name", "email"],
        },
        { model: Animal, attributes: ["unique_id", "name", "species"] },
      ],
    });

    res.status(200).json(contracts);
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
        {
          model: Applicant,
          attributes: ["id", "first_name", "last_name", "email"],
        },
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

    const { applicant_id, animal_id, ...contractData } = req.body;

    // Check if applicant exists
    const applicant = await Applicant.findByPk(applicant_id);
    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    // Check if animal exists
    const animal = await Animal.findByPk(animal_id);
    if (!animal) {
      return res.status(404).json({ message: "Animal not found" });
    }

    // Create new contract
    const newContract = await Contract.create({
      ...contractData,
      applicant_id: applicant_id,
      animal_id: animal_id,
    });

    // Return with details
    const contractWithDetails = await Contract.findByPk(newContract.id, {
      include: [
        {
          model: Applicant,
          attributes: ["id", "first_name", "last_name", "email"],
        },
        { model: Animal, attributes: ["unique_id", "name", "species"] },
      ],
    });

    res.status(201).json(contractWithDetails);
  } catch (error) {
    next(error);
  }
};

export const updateContractSignature = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contractId = parseInt(id);
    const { signature } = req.body;

    // Find contract in database
    const contract = await Contract.findByPk(contractId);

    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    // Update signature
    await contract.update({ signature });

    // Return with details
    const updatedContract = await Contract.findByPk(contractId, {
      include: [
        {
          model: Applicant,
          attributes: ["id", "first_name", "last_name", "email"],
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
