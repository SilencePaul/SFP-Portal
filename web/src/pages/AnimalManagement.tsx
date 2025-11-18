import { useState, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { AuthContext } from "@/contexts/authContext";
import { calculateDaysInSFP } from "@/data/mockAnimals";
import { toast } from "sonner";

export default function AnimalManagement() {
  const { currentUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [animals, setAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const isAdmin = currentUser?.role.includes("admin");
  const isFoster = currentUser?.role.includes("foster");

  // Fetch animals from API
  useEffect(() => {
    async function fetchAnimals() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/animals`, {
          credentials: "include", // Include auth cookies
        });

        if (!res.ok) throw new Error("Failed to fetch animals");

        const data = await res.json();

        // Normalize the data from backend
        const normalizedAnimals = data.map((animal: any) => ({
          id: animal.id,
          uniqueId: animal.unique_id,
          name: animal.name,
          species: animal.species,
          breed: animal.breed,
          age: animal.age || "Unknown",
          sex: animal.sex,
          size: animal.size || "Medium",
          color: animal.color,
          description: animal.description,
          imageUrls: animal.image_urls || [],
          adoptionFee: animal.adoption_fee || 0,
          intakeDate: animal.intake_date || animal.created_at,
          status: animal.status || "draft",
          location: animal.location || "Foster Care",
          volunteerId: animal.volunteer_id,
        }));

        setAnimals(normalizedAnimals);
      } catch (err) {
        console.error("Error fetching animals:", err);
        toast.error("Failed to load animals");
      } finally {
        setLoading(false);
      }
    }

    if (currentUser) {
      fetchAnimals();
    }
  }, [API_BASE_URL, currentUser]);

  if (!currentUser || (!isAdmin && !isFoster)) {
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

  // Filter animals based on search and tab
  let filteredAnimals = animals;

  // Enforce foster-only visibility: foster sees only their own animals
  if (!isAdmin && isFoster) {
    filteredAnimals = filteredAnimals.filter(
      (animal) => Number(animal.volunteerId) === Number(currentUser.id)
    );
  }

  // Apply search
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredAnimals = filteredAnimals.filter(
      (animal) =>
        animal.name.toLowerCase().includes(term) ||
        animal.uniqueId.toLowerCase().includes(term) ||
        animal.description.toLowerCase().includes(term) ||
        animal.breed.toLowerCase().includes(term)
    );
  }

  // Apply tab filter
  if (activeTab !== "all") {
    filteredAnimals = filteredAnimals.filter(
      (animal) => animal.status === activeTab
    );
  }

  const handlePublish = (_animalId: string) => {
    toast.success(`Animal has been published to the public site successfully!`);
  };

  const handleUnpublish = (_animalId: string) => {
    toast.success(
      `Animal has been unpublished from the public site successfully!`
    );
  };

  const handleArchive = (_animalId: string) => {
    toast.success(`Animal has been archived successfully!`);
  };

  const handleMarkAsReady = (_animalId: string) => {
    toast.success(
      `Animal has been marked as Ready for Adoption. Admin will review it soon.`
    );
  };

  const handleReview = (_animalId: string) => {
    toast.info(`Opening animal review panel...`);
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
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                Animal Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage animal profiles and their status
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                to="/animals/add"
                className="inline-flex items-center bg-[#4C51A4] hover:bg-[#383C80] text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <i className="fa-solid fa-plus mr-2"></i>
                Add New Animal
              </Link>
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
                placeholder="Search animals by name, ID, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
              <i className="fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>

            <div className="flex gap-2 flex-wrap">
              {[
                { id: "all", label: "All" },
                { id: "draft", label: "Drafts" },
                { id: "fostering", label: "Fostering" },
                { id: "ready for adoption", label: "Ready for Adoption" },
                { id: "published", label: "Published" },
                { id: "interviewing", label: "Interviewing" },
                { id: "reserved", label: "Reserved" },
                { id: "adopted", label: "Adopted" },
                { id: "archived", label: "Archived" },
              ].map((tab) => (
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

        {/* Animal List Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Animal
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Age
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Breed
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Fee
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Days in SFP
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <i className="fa-solid fa-spinner fa-spin text-4xl text-primary mb-4"></i>
                        <p className="text-gray-600 dark:text-gray-400">
                          Loading animals...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredAnimals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                          <i className="fa-solid fa-search text-gray-400 text-2xl"></i>
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-1">
                          No animals found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          Try changing your search or filter criteria
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAnimals.map((animal) => (
                    <tr
                      key={animal.uniqueId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-md object-cover"
                              src={animal.imageUrls[0]}
                              alt={animal.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {animal.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {animal.species}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {animal.uniqueId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {animal.age}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {animal.breed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        ${animal.adoptionFee}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {calculateDaysInSFP(animal.intakeDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            animal.status === "published"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : animal.status === "draft"
                              ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                              : animal.status === "fostering"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : animal.status === "ready for adoption"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                              : animal.status === "interviewing"
                              ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
                              : animal.status === "reserved"
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                              : animal.status === "adopted"
                              ? "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {animal.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/animal/${animal.uniqueId}`}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          >
                            <i className="fa-solid fa-eye"></i>
                          </Link>
                          {/* Edit allowed for admin; foster can edit only if not published */}
                          <Link
                            to={`/animals/edit/${animal.uniqueId}`}
                            className={`${
                              !isAdmin && animal.status === "published"
                                ? "opacity-50 cursor-not-allowed"
                                : "text-[#4C51A4] hover:text-[#383C80]"
                            }`}
                          >
                            <i className="fa-solid fa-edit"></i>
                          </Link>

                          {/* Foster can mark their own animals as ready for adoption when in fostering status */}
                          {animal.status === "fostering" && !isAdmin && (
                            <button
                              onClick={() => handleMarkAsReady(animal.uniqueId)}
                              className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                              title="Mark as Ready for Adoption"
                            >
                              <i className="fa-solid fa-clipboard-check"></i>
                            </button>
                          )}

                          {/* Admin can publish animals that are in ready for adoption status */}
                          {animal.status === "ready for adoption" &&
                            isAdmin && (
                              <button
                                onClick={() => handlePublish(animal.uniqueId)}
                                className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                                title="Publish to Public Site"
                              >
                                <i className="fa-solid fa-globe"></i>
                              </button>
                            )}

                          {/* Admin can unpublish animals */}
                          {animal.status === "published" && isAdmin && (
                            <button
                              onClick={() => handleUnpublish(animal.uniqueId)}
                              className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300"
                              title="Unpublish from Public Site"
                            >
                              <i className="fa-solid fa-globe-slash"></i>
                            </button>
                          )}

                          {/* Admin can review animals in ready for adoption status */}
                          {animal.status === "ready for adoption" &&
                            isAdmin && (
                              <button
                                onClick={() => handleReview(animal.uniqueId)}
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                                title="Review Animal"
                              >
                                <i className="fa-solid fa-file-circle-check"></i>
                              </button>
                            )}

                          {/* Archive button for all animals not already archived (admin only) */}
                          {animal.status !== "archived" && isAdmin && (
                            <button
                              onClick={() => handleArchive(animal.uniqueId)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                              title="Archive animal"
                            >
                              <i className="fa-solid fa-archive"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Internal Notes Section */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 bg-white dark:bg-gray-900 rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Internal Notes
            </h2>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-white">
                    <i className="fa-solid fa-user"></i>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-gray-800 dark:text-white">
                        Admin User
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        2 hours ago
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      We need to schedule a vet check for Max (SFP-123) next
                      week.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#4C51A4] flex items-center justify-center text-white">
                    <i className="fa-solid fa-user"></i>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-gray-800 dark:text-white">
                        Foster User
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Yesterday
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Luna has been doing great in her foster home. She's very
                      affectionate and playful.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Review Panel for Super Foster/Admin */}
        {isAdmin && activeTab === "Ready for Adoption" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 border-l-4 border-purple-500"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Ready for Adoption Review Panel
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              These animals have been marked as Ready for Adoption by their
              foster parents. Please review their profiles and decide whether to
              publish them to the public site.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  toast.info("Bulk publishing functionality coming soon!");
                }}
                className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <i className="fa-solid fa-check-circle mr-2"></i>
                Publish Selected
              </button>
              <button
                onClick={() => {
                  toast.info("Bulk reviewing functionality coming soon!");
                }}
                className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <i className="fa-solid fa-file-circle-check mr-2"></i>
                Review All
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
