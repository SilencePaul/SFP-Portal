import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Only load .env if we're not in a containerized environment
// (Docker sets env vars directly, so .env shouldn't override them)
if (!process.env.DB_HOST) {
  dotenv.config();
}

// Flag to indicate if we're running in mock/development mode
let useMockDB = false;

// Create PostgreSQL connection using Sequelize
const useSSL = process.env.DB_SSL === "true";

const sequelize = new Sequelize(
  process.env.DB_NAME || "sfp_portal",
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false, // Disable logging to avoid deprecation warning
    connectionTimeoutMillis: 5001,
    ssl: useSSL,
    dialectOptions: useSSL
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
  }
);

// Test the database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✓ Database connection has been established successfully.");
    useMockDB = false;
  } catch (error) {
    console.error("✗ Unable to connect to the database:", error.message);
    // In development, continue with mock data if DB connection fails
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "⚠ Continuing with MOCK DATA mode for development/testing..."
      );
      console.warn(
        "⚠ To use real database: ensure PostgreSQL is running on port 5432"
      );
      useMockDB = true;
    } else {
      console.error("Production mode requires a working database connection.");
      process.exit(1);
    }
  }
};

testConnection();

export { sequelize, useMockDB, testConnection };
export default sequelize;
