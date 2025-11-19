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

    // Set httpOnly cookie for the token
    // Note: secure flag disabled for HTTP-only deployment (enable when using HTTPS)
    res.cookie("auth_token", token, {
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      secure: false, // Set to true when using HTTPS
      sameSite: "lax", // CSRF protection
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/",
    });

    // Set a separate cookie for user info (readable by frontend)
    const userInfo = {
      id: volunteer.id,
      name: `${volunteer.first_name} ${volunteer.last_name}`,
      email: volunteer.email,
      role: [effectiveRole], // Array format for frontend
      isAuthenticated: true,
    };

    res.cookie("user_info", JSON.stringify(userInfo), {
      httpOnly: false, // Frontend can read this
      secure: false, // Set to true when using HTTPS
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    console.log("✅ Cookies set for user:", userInfo.email);

    res.status(200).json({
      message: "Login successful",
      volunteer: userInfo,
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

export const logout = async (req, res, next) => {
  try {
    // Clear both cookies
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    res.clearCookie("user_info", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    // This route is protected by authMiddleware
    // req.user is set by the middleware after verifying the token
    const volunteer = await Volunteer.findByPk(req.user.sub);

    if (!volunteer) {
      return res.status(404).json({ message: "User not found" });
    }

    const userInfo = {
      id: volunteer.id,
      name: `${volunteer.first_name} ${volunteer.last_name}`,
      email: volunteer.email,
      role: volunteer.role || "COORDINATOR",
      isAuthenticated: true,
    };

    res.status(200).json({ volunteer: userInfo });
  } catch (error) {
    next(error);
  }
};
