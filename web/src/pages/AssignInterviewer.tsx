import { useState, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { AuthContext } from "@/contexts/authContext";
import { toast } from "sonner";
import { apiGet, apiPatch } from "@/lib/api";

interface Animal {
  id: number;
  unique_id: string;
  name: string;
  status: string;
  image_urls: string[];
  interviewer_id: number | null;
  volunteer_id?: number;
  volunteer?: { full_name: string };
  interviewer?: { full_name: string; email: string };
}

interface Interviewer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  status: string;
  full_name: string;
}

export default function AssignInterviewer() {
  const { currentUser } = useContext(AuthContext);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [searchAnimal, setSearchAnimal] = useState("");
  const [searchInterviewer, setSearchInterviewer] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  // Check if user is admin
  if (!currentUser || !currentUser.role.includes("admin")) {
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
                You need to be an admin to access this page.
              </p>
              <a
                href="/"
                className="bg-[#4C51A4] hover:bg-[#383C80] text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fetch published animals and interviewers on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [animalsData, volunteersData] = await Promise.all([
          apiGet("/api/animals"), // Changed from /api/animals/available to get all data including interviewer
          apiGet("/api/volunteers"),
        ]);
        // Filter to only published animals
        const publishedAnimals = animalsData.filter(
          (a: any) => a.status === "published"
        );
        setAnimals(publishedAnimals);
        console.log("Published animals:", publishedAnimals);
        console.log("All volunteers:", volunteersData);
        const interviewersOnly = volunteersData.filter(
          (v: any) =>
            v.role &&
            typeof v.role === "string" &&
            v.role.toLowerCase() === "interviewer" &&
            (!v.status || v.status.toLowerCase() === "active")
        );
        console.log("Filtered interviewers:", interviewersOnly);
        setInterviewers(interviewersOnly);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load animals or interviewers");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter animals by search term
  const filteredAnimals = animals.filter(
    (animal) =>
      animal.name.toLowerCase().includes(searchAnimal.toLowerCase()) ||
      animal.unique_id.toLowerCase().includes(searchAnimal.toLowerCase())
  );

  // Filter interviewers by search term
  const filteredInterviewers = interviewers.filter(
    (interviewer) =>
      interviewer.full_name
        .toLowerCase()
        .includes(searchInterviewer.toLowerCase()) ||
      interviewer.email.toLowerCase().includes(searchInterviewer.toLowerCase())
  );

  // Get available (unassigned) interviewers
  const getAvailableInterviewers = () => {
    if (!selectedAnimal) return [];
    return interviewers.filter((i) => i.id !== selectedAnimal.interviewer_id);
  };

  // Handle assignment of interviewer to animal
  const handleAssignInterviewer = async (interviewer: Interviewer) => {
    if (!selectedAnimal) return;
    try {
      setAssigning(true);
      const updated = await apiPatch(
        `/api/animals/${selectedAnimal.unique_id}/interviewer`,
        { interviewer_id: interviewer.id }
      );
      setSelectedAnimal(updated);
      setAnimals(animals.map((a) => (a.unique_id === updated.unique_id ? updated : a)));
      toast.success(
        `${interviewer.full_name} has been assigned to ${selectedAnimal.name}`
      );
    } catch (error) {
      console.error("Error assigning interviewer:", error);
      toast.error("Failed to assign interviewer");
    } finally {
      setAssigning(false);
    }
  };

  // Handle removal of interviewer from animal
  const handleRemoveInterviewer = async () => {
    if (!selectedAnimal || !selectedAnimal.interviewer) return;
    try {
      setAssigning(true);
      const updated = await apiPatch(
        `/api/animals/${selectedAnimal.unique_id}/interviewer`,
        { interviewer_id: null }
      );
      setSelectedAnimal(updated);
      setAnimals(animals.map((a) => (a.unique_id === updated.unique_id ? updated : a)));
      toast.success(`Interviewer has been removed from ${selectedAnimal.name}`);
    } catch (error) {
      console.error("Error removing interviewer:", error);
      toast.error("Failed to remove interviewer");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Assign Interviewers
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Assign and manage interviewers for animals
              </p>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#4C51A4]/10 mb-4">
                <i className="fas fa-spinner text-[#4C51A4] text-2xl animate-spin"></i>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading animals and interviewers...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-4">
                    <i className="fas fa-paw text-blue-600 dark:text-blue-400 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Total Animals
                    </p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {animals.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mr-4">
                    <i className="fas fa-user-tie text-purple-600 dark:text-purple-400 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Total Interviewers
                    </p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {interviewers.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-4">
                    <i className="fas fa-check-circle text-green-600 dark:text-green-400 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Assigned
                    </p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {animals.filter((a) => a.interviewer_id).length}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Animals List */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 lg:col-span-1"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                    Available Animals
                  </h2>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name or ID..."
                      value={searchAnimal}
                      onChange={(e) => setSearchAnimal(e.target.value)}
                      className="w-full px-4 py-2 pl-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-[#4C51A4] focus:border-[#4C51A4] transition-all"
                    />
                    <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {filteredAnimals.length > 0 ? (
                    filteredAnimals.map((animal) => (
                      <motion.div
                        key={animal.unique_id}
                        whileHover={{ scale: 1.01 }}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedAnimal?.unique_id === animal.unique_id
                            ? "border-[#4C51A4] bg-[#4C51A4]/5 dark:bg-[#4C51A4]/10"
                            : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        }`}
                        onClick={() => setSelectedAnimal(animal)}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-gray-200 dark:bg-gray-700">
                            {animal.image_urls && animal.image_urls[0] ? (
                              <img
                                src={animal.image_urls[0]}
                                alt={animal.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <i className="fas fa-paw text-gray-400"></i>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800 dark:text-white">
                              {animal.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {animal.unique_id}
                            </p>
                          </div>
                          {animal.interviewer_id && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex-shrink-0">
                              Assigned
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-400">
                        No animals found
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Assignments Panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 lg:col-span-2"
              >
                {selectedAnimal ? (
                  <>
                    {/* Selected Animal Info */}
                    <div className="mb-8">
                      <div className="flex items-center mb-6">
                        <button
                          onClick={() => setSelectedAnimal(null)}
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mr-4 transition-colors"
                          aria-label="Back"
                        >
                          <i className="fa-solid fa-arrow-left"></i>
                        </button>
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full overflow-hidden mr-4 bg-gray-200 dark:bg-gray-700">
                            {selectedAnimal.image_urls &&
                            selectedAnimal.image_urls[0] ? (
                              <img
                                src={selectedAnimal.image_urls[0]}
                                alt={selectedAnimal.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <i className="fas fa-paw text-gray-400"></i>
                              </div>
                            )}
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                              {selectedAnimal.name}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                              {selectedAnimal.unique_id} •{" "}
                              {selectedAnimal.volunteer?.full_name ||
                                "No foster"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Current Assignment */}
                      <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                          Assigned Interviewer
                        </h3>

                        {selectedAnimal.interviewer ? (
                          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-[#4C51A4]/10 dark:bg-[#4C51A4]/20 rounded-full flex items-center justify-center mr-3">
                                  <i className="fa-solid fa-user-tie text-[#4C51A4]"></i>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-800 dark:text-white">
                                    {selectedAnimal.interviewer.full_name}
                                  </h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {selectedAnimal.interviewer.email}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={handleRemoveInterviewer}
                                disabled={assigning}
                                className="text-red-500 hover:text-red-700 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                aria-label="Remove interviewer"
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                              <i className="fa-solid fa-user-tie text-gray-400 text-2xl"></i>
                            </div>
                            <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                              No Interviewer Assigned
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400">
                              Select an interviewer below to assign.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Available Interviewers */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                            Available Interviewers
                          </h3>
                          <div className="relative w-48">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={searchInterviewer}
                              onChange={(e) =>
                                setSearchInterviewer(e.target.value)
                              }
                              className="w-full px-4 py-1.5 pl-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-[#4C51A4] focus:border-[#4C51A4] transition-all"
                            />
                            <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                          </div>
                        </div>

                        {getAvailableInterviewers().length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {filteredInterviewers
                              .filter((i) =>
                                getAvailableInterviewers().some(
                                  (av) => av.id === i.id
                                )
                              )
                              .map((interviewer) => (
                                <button
                                  key={interviewer.id}
                                  onClick={() =>
                                    handleAssignInterviewer(interviewer)
                                  }
                                  disabled={assigning}
                                  className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[#4C51A4] hover:bg-[#4C51A4]/5 dark:hover:bg-[#4C51A4]/10 transition-all disabled:opacity-50 cursor-pointer text-left"
                                >
                                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                    <i className="fa-solid fa-user-tie text-[#4C51A4] text-sm"></i>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-800 dark:text-white text-sm truncate">
                                      {interviewer.full_name}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                      {interviewer.email}
                                    </p>
                                  </div>
                                </button>
                              ))}
                          </div>
                        ) : (
                          <div className="p-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                              <i className="fa-solid fa-check-circle text-green-500 text-2xl"></i>
                            </div>
                            <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                              All Interviewers Assigned
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400">
                              All available interviewers are already assigned.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                      <i className="fa-solid fa-user-tie text-gray-400 text-4xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                      Select an Animal
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                      Choose an animal from the list on the left to assign an
                      interviewer.
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
