import { sequelize } from "../config/database.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Run database migrations
const runMigrations = async () => {
  try {
    console.log("Running database migrations...");
    console.log(
      "⚠️  This will drop and recreate all tables - ALL DATA WILL BE LOST!"
    );
    console.log("Waiting 3 seconds... (Ctrl+C to cancel)");

    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Drop all tables and recreate them with the new schema
    await sequelize.sync({ force: true });

    console.log("✓ Database schema recreated successfully!");
    console.log("Now run the seed scripts to add initial data:");
    console.log("  - node src/seeds/seedVolunteers.js");

    process.exit(0);
  } catch (error) {
    console.error("Error running migrations:", error);
    process.exit(1);
  }
};

// Execute the migration
runMigrations();
