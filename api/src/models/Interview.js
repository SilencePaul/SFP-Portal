import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import Application from "./Application.js";
import Volunteer from "./Volunteer.js";

const Interview = sequelize.define(
  "Interview",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    application_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "applications",
        key: "id",
      },
    },
    volunteer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "volunteers",
        key: "id",
      },
    },
    volunteer_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    interview_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    interview_result: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    final_decision: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    timestamps: false,
    tableName: "interviews",
  }
);

// Define associations
Interview.belongsTo(Application, { foreignKey: "application_id" });
Interview.belongsTo(Volunteer, { foreignKey: "volunteer_id" });

export default Interview;
