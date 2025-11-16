import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const AnimalPhoto = sequelize.define(
  "AnimalPhoto",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    animal_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: "animals", key: "unique_id" },
    },
    url: { type: DataTypes.STRING, allowNull: false },
    is_primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "animal_photos",
  }
);

export default AnimalPhoto;
