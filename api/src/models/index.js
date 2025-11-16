import Animal from "./Animal.js";
import Volunteer from "./Volunteer.js";
import Application from "./Application.js";
import Interview from "./Interview.js";
import Contract from "./Contract.js";
import AnimalPhoto from "./AnimalPhoto.js";
import AuditLog from "./AuditLog.js";
import EmailLog from "./EmailLog.js";
import setupAssociations from "./associations.js";

setupAssociations();

export {
  Animal,
  Volunteer,
  Application,
  Interview,
  Contract,
  AnimalPhoto,
  AuditLog,
  EmailLog,
};
