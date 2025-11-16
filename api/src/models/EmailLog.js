import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const EmailLog = sequelize.define(
  "EmailLog",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    to: { type: DataTypes.STRING, allowNull: false },
    subject: { type: DataTypes.STRING, allowNull: false },
    template: { type: DataTypes.STRING, allowNull: false },
    payload: { type: DataTypes.JSONB, allowNull: true },
    status: {
      type: DataTypes.ENUM("QUEUED", "SENT", "FAILED"),
      allowNull: false,
      defaultValue: "QUEUED",
    },
    error_message: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    tableName: "email_logs",
  }
);

export default EmailLog;
