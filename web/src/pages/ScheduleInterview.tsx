import { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "@/contexts/authContext";
import { toast } from "sonner";
import { z } from "zod";
import { apiGet, apiPost } from "@/lib/api";

// Define the interview scheduling schema using Zod
const interviewSchema = z.object({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().max(200).optional(),
  meetingLink: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
  notifyApplicant: z.boolean(),
});

type InterviewData = z.infer<typeof interviewSchema>;

interface Application {
  id: number;
  animal_id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  Animal?: {
    name: string;
    image_urls: string[];
    species?: string;
    breed?: string;
    age?: number;
  };
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

export default function ScheduleInterview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const [application, setApplication] = useState<Application | null>(null);
  const [existingInterview, setExistingInterview] = useState<Interview | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState<InterviewData>({
    date: "",
    time: "",
    location: "",
    meetingLink: "",
    notes: "",
    notifyApplicant: true,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof InterviewData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user has permission to schedule interviews
  const isAdmin = currentUser?.role?.includes("admin");
  const isInterviewer = currentUser?.role?.includes("interviewer");

  // Fetch application data on component mount
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        setError("");
        if (id) {
          const data = await apiGet(`/api/applications/${id}`);
          setApplication(data);

          // Fetch existing interview if application status is 'interview'
          if (data.status === "interview") {
            try {
              const interviews: Interview[] = await apiGet("/api/interviews");
              const appInterview = interviews.find(
                (int: Interview) => int.application_id === Number(id)
              );
              if (appInterview && appInterview.interview_time) {
                setExistingInterview(appInterview);
                
                // Pre-fill form with existing interview data
                const interviewDate = new Date(appInterview.interview_time);
                const dateStr = interviewDate.toISOString().split("T")[0];
                const timeStr = interviewDate
                  .toTimeString()
                  .split(" ")[0]
                  .substring(0, 5);
                
                setFormData((prev) => ({
                  ...prev,
                  date: dateStr,
                  time: timeStr,
                }));
              }
            } catch (err) {
              console.error("Failed to fetch existing interview:", err);
            }
          }
        } else {
          // If no ID provided, show a selection interface or list
          setError("No application selected");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load application");
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin || isInterviewer) {
      fetchApplication();
    }
  }, [id, isAdmin, isInterviewer]);

  if (!isAdmin && !isInterviewer) {
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
                You do not have permission to schedule interviews.
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof InterviewData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const validateForm = () => {
    try {
      interviewSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof InterviewData, string>> = {};
        error.errors.forEach((err) => {
          newErrors[err.path[0] as keyof InterviewData] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstErrorField = document.querySelector('[aria-invalid="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (!application) {
      toast.error("No application selected");
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time into ISO format
      const interviewDateTime = `${formData.date}T${formData.time}`;

      // Create interview record
      await apiPost("/api/interviews", {
        application_id: application.id,
        interview_time: interviewDateTime,
        location: formData.location,
        meeting_link: formData.meetingLink,
        notes: formData.notes,
      });

      if (formData.notifyApplicant) {
        toast.info(`Interview notification sent to ${application.full_name}`);
      }

      toast.success(
        `Interview scheduled successfully for ${application.full_name} and ${application.Animal?.name}!`
      );

      // Redirect back to application management
      setTimeout(() => {
        navigate("/applications/manage");
      }, 2000);
    } catch (error: any) {
      console.error("Error scheduling interview:", error);
      toast.error(
        error.message || "Failed to schedule interview. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
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
              {existingInterview ? "Reschedule Interview" : "Schedule Interview"}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {loading
              ? "Loading application..."
              : application
              ? existingInterview
                ? `Update the interview schedule for ${application.full_name} and ${application.Animal?.name}`
                : `Schedule an interview for ${application.full_name} and ${application.Animal?.name}`
              : "No application selected"}
          </p>
        </motion.div>

        {existingInterview && existingInterview.interview_time && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6"
          >
            <div className="flex items-start">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <i className="fa-solid fa-calendar-check text-purple-600 dark:text-purple-400 text-lg"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 mb-2">
                  Current Interview Schedule
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center text-purple-700 dark:text-purple-300">
                    <i className="fa-solid fa-clock mr-2"></i>
                    <span>
                      {new Date(
                        existingInterview.interview_time
                      ).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      at{" "}
                      {new Date(
                        existingInterview.interview_time
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center text-purple-700 dark:text-purple-300">
                    <i className="fa-solid fa-user-tie mr-2"></i>
                    <span>Interviewer: {existingInterview.volunteer_name}</span>
                  </div>
                </div>
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-3">
                  <i className="fa-solid fa-info-circle mr-1"></i>
                  You can update the date and time below to reschedule
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="mb-6 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading application...
            </p>
          </div>
        )}

        {!loading && application && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto"
          >
            {/* Application Info Card */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-shrink-0">
                  {application?.Animal && (
                    <div className="w-24 h-24 rounded-full overflow-hidden">
                      <img
                        src={application.Animal.image_urls?.[0]}
                        alt={application.Animal.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        Interview for {application.Animal?.name} (
                        {application.animal_id})
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        With {application.full_name}
                      </p>
                    </div>
                    <div className="mt-3 sm:mt-0">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          application.status === "New"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            : application.status === "Reviewing"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : application.status === "Interview Scheduled"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                            : application.status === "Approved"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {application.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <i className="fa-solid fa-envelope text-[#4C51A4] mr-2"></i>
                      <span className="text-gray-700 dark:text-gray-300">
                        {application.email}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <i className="fa-solid fa-phone text-[#4C51A4] mr-2"></i>
                      <span className="text-gray-700 dark:text-gray-300">
                        {application.phone}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <i className="fa-solid fa-calendar-check text-[#4C51A4] mr-2"></i>
                      <span className="text-gray-700 dark:text-gray-300">
                        Submitted on{" "}
                        {new Date(application.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  Interview Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="date"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        errors.date
                          ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                          : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                      } text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all`}
                      aria-invalid={!!errors.date}
                      aria-describedby={errors.date ? "date-error" : undefined}
                      min={new Date().toISOString().split("T")[0]}
                    />
                    {errors.date && (
                      <p id="date-error" className="mt-1 text-sm text-red-500">
                        {errors.date}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="time"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Time
                    </label>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        errors.time
                          ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                          : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                      } text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all`}
                      aria-invalid={!!errors.time}
                      aria-describedby={errors.time ? "time-error" : undefined}
                    />
                    {errors.time && (
                      <p id="time-error" className="mt-1 text-sm text-red-500">
                        {errors.time}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Location (Optional)
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="e.g., PetSmart Downtown, 123 Main St"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="meetingLink"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Meeting Link (Optional)
                    </label>
                    <input
                      type="url"
                      id="meetingLink"
                      name="meetingLink"
                      value={formData.meetingLink}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="e.g., https://zoom.us/j/1234567890"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="notes"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="Any additional notes for the interview"
                    ></textarea>
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="notifyApplicant"
                        name="notifyApplicant"
                        checked={formData.notifyApplicant}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-700 rounded"
                      />
                      <label
                        htmlFor="notifyApplicant"
                        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        Send notification email to {application.full_name}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-end">
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/applications/detail/${application.id}`)
                  }
                  className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3 bg-[#4C51A4] hover:bg-[#383C80] text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-calendar-plus mr-2"></i>
                      Schedule Interview
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {!loading && !application && !error && (
          <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No application selected.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
