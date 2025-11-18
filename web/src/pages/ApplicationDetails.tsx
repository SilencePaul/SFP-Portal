import { useState, useContext, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "@/contexts/authContext";
import { toast } from "sonner";
import { apiGet, apiPatch } from "@/lib/api";

interface BackendApplication {
  id: number;
  animal_id: string; // references Animal.unique_id
  status: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  household_type: string;
  has_children: boolean;
  children_ages?: string | null;
  has_other_pets: boolean;
  other_pets_details?: string | null;
  experience_with_pets: string;
  hours_away: string;
  reason_for_adoption: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  agreed_to_terms: boolean;
  created_at: string;
  Animal?: {
    id?: number; // may not be present if backend doesn't include it
    unique_id: string;
    name: string;
    species: string;
    image_urls: string[];
  };
}

interface UiApplication {
  id: number;
  animalId: string; // Animal.unique_id
  animalRecordId?: number | null; // internal numeric PK if available
  applicantName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  householdType: string;
  hasChildren: boolean;
  childrenAges?: string | null;
  hasOtherPets: boolean;
  otherPetsDetails?: string | null;
  experienceWithPets: string;
  hoursAway: string;
  reasonForAdoption: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  status: string;
  dateSubmitted: string;
  animalName?: string;
  animalImage?: string;
  animalSpecies?: string;
}

interface Interview {
  id: number;
  application_id: number;
  volunteer_id: number;
  volunteer_name: string;
  interview_time: string | null;
  interview_result: string | null;
  final_decision: string;
}

export default function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const [application, setApplication] = useState<UiApplication | null>(null);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Roles: allow admin & interviewer
  const roles: string[] = currentUser?.role
    ? Array.isArray(currentUser.role)
      ? currentUser.role
      : [currentUser.role]
    : [];
  const canView = roles.some((r) => ["admin", "interviewer"].includes(r));
  const canUpdateStatus = canView;
  const isAdmin = roles.includes("admin");

  const transform = (data: BackendApplication): UiApplication => ({
    id: data.id,
    animalId: data.animal_id,
    animalRecordId: data.Animal?.id ?? null,
    applicantName: data.full_name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    city: data.city,
    province: data.state,
    postalCode: data.zip_code,
    householdType: data.household_type,
    hasChildren: data.has_children,
    childrenAges: data.children_ages || null,
    hasOtherPets: data.has_other_pets,
    otherPetsDetails: data.other_pets_details || null,
    experienceWithPets: data.experience_with_pets,
    hoursAway: data.hours_away,
    reasonForAdoption: data.reason_for_adoption,
    emergencyContactName: data.emergency_contact_name,
    emergencyContactPhone: data.emergency_contact_phone,
    status: data.status,
    dateSubmitted: data.created_at?.split("T")[0] || "",
    animalName: data.Animal?.name,
    animalImage: data.Animal?.image_urls?.[0],
    animalSpecies: data.Animal?.species,
  });

  const fetchApplication = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data: BackendApplication = await apiGet(`/api/applications/${id}`);
      const ui = transform(data);
      setApplication(ui);
      setStatus(ui.status);

      // Fetch interview data if application status is 'interview'
      if (ui.status === "interview") {
        try {
          const interviews: Interview[] = await apiGet("/api/interviews");
          const appInterview = interviews.find(
            (int) => int.application_id === ui.id
          );
          if (appInterview) {
            setInterview(appInterview);
          }
        } catch (err) {
          console.error("Failed to fetch interview data:", err);
        }
      }
    } catch (e: any) {
      setError(e.message || "Failed to load application");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (canView) {
      fetchApplication();
    } else {
      setLoading(false);
    }
  }, [canView, fetchApplication]);

  if (!canView) {
    return (
      <div className="min-h-screen py-12 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <i className="fa-solid fa-lock text-gray-400 text-4xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Access Denied
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                You do not have permission to view this application.
              </p>
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleStatusChange = useCallback((newStatus: string) => {
    setStatus(newStatus);
  }, []);

  const handleScheduleInterview = async () => {
    if (!application) {
      toast.error("Application not found");
      return;
    }

    try {
      // Update animal status to "interviewing" (Animal model uses this ENUM value)
      await apiPatch(`/api/animals/${application.animalId}/state`, {
        status: "interviewing",
      });

      // Update application status to "interview"
      await apiPatch(`/api/applications/${application.id}/status`, {
        status: "interview",
      });

      // Update local state
      setStatus("interview");

      toast.success("Interview scheduled and status updated");

      // Navigate to schedule interview page
      setTimeout(() => {
        navigate(`/schedule-interview/${application.id}`);
      }, 500);
    } catch (error: any) {
      console.error("Error scheduling interview:", error);
      toast.error(
        error.message || "Failed to schedule interview. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen py-12 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              aria-label="Back"
            >
              <i className="fa-solid fa-arrow-left text-xl"></i>
            </button>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Application Details
            </h1>
          </div>
          {loading ? (
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Loading application...
            </p>
          ) : error ? (
            <p className="text-red-600 dark:text-red-400 mt-2">{error}</p>
          ) : application ? (
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Application #{application.id} • Submitted on{" "}
              {application.dateSubmitted}
            </p>
          ) : null}
        </motion.div>

        {loading ? (
          <div className="text-center py-20">
            <i className="fa-solid fa-spinner fa-spin text-3xl text-gray-400"></i>
          </div>
        ) : error ? null : !application ? (
          <div className="text-center py-20">
            <p className="text-gray-600 dark:text-gray-400">
              Application not found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-1 space-y-6"
            >
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  Applicant Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mr-4">
                      <i className="fa-solid fa-user text-gray-500 dark:text-gray-400"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        {application.applicantName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {application.email}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {application.phone}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Address
                    </p>
                    <p className="text-gray-800 dark:text-white">
                      {application.address}
                    </p>
                    <p className="text-gray-800 dark:text-white">{`${application.city}, ${application.province} ${application.postalCode}`}</p>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Emergency Contact
                    </p>
                    <p className="text-gray-800 dark:text-white">
                      {application.emergencyContactName}
                    </p>
                    <p className="text-gray-800 dark:text-white">
                      {application.emergencyContactPhone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  Animal Information
                </h2>
                {application.animalName ? (
                  <Link
                    to={`/animal/${application.animalId}`}
                    className="block hover:opacity-80 transition-opacity"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-lg overflow-hidden mr-4">
                          {application.animalImage ? (
                            <img
                              src={application.animalImage}
                              alt={application.animalName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-white">
                            {application.animalName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {application.animalId}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {application.animalSpecies}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      Animal information not available
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                      Application Status
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Current status:{" "}
                      <span
                        className={`font-medium ${
                          status === "submitted"
                            ? "text-blue-600 dark:text-blue-400"
                            : status === "reviewing"
                            ? "text-yellow-600 dark:text-yellow-400"
                            : status === "interview"
                            ? "text-purple-600 dark:text-purple-400"
                            : status === "approved"
                            ? "text-green-600 dark:text-green-400"
                            : status === "rejected"
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {status}
                      </span>
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    {canUpdateStatus && application && (
                      <select
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      >
                        <option value="submitted">Submitted</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="interview">Interview</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => toast.info("Email action not implemented")}
                    className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <i className="fa-solid fa-envelope mr-2"></i>
                    Contact Applicant
                  </button>
                  {(isAdmin || roles.includes("interviewer")) && (
                    <>
                      {status !== "interview" ? (
                        <button
                          onClick={handleScheduleInterview}
                          className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          <i className="fa-solid fa-calendar-plus mr-2"></i>
                          Schedule Interview
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            navigate(`/schedule-interview/${application.id}`)
                          }
                          className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          <i className="fa-solid fa-calendar-day mr-2"></i>
                          Reschedule Interview
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Interview Details Section */}
              {interview && interview.interview_time && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl shadow-md p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mr-3">
                      <i className="fa-solid fa-calendar-check text-purple-600 dark:text-purple-400 text-lg"></i>
                    </div>
                    <h2 className="text-xl font-bold text-purple-900 dark:text-purple-300">
                      Scheduled Interview
                    </h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <i className="fa-solid fa-clock text-purple-500 dark:text-purple-400 mt-1 mr-3"></i>
                      <div>
                        <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                          Date & Time
                        </p>
                        <p className="text-purple-900 dark:text-purple-200">
                          {new Date(interview.interview_time).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}{" "}
                          at{" "}
                          {new Date(interview.interview_time).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fa-solid fa-user-tie text-purple-500 dark:text-purple-400 mt-1 mr-3"></i>
                      <div>
                        <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                          Interviewer
                        </p>
                        <p className="text-purple-900 dark:text-purple-200">
                          {interview.volunteer_name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                  Application Form Details
                </h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Household Type
                      </p>
                      <p className="text-gray-800 dark:text-white capitalize">
                        {application.householdType}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Children in Home
                      </p>
                      <p className="text-gray-800 dark:text-white">
                        {application.hasChildren ? "Yes" : "No"}
                      </p>
                      {application.hasChildren && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Ages: {application.childrenAges}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Other Pets
                      </p>
                      <p className="text-gray-800 dark:text-white">
                        {application.hasOtherPets ? "Yes" : "No"}
                      </p>
                      {application.hasOtherPets && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {application.otherPetsDetails}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Pet Experience
                      </p>
                      <p className="text-gray-800 dark:text-white capitalize">
                        {application.experienceWithPets}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Hours Away Per Day
                      </p>
                      <p className="text-gray-800 dark:text-white">
                        {application.hoursAway}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Reason for Adoption
                      </p>
                      <p className="text-gray-800 dark:text-white">
                        {application.reasonForAdoption}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
