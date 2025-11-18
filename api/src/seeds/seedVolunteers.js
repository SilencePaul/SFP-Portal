import sequelize from "../config/database.js";
import Volunteer from "../models/Volunteer.js";
import bcrypt from "bcrypt";

async function seedVolunteers() {
  try {
    await sequelize.authenticate();

    const hashed = await bcrypt.hash("password123", 10);

    const volunteers = [
      {
        first_name: "Admin",
        last_name: "User",
        email: "admin@example.com",
        password: hashed,
        role: "admin",
      },
      {
        first_name: "Foster",
        last_name: "User",
        email: "foster@example.com",
        password: hashed,
        role: "foster",
      },
      {
        first_name: "Interviewer",
        last_name: "User",
        email: "interviewer@example.com",
        password: hashed,
        role: "interviewer",
      },
    ];

    for (const v of volunteers) {
      await Volunteer.upsert(v);
    }

    console.log("✓ 3 volunteers seeded/updated");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedVolunteers();
