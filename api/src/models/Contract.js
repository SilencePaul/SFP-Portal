import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import Animal from "./Animal.js";
import Application from "./Application.js";

const Contract = sequelize.define(
  "Contract",
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
    animal_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "animals",
        key: "unique_id",
      },
    },
    payment_proof: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    signature: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    tableName: "contracts",
  }
);

// Define associations
Contract.belongsTo(Application, { foreignKey: "application_id" });
Contract.belongsTo(Animal, { foreignKey: "animal_id", targetKey: "unique_id" });

export default Contract;
