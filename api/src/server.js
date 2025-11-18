import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { sequelize, testConnection, useMockDB } from "./config/database.js";
import { mockUsers, mockAnimals } from "./mockData.js";

import animalRoutes from "./routes/animalRoutes.js";
import volunteerRoutes from "./routes/volunteerRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import contractRoutes from "./routes/contractRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import redis from "./config/redis.js";
import register, { metricsMiddleware } from "./middleware/metrics.js";
import client from "prom-client";

// Import all models to ensure they are registered with Sequelize
import "./models/index.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Metrics middleware: simple instrumentation for Prometheus
app.use(metricsMiddleware);

// Helpers
const generatePassword = () => {
  const adjectives = [
    "Happy",
    "Sunny",
    "Clever",
    "Bright",
    "Lucky",
    "Swift",
    "Brave",
    "Kind",
  ];
  const nouns = ["Cat", "Dog", "Bird", "Fish", "Bear", "Lion", "Fox", "Owl"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `${adj}${noun}${num}`;
};

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/animals", animalRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/contracts", contractRoutes);

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    // Test database connection with a simple query
    const result = await sequelize.query("SELECT 1");
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      database: "connected",
      redis: "disconnected",
    });
  } catch (error) {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      database: "disconnected",
      databaseError: error.message,
    });
  }
});

// Prometheus metrics endpoint
app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// Database migration endpoint
app.post("/api/migrate", async (req, res) => {
  if (process.env.NODE_ENV === "production" && !req.body.force) {
    return res
      .status(403)
      .json({ message: "Not available in production without force parameter" });
  }

  try {
    // Synchronize all models with the database
    await sequelize.sync({ force: req.body.force || false });
    res.status(200).json({ message: "Database migrated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error migrating database", error: error.message });
  }
});

// Error handling middleware
app.use(errorHandler);

// Start server function
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Database schema is managed via migrations (src/migrations/runMigrations.js)
    // No auto-sync needed - tables are already created correctly
    console.log("✓ Using migration-managed schema");

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(
        `✓ Server running on port ${PORT} (${
          useMockDB ? "MOCK DATA MODE" : "LIVE DATABASE"
        })`
      );
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Export app for testing
export default app;
