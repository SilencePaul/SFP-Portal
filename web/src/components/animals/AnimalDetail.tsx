import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { calculateDaysInSFP } from "@/lib/dateUtils";
import { toast } from "sonner";
import { AuthContext } from "@/contexts/authContext";

interface AnimalDetailProps {
  animal?: any; // Accepts normalized backend animal
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AnimalDetail: React.FC<AnimalDetailProps> = ({ animal: propAnimal }) => {
  const { id } = useParams();
  const authContext = useContext(AuthContext);
  const [animal, setAnimal] = useState<any | null>(propAnimal || null);
  const [loading, setLoading] = useState(!propAnimal);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const navigate = useNavigate();

  // Check if user is admin
  const isAdmin = authContext?.currentUser?.role.includes("admin");

  useEffect(() => {
    if (!animal && id) {
      setLoading(true);
      setError("");
      fetch(`${API_BASE_URL}/api/animals/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch animal");
          return res.json();
        })
        .then((data) => {
          setAnimal({
            id: data.id,
            uniqueId: data.unique_id || data.uniqueId,
            name: data.name,
            species: data.species,
            breed: data.breed,
            age: data.age,
            sex: data.sex,
            size: data.size,
            color: data.color,
            description: data.description,
            personality: Array.isArray(data.personality)
              ? data.personality
              : [],
            imageUrls: data.image_urls || data.imageUrls || [],
            adoptionFee: data.adoption_fee || data.adoptionFee,
            intakeDate: data.intake_date || data.intakeDate,
            postedDate: data.posted_date || data.postedDate,
            status: data.status,
            adoptionDate: data.adoption_date || data.adoptionDate,
            adoptionStory: data.adoption_story || data.adoptionStory,
            goodWith: {
              children: data.good_with_children ?? false,
              dogs: data.good_with_dogs ?? false,
              cats: data.good_with_cats ?? false,
            },
            location: data.location,
          });
        })
        .catch(() => setError("Could not load animal details."))
        .finally(() => setLoading(false));
    }
  }, [id, animal]);

  if (loading)
    return (
      <div className="text-center py-8 text-lg text-gray-500">
        Loading animal details...
      </div>
    );
  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!animal) return null;

  const daysInSFP = calculateDaysInSFP(animal.intakeDate);

  const handleApply = () => {
    navigate(`/apply/${animal.uniqueId}`);
  };

  const handleShare = () => {
    toast("Share functionality coming soon");
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
      {/* Image Gallery */}
      <div className="relative">
        <div className="h-80 md:h-96 overflow-hidden">
          <img
            src={animal.imageUrls[activeImageIndex]}
            alt={`${animal.name} - Image ${activeImageIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Back button */}
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-gray-800 dark:text-white p-2 rounded-full shadow-md hover:shadow-lg transition-all z-10"
          aria-label="Back"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>

        {/* Share button */}
        <button
          onClick={handleShare}
          className="absolute top-4 right-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-gray-800 dark:text-white p-2 rounded-full shadow-md hover:shadow-lg transition-all z-10"
          aria-label="Share"
        >
          <i className="fa-solid fa-share-nodes"></i>
        </button>

        {/* Unique ID badge */}
        <div className="absolute bottom-4 left-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-gray-800 dark:text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
          ID: {animal.uniqueId}
        </div>

        {/* Thumbnail navigation */}
        {animal.imageUrls.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-2 rounded-full shadow-md">
            {animal.imageUrls.map((_: string, index: number) => (
              <button
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  activeImageIndex === index
                    ? "bg-[#4C51A4] w-6"
                    : "bg-gray-400 dark:bg-gray-600 hover:bg-gray-500 dark:hover:bg-gray-500"
                }`}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Animal Information */}
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              {animal.name}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {animal.breed}
            </p>
          </div>

          <div className="flex gap-3">
            <div
              className={`flex items-center justify-center h-16 w-16 rounded-full ${
                animal.sex === "Male"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                  : "bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300"
              }`}
            >
              <span className="text-lg font-semibold">{animal.sex}</span>
            </div>
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white">
              <span className="text-lg font-semibold">{animal.size}</span>
            </div>
          </div>
        </div>

        {/* Basic Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Age
            </h3>
            <p className="text-xl font-semibold text-gray-800 dark:text-white">
              {animal.age}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Color
            </h3>
            <p className="text-xl font-semibold text-gray-800 dark:text-white">
              {animal.color}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Location
            </h3>
            <p className="text-xl font-semibold text-gray-800 dark:text-white line-clamp-1">
              {animal.location}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Adoption Fee
            </h3>
            <p className="text-xl font-semibold text-[#4C51A4]">
              ${animal.adoptionFee}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Additional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <i className="fa-solid fa-calendar-days text-[#4C51A4] mr-3"></i>
              <span className="text-gray-700 dark:text-gray-300">
                {daysInSFP} days in SFP
              </span>
            </div>
            <div className="flex items-center">
              <i className="fa-solid fa-location-dot text-[#4C51A4] mr-3"></i>
              <span className="text-gray-700 dark:text-gray-300">
                Located at {animal.location}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            About {animal.name}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {animal.description}
          </p>
        </div>

        {/* Personality */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Personality
          </h2>
          <div className="flex flex-wrap gap-3">
            {animal.personality.map((trait: string, index: number) => (
              <span
                key={index}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white rounded-full font-medium"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        {/* Compatibility */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Compatibility
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`p-4 rounded-lg border ${
                animal.goodWith.children
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-red-500 bg-red-50 dark:bg-red-900/20"
              }`}
            >
              <div className="flex items-center">
                <i
                  className={`fa-solid fa-child text-xl mr-3 ${
                    animal.goodWith.children ? "text-green-500" : "text-red-500"
                  }`}
                ></i>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    Children
                  </h3>
                  <p
                    className={`text-sm ${
                      animal.goodWith.children
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {animal.goodWith.children
                      ? "Good with kids"
                      : "Not recommended for kids"}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border ${
                animal.goodWith.dogs
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-red-500 bg-red-50 dark:bg-red-900/20"
              }`}
            >
              <div className="flex items-center">
                <i
                  className={`fa-solid fa-dog text-xl mr-3 ${
                    animal.goodWith.dogs ? "text-green-500" : "text-red-500"
                  }`}
                ></i>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    Other Dogs
                  </h3>
                  <p
                    className={`text-sm ${
                      animal.goodWith.dogs
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {animal.goodWith.dogs
                      ? "Good with other dogs"
                      : "Prefers to be the only pet"}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg border ${
                animal.goodWith.cats
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-red-500 bg-red-50 dark:bg-red-900/20"
              }`}
            >
              <div className="flex items-center">
                <i
                  className={`fa-solid fa-cat text-xl mr-3 ${
                    animal.goodWith.cats ? "text-green-500" : "text-red-500"
                  }`}
                ></i>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    Cats
                  </h3>
                  <p
                    className={`text-sm ${
                      animal.goodWith.cats
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {animal.goodWith.cats
                      ? "Good with cats"
                      : "Not compatible with cats"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Health Info */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Health
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <i
                className={`fa-solid text-xl mr-3 ${
                  animal.vaccinated ? "text-green-500" : "text-red-500"
                }`}
              >
                {animal.vaccinated ? "✓" : "✗"}
              </i>
              <span className="text-gray-700 dark:text-gray-300">
                Vaccinated
              </span>
            </div>
            <div className="flex items-center">
              <i
                className={`fa-solid text-xl mr-3 ${
                  animal.neutered ? "text-green-500" : "text-red-500"
                }`}
              >
                {animal.neutered ? "✓" : "✗"}
              </i>
              <span className="text-gray-700 dark:text-gray-300">
                Neutered/Spayed
              </span>
            </div>
          </div>
        </div>

        {/* Foster and Interviewer Info - Admin Only */}
        {isAdmin && (animal?.volunteer || animal?.interviewer) && (
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
              {/* Foster Info */}
              {animal?.volunteer && (
                <div className="flex items-center justify-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
                    <i className="fa-solid fa-heart text-blue-600 dark:text-blue-400 text-lg"></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    Foster:
                  </h3>
                  <p className="font-semibold text-gray-800 dark:text-white ml-2">
                    {animal.volunteer.full_name || "N/A"}
                  </p>
                </div>
              )}

              {/* Interviewer Info */}
              {animal?.interviewer ? (
                <div>
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
                      <i className="fa-solid fa-user-tie text-green-600 dark:text-green-400 text-lg"></i>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      Interviewer:
                    </h3>
                    <p className="font-semibold text-gray-800 dark:text-white ml-2">
                      {animal.interviewer.full_name || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Email:
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 ml-2">
                      {animal.interviewer.email || "N/A"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                    <i className="fa-solid fa-circle-question text-gray-600 dark:text-gray-400 text-lg"></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    Interviewer:
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-3">
                    No interviewer assigned yet
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {(animal.status === "published" || animal.status === "interviewing") && (
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleApply}
              className="flex-1 bg-[#4C51A4] hover:bg-[#383C80] text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
            >
              <i className="fa-solid fa-paper-plane mr-2"></i>
              Apply to Adopt
            </button>
            <button
              onClick={handleShare}
              className="flex-1 border border-[#4C51A4] text-[#4C51A4] hover:bg-[#4C51A4]/5 font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
            >
              <i className="fa-solid fa-share-nodes mr-2"></i>
              Share
            </button>
          </div>
        )}

        {animal.status === "reserved" && (
          <div className="flex justify-center">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-500 rounded-lg p-4 text-center w-full max-w-md">
              <i className="fa-solid fa-clock text-yellow-500 text-3xl mb-2"></i>
              <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-300 mb-2">
                Reserved - Application Under Review
              </h3>
              <p className="text-yellow-700 dark:text-yellow-400">
                This animal is currently reserved while an application is being reviewed. Check back soon!
              </p>
            </div>
          </div>
        )}

        {animal.status === "adopted" && (
          <div className="flex justify-center">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-500 rounded-lg p-4 text-center w-full max-w-md">
              <i className="fa-solid fa-heart text-green-500 text-3xl mb-2"></i>
              <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">
                Successfully Adopted!
              </h3>
              <p className="text-green-700 dark:text-green-400">
                {animal.name} has found a loving forever home.
              </p>
            </div>
          </div>
        )}

        {animal.status === "reserved" && (
          <div className="flex justify-center">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-500 rounded-lg p-4 text-center w-full max-w-md">
              <i className="fa-solid fa-hourglass-half text-yellow-500 text-3xl mb-2"></i>
              <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-300 mb-2">
                Pending Adoption
              </h3>
              <p className="text-yellow-700 dark:text-yellow-400">
                {animal.name} is currently being considered by an adopter.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimalDetail;
