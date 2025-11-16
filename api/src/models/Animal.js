import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Animal = sequelize.define(
  "Animal",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    unique_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: /^SFP-\d+$/,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    species: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    breed: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    age: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sex: {
      type: DataTypes.ENUM("Male", "Female"),
      allowNull: false,
    },
    size: {
      type: DataTypes.ENUM("Small", "Medium", "Large"),
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    personality: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    image_urls: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    vaccinated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    neutered: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    good_with_children: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    good_with_dogs: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    good_with_cats: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    adoption_fee: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    intake_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    posted_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "Draft",
        "Fostering",
        "Ready for Adoption",
        "Published",
        "Interviewing",
        "Reserved",
        "Adopted",
        "Archived"
      ),
      allowNull: false,
      defaultValue: "Draft",
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "animals",
  }
);

export default Animal;
