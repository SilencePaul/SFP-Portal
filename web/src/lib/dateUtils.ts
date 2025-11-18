// Date utility functions

/**
 * Calculate the number of days an animal has been in SFP
 * @param intakeDate - The date the animal was taken in (ISO string format)
 * @returns Number of days since intake
 */
export const calculateDaysInSFP = (intakeDate: string): number => {
  const intake = new Date(intakeDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - intake.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
