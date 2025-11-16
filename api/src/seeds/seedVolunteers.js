import bcrypt from "bcrypt";
import { sequelize } from "../config/database.js";
import Volunteer from "../models/Volunteer.js";

const seedVolunteers = async () => {
  try {
    await sequelize.authenticate();
    console.log("✓ Database connected");

    const volunteers = [
      {
        email: "foster@example.com",
        password: await bcrypt.hash("password123", 10),
        first_name: "Foster",
        last_name: "User",
        role: "foster",
      },
      {
        email: "interviewer@example.com",
        password: await bcrypt.hash("password123", 10),
        first_name: "Interviewer",
        last_name: "User",
        role: "interviewer",
      },
      {
        email: "admin@example.com",
        password: await bcrypt.hash("password123", 10),
        first_name: "Admin",
        last_name: "User",
        role: "admin",
      },
    ];

    for (const volunteerData of volunteers) {
      const existing = await Volunteer.findOne({
        where: { email: volunteerData.email },
      });

      if (existing) {
        await existing.update(volunteerData);
        console.log(`✓ Updated volunteer: ${volunteerData.email}`);
      } else {
        await Volunteer.create(volunteerData);
        console.log(`✓ Created volunteer: ${volunteerData.email}`);
      }
    }

    console.log("\n✓ All volunteers seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("✗ Error seeding volunteers:", error);
    process.exit(1);
  }
};

seedVolunteers();
