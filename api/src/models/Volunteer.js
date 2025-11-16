import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Volunteer = sequelize.define(
  "Volunteer",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("foster", "interviewer", "admin"),
      allowNull: false,
      defaultValue: "foster",
    },
  },
  {
    timestamps: false,
    tableName: "volunteers",
  }
);

export default Volunteer;
