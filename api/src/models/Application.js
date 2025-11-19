import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import Animal from "./Animal.js";

const Application = sequelize.define(
  "Application",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    animal_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "animals",
        key: "unique_id",
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "submitted",
      validate: {
        isIn: [
          [
            "submitted",
            "interview",
            "interview_scheduled",
            "under_review",
            "approved",
            "rejected",
          ],
        ],
      },
    },
    // Personal Information
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    zip_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    // Home Environment
    household_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    has_children: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    children_ages: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    has_other_pets: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    other_pets_details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Pet Experience
    experience_with_pets: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    hours_away: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    reason_for_adoption: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // Emergency Contact
    emergency_contact_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    emergency_contact_phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    // Terms
    agreed_to_terms: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    tableName: "applications",
  }
);

// Define associations
Application.belongsTo(Animal, {
  foreignKey: "animal_id",
  targetKey: "unique_id",
});

export default Application;
