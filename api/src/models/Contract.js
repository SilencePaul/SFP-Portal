import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import Animal from "./Animal.js";

const Contract = sequelize.define(
  "Contract",
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
    payment_proof: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    signature: {
      type: DataTypes.STRING,
      allowNull: false,
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
Contract.belongsTo(Animal, { foreignKey: "animal_id", targetKey: "unique_id" });

export default Contract;
