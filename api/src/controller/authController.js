import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import Volunteer from "../models/Volunteer.js";

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find volunteer in database
    const volunteer = await Volunteer.findOne({ where: { email } });

    if (!volunteer) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      volunteer.password || ""
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Determine role (fallback to COORDINATOR if role column not present)
    const effectiveRole = volunteer.role || "COORDINATOR";

    // Generate JWT token with role
    const token = jwt.sign(
      {
        sub: volunteer.id,
        role: effectiveRole,
        email: volunteer.email,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.status(200).json({
      token,
      volunteer: {
        id: volunteer.id,
        name: `${volunteer.first_name} ${volunteer.last_name}`,
        email: volunteer.email,
        role: effectiveRole,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyToken = async (req, res, next) => {
  try {
    // This route is protected by authMiddleware
    // If we reach here, the token is valid
    res.status(200).json({ message: "Token is valid", user: req.user });
  } catch (error) {
    next(error);
  }
};
