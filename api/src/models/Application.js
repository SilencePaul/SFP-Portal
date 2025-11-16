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
    },
    answers: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
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
