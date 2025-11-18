import Animal from "./Animal.js";
import Volunteer from "./Volunteer.js";
import Application from "./Application.js";
import Interview from "./Interview.js";
import Contract from "./Contract.js";
import AnimalPhoto from "./AnimalPhoto.js";
import AuditLog from "./AuditLog.js";
import EmailLog from "./EmailLog.js";

// Associations
// Animal relations
Animal.belongsTo(Volunteer, { foreignKey: "volunteer_id" });
Animal.hasMany(AnimalPhoto, { foreignKey: "animal_id" });

// Applications
Application.belongsTo(Animal, {
  foreignKey: "animal_id",
  targetKey: "unique_id",
});

// Interview
Interview.belongsTo(Application, { foreignKey: "application_id" });
Interview.belongsTo(Volunteer, { foreignKey: "volunteer_id" });

// Contract
Contract.belongsTo(Application, { foreignKey: "application_id" });
Contract.belongsTo(Animal, { foreignKey: "animal_id", targetKey: "unique_id" });

// Audit & Email logs
// AuditLog - no foreign key relationships for now
// EmailLog - no associations required; linked via payload if needed

export default function setupAssociations() {
  // Associations are defined above
}
