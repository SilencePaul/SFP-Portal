import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const AuditLog = sequelize.define(
  "AuditLog",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    entity_type: {
      type: DataTypes.ENUM(
        "ANIMAL",
        "APPLICATION",
        "INTERVIEW",
        "CONTRACT",
        "USER"
      ),
      allowNull: false,
    },
    entity_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    actor_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    from_value: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    to_value: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    tableName: "audit_logs",
  }
);

export default AuditLog;
