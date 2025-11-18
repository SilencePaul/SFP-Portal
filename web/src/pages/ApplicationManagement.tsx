import { useState, useContext, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { AuthContext } from "@/contexts/authContext";
import { apiGet } from "@/lib/api";

interface BackendApplication {
  id: number;
  animal_id: string;
  status: string; // submitted, reviewing, interview, approved, rejected
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  Animal?: {
    unique_id: string;
    name: string;
    species: string;
    image_urls: string[];
    status: string; // Animal status: draft, fostering, ready, published, interviewing, reserved, adopted, archived
  };
}

interface BackendInterview {
  id: number;
  application_id: number;
  volunteer_id: number;
  volunteer_name: string;
  interview_time: string | null;
  interview_result: string | null;
  final_decision: string;
}

interface UiApplication {
  id: number;
  animalId: string;
  animalName?: string;
  animalStatus?: string; // Animal status
  applicantName: string;
  email: string;
  phone: string;
  status: string; // Application status
  dateSubmitted: string;
  interviewTime?: string;
  interviewerName?: string;
}

// Filter by animal status instead of application status
const statusOptions = [
  { id: "all", label: "All Animals" },
  { id: "published", label: "Available" },
  { id: "interviewing", label: "Interviewing" },
  { id: "reserved", label: "Reserved" },
  { id: "adopted", label: "Adopted" },
];

const mapStatusToDisplay = (status: string) => {
  switch (status) {
    case "submitted":
      return "Submitted";
    case "interview":
      return "Interview";
    case "review":
      return "Review";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
};

const statusClass = (status: string) => {
  switch (status) {
    case "submitted":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "interview":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    case "review":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "approved":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300";
  }
};   

export default function ApplicationManagement() {
  const { currentUser } = useContext(AuthContext);
  
  const isAdmin = currentUser?.role.includes("admin");
  const isInterviewer = currentUser?.role.includes("interviewer");

  // Set default filter based on role
  // Admins see "Reserved" (animals under review) by default
  // Interviewers see "Interviewing" (animals they're working with) by default
  const getDefaultTab = () => {
    if (isAdmin) return "reserved";
    if (isInterviewer) return "interviewing";
    return "all";
  };

  const [activeTab, setActiveTab] = useState<string>(getDefaultTab());
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [applications, setApplications] = useState<UiApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  if (!currentUser || (!isAdmin && !isInterviewer)) {
    return (
      <div className="min-h-screen py-12 bg-[#FFDF4] dark:bg-gray-800/50">
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
                You do not have permission to access this page.
              </p>
              <a
                href="/"
                className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const transform = (data: BackendApplication): UiApplication => ({
    id: data.id,
    animalId: data.Animal?.unique_id || data.animal_id,
    animalName: data.Animal?.name,
    animalStatus: data.Animal?.status,
    applicantName: data.full_name,
    email: data.email,
    phone: data.phone,
    status: data.status,
    dateSubmitted: data.created_at?.split("T")[0] || "",
  });

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data: BackendApplication[] = await apiGet("/api/applications");
      
      // Fetch interviews for all applications (admin or interviewer)
      let interviewsMap: Map<number, BackendInterview> = new Map();
      if (isAdmin || isInterviewer) {
        try {
          const allInterviews: BackendInterview[] = await apiGet("/api/interviews");
          // Create a map of application_id -> interview
          allInterviews.forEach(interview => {
            interviewsMap.set(interview.application_id, interview);
          });
        } catch (err) {
          console.error("Failed to fetch interviews:", err);
          // Continue without interview data
        }
      }
      
      // Transform applications and add interview data
      const transformedApps = data.map(app => {
        const interview = interviewsMap.get(app.id);
        return {
          ...transform(app),
          interviewTime: interview?.interview_time || undefined,
          interviewerName: interview?.volunteer_name || undefined,
        };
      });
      
      setApplications(transformedApps);
    } catch (e: any) {
      setError(e.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isInterviewer]);

  useEffect(() => {
    if (currentUser && (isAdmin || isInterviewer)) {
      fetchApplications();
    } else {
      setLoading(false);
    }
  }, [currentUser, isAdmin, isInterviewer, fetchApplications]);

  // Status changes are now restricted to ApplicationDetails page only.

  // Derived filtering - filter by animal status instead of application status
  let filteredApplications = applications;
  if (activeTab !== "all") {
    filteredApplications = filteredApplications.filter(
      (app) => app.animalStatus === activeTab
    );
  }
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredApplications = filteredApplications.filter(
      (app) =>
        app.applicantName.toLowerCase().includes(term) ||
        (app.animalName || "").toLowerCase().includes(term) ||
        app.animalId.toLowerCase().includes(term) ||
        app.email.toLowerCase().includes(term)
    );
  }

  return (
    <div className="min-h-screen py-12 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Application Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Review and manage adoption applications
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm p-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 text-center">
                  Summary
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {applications.length}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Apps
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-500">
                      {applications.filter((app) => app.interviewTime).length}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Interviews
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-500">
                      {applications.filter(
                        (app) =>
                          app.status === "submitted" ||
                          app.status === "review"
                      ).length}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Pending
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search applications by name, animal ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
              <i className="fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>

            <div className="flex gap-2 flex-wrap">
              {statusOptions.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-[#4C51A4] text-white shadow-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Applications List Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden"
        >
          {/* Group applications by animal */}
          {loading ? (
            <div className="p-10 text-center">
              <i className="fa-solid fa-spinner fa-spin text-3xl text-gray-400"></i>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading applications...
              </p>
            </div>
          ) : error ? (
            <div className="p-10 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                  <i className="fa-solid fa-triangle-exclamation text-red-500 text-2xl"></i>
                </div>
                <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-1">
                  Failed to load
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                  {error}
                </p>
                <button
                  onClick={fetchApplications}
                  className="px-4 py-2 bg-[#4C51A4] hover:bg-[#383C80] text-white rounded-lg text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-10 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <i className="fa-solid fa-search text-gray-400 text-2xl"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-1">
                  No applications found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Try changing your search or filter criteria
                </p>
              </div>
            </div>
          ) : (
            // Group applications by animal
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {Array.from(
                new Set(filteredApplications.map((app) => app.animalId))
              ).map((animalId) => {
                const animalApplications = filteredApplications.filter(
                  (app) => app.animalId === animalId
                );
                const firstApp = animalApplications[0];

                return (
                  <div key={animalId} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mr-3">
                          <i className="fa-solid fa-paw text-[#4C51A4]"></i>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                            {firstApp.animalName || "Unknown Animal"}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {firstApp.animalId}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {animalApplications.length}{" "}
                        {animalApplications.length === 1
                          ? "application"
                          : "applications"}
                      </span>
                    </div>

                    {/* Applications for this animal */}
                    <div className="mt-4 space-y-3">
                      {animalApplications.map((application) => (
                        <div
                          key={application.id}
                          className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                                <i className="fa-solid fa-user text-gray-600 dark:text-gray-400"></i>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {application.applicantName}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {application.email} • {application.phone}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass(
                                  application.status
                                )}`}
                              >
                                {mapStatusToDisplay(application.status)}
                              </span>
                              {/* Status editing removed; change only via ApplicationDetails */}
                            </div>
                          </div>
                          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex flex-col gap-2">
                              <span>Submitted: {application.dateSubmitted}</span>
                              
                              {/* Interview Details Section */}
                              {application.interviewTime && (
                                <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                                  <div className="flex items-start gap-2">
                                    <i className="fa-solid fa-calendar-check text-purple-600 dark:text-purple-400 mt-0.5"></i>
                                    <div className="flex-1">
                                      <div className="font-medium text-purple-900 dark:text-purple-300 text-sm mb-1">
                                        Interview Scheduled
                                      </div>
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm">
                                          <i className="fa-solid fa-clock text-purple-500 dark:text-purple-400 text-xs"></i>
                                          <span className="text-gray-700 dark:text-gray-300">
                                            {new Date(application.interviewTime).toLocaleDateString('en-US', {
                                              weekday: 'short',
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric',
                                            })}{" "}
                                            at{" "}
                                            {new Date(application.interviewTime).toLocaleTimeString('en-US', {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </span>
                                        </div>
                                        {application.interviewerName && (
                                          <div className="flex items-center gap-2 text-sm">
                                            <i className="fa-solid fa-user-tie text-purple-500 dark:text-purple-400 text-xs"></i>
                                            <span className="text-gray-700 dark:text-gray-300">
                                              {application.interviewerName}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 flex justify-end space-x-2">
                            <Link
                              to={`/applications/detail/${application.id}`}
                              className="text-[#4C51A4] hover:text-[#383C80] text-sm"
                            >
                              <i className="fa-solid fa-eye mr-1"></i> View
                              Details
                            </Link>
                            {/* Interview scheduling route kept but actual data integration pending */}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Summary Section */}
        {(isAdmin || isInterviewer) && !loading && !error && filteredApplications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 bg-white dark:bg-gray-900 rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Applications</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                      {filteredApplications.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-file-lines text-blue-600 dark:text-blue-400 text-xl"></i>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Interviews Scheduled</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                      {filteredApplications.filter(app => app.interviewTime).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-calendar-check text-purple-600 dark:text-purple-400 text-xl"></i>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending Review</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                      {filteredApplications.filter(app => app.status === 'submitted').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-clock text-yellow-600 dark:text-yellow-400 text-xl"></i>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
