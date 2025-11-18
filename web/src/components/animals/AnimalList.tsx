import React, { useState, useEffect } from "react";
import AnimalCard from "./AnimalCard";
import { calculateDaysInSFP } from "@/lib/dateUtils";

// Utility to normalize backend animal data to frontend format
function normalizeAnimal(animal: any) {
  return {
    id: animal.id,
    uniqueId: animal.unique_id || animal.uniqueId,
    name: animal.name,
    species: animal.species,
    breed: animal.breed,
    age: animal.age,
    sex: animal.sex,
    size: animal.size,
    color: animal.color,
    description: animal.description,
    personality: Array.isArray(animal.personality) ? animal.personality : [],
    imageUrls: animal.image_urls || animal.imageUrls || [],
    adoptionFee: animal.adoption_fee || animal.adoptionFee,
    intakeDate: animal.intake_date || animal.intakeDate,
    postedDate: animal.posted_date || animal.postedDate,
    status: animal.status,
    adoptionDate: animal.adoption_date || animal.adoptionDate,
    adoptionStory: animal.adoption_story || animal.adoptionStory,
    goodWith: {
      children: animal.good_with_children ?? false,
      dogs: animal.good_with_dogs ?? false,
      cats: animal.good_with_cats ?? false,
    },
    location: animal.location,
    // Add other fields as needed
  };
}

interface AnimalListProps {
  animals?: any[];
  onFilterChange?: (filters: {
    species?: string;
    age?: string;
    size?: string;
    goodWith?: string;
  }) => void;
  showAdopted?: boolean;
  initialFilters?: {
    species?: string;
    age?: string;
    size?: string;
    goodWith?: string;
    location?: string;
    price?: string;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AnimalList: React.FC<AnimalListProps> = ({
  animals: propsAnimals,
  onFilterChange,
  showAdopted = false,
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState({
    species: initialFilters.species || "",
    age: initialFilters.age || "",
    size: initialFilters.size || "",
    goodWith: initialFilters.goodWith || "",
    location: initialFilters.location || "",
    price: initialFilters.price || "",
  });
  const [animals, setAnimals] = useState<any[]>([]);
  const [filteredAnimals, setFilteredAnimals] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch animals only if not provided via props
  useEffect(() => {
    async function fetchAnimals() {
      // If animals are provided via props, use them instead
      if (propsAnimals && propsAnimals.length > 0) {
        setAnimals(propsAnimals.map(normalizeAnimal));
        setLoading(false);
        return;
      }

      // Otherwise, fetch available animals
      setLoading(true);
      setError("");
      try {
        const endpoint = showAdopted
          ? `${API_BASE_URL}/api/animals/adopted`
          : `${API_BASE_URL}/api/animals/available`;
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error("Failed to fetch animals");
        const data = await res.json();
        setAnimals(data.map(normalizeAnimal));
      } catch (err) {
        setError("Could not load animals. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchAnimals();
  }, [propsAnimals, showAdopted]);

  // Update filters when initialFilters prop changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      species: initialFilters.species || "",
      age: initialFilters.age || "",
      size: initialFilters.size || "",
      goodWith: initialFilters.goodWith || "",
      location: initialFilters.location || "",
      price: initialFilters.price || "",
    }));
  }, [JSON.stringify(initialFilters)]);

  useEffect(() => {
    // Apply filters
    let result = animals;
    if (filters.species) {
      result = result.filter((animal) => 
        animal.species.toLowerCase() === filters.species.toLowerCase()
      );
    }
    if (filters.age) {
      result = result.filter((animal) => animal.age === filters.age);
    }
    if (filters.size) {
      result = result.filter((animal) => animal.size === filters.size);
    }
    if (filters.goodWith) {
      if (filters.goodWith === "children")
        result = result.filter((animal) => animal.goodWith.children);
      if (filters.goodWith === "dogs")
        result = result.filter((animal) => animal.goodWith.dogs);
      if (filters.goodWith === "cats")
        result = result.filter((animal) => animal.goodWith.cats);
    }
    if (filters.location) {
      result = result.filter(
        (animal) =>
          animal.location &&
          animal.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    if (filters.price) {
      const [min, max] = filters.price.split("-").map(Number);
      result = result.filter((animal) =>
        !isNaN(min) && !isNaN(max)
          ? animal.adoptionFee >= min && animal.adoptionFee <= max
          : animal.adoptionFee <= min
      );
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (animal) =>
          animal.name.toLowerCase().includes(term) ||
          animal.breed.toLowerCase().includes(term) ||
          animal.description.toLowerCase().includes(term) ||
          animal.uniqueId.toLowerCase().includes(term) ||
          animal.personality.some((p: string) =>
            p.toLowerCase().includes(term)
          ) ||
          (animal.adoptionStory &&
            animal.adoptionStory.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting
    if (showAdopted) {
      // For adopted animals: Sort by adoption date (newest first)
      result = result.sort((a, b) => {
        const dateA = new Date(a.adoptionDate || 0).getTime();
        const dateB = new Date(b.adoptionDate || 0).getTime();
        return dateB - dateA; // Descending order (newest first)
      });
    } else {
      // For available animals: Sort by days in SFP (longest first)
      result = result.sort((a, b) => {
        const daysA = calculateDaysInSFP(a.intakeDate);
        const daysB = calculateDaysInSFP(b.intakeDate);
        return daysB - daysA; // Descending order (longest waiting first)
      });
    }
    
    setFilteredAnimals(result);
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [animals, filters, searchTerm, onFilterChange, showAdopted]);

  const handleFilterChange = (
    filterType: keyof typeof filters,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      species: "",
      age: "",
      size: "",
      goodWith: "",
      location: "",
      price: "",
    });
    setSearchTerm("");
  };

  const renderFilters = () => (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">
          {showAdopted ? "Success Stories" : "Find Your Perfect Match"}
        </h2>

        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md ${
                viewMode === "grid"
                  ? "bg-white dark:bg-gray-700 text-[#4C51A4] shadow-sm"
                  : "text-gray-600 dark:text-gray-400"
              }`}
              aria-label="Grid view"
            >
              <i className="fa-solid fa-th-large"></i>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md ${
                viewMode === "list"
                  ? "bg-white dark:bg-gray-700 text-[#4C51A4] shadow-sm"
                  : "text-gray-600 dark:text-gray-400"
              }`}
              aria-label="List view"
            >
              <i className="fa-solid fa-list"></i>
            </button>
          </div>

          {/* Clear filters button */}
          {(filters.species ||
            filters.age ||
            filters.size ||
            filters.goodWith ||
            filters.location ||
            filters.price ||
            searchTerm) && (
            <button
              onClick={clearFilters}
              className="text-gray-600 dark:text-gray-400 hover:text-[#4C51A4] dark:hover:text-[#4C51A4] transition-colors"
              aria-label="Clear filters"
            >
              <i className="fa-solid fa-filter-circle-xmark text-[#4C51A4]"></i>
            </button>
          )}
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder={`Search by name, breed, ID, or description...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
          <i className="fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      {!showAdopted && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Species filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Species
            </label>
            <select
              value={filters.species}
              onChange={(e) => handleFilterChange("species", e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none"
            >
              <option value="">All Species</option>
              <option value="dog">Dogs</option>
              <option value="cat">Cats</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Age filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Age Group
            </label>
            <select
              value={filters.age}
              onChange={(e) => handleFilterChange("age", e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none"
            >
              <option value="">All Ages</option>
              <option value="baby">Baby (0-1 year)</option>
              <option value="young">Young (1-3 years)</option>
              <option value="adult">Adult (3-8 years)</option>
              <option value="senior">Senior (8+ years)</option>
            </select>
          </div>

          {/* Size filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Size
            </label>
            <select
              value={filters.size}
              onChange={(e) => handleFilterChange("size", e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none"
            >
              <option value="">All Sizes</option>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </select>
          </div>

          {/* Good with filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Good With
            </label>
            <select
              value={filters.goodWith}
              onChange={(e) => handleFilterChange("goodWith", e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none"
            >
              <option value="">Any Household</option>
              <option value="children">Children</option>
              <option value="dogs">Other Dogs</option>
              <option value="cats">Cats</option>
            </select>
          </div>

          {/* Location filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location
            </label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none"
            >
              <option value="">All Locations</option>
              <option value="PetSmart">PetSmart</option>
              <option value="PetValu">PetValu</option>
              <option value="Foster">Foster Home</option>
            </select>
          </div>

          {/* Price filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Adoption Fee
            </label>
            <select
              value={filters.price}
              onChange={(e) => handleFilterChange("price", e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none"
            >
              <option value="">Any Price</option>
              <option value="0-100">$0 - $100</option>
              <option value="100-200">$100 - $200</option>
              <option value="200-300">$200 - $300</option>
              <option value="300+">$300+</option>
            </select>
          </div>
        </div>
      )}

      {/* Active filters display */}
      {(filters.species ||
        filters.age ||
        filters.size ||
        filters.goodWith ||
        filters.location ||
        filters.price ||
        searchTerm) && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active filters:
            </span>
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#DF696B]/20 text-[#DF696B] dark:bg-[#DF696B]/30 dark:text-[#DF696B]">
                Search: {searchTerm}
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-1 text-[#DF696B] hover:text-[#DF696B]/80"
                  aria-label="Remove search filter"
                >
                  <i className="fa-solid fa-times-circle"></i>
                </button>
              </span>
            )}
            {filters.species && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                Species: {filters.species}
                <button
                  onClick={() => handleFilterChange("species", "")}
                  className="ml-1 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  aria-label="Remove species filter"
                >
                  <i className="fa-solid fa-times-circle"></i>
                </button>
              </span>
            )}
            {filters.age && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                Age:{" "}
                {filters.age.charAt(0).toUpperCase() + filters.age.slice(1)}
                <button
                  onClick={() => handleFilterChange("age", "")}
                  className="ml-1 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  aria-label="Remove age filter"
                >
                  <i className="fa-solid fa-times-circle"></i>
                </button>
              </span>
            )}
            {filters.size && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                Size: {filters.size}
                <button
                  onClick={() => handleFilterChange("size", "")}
                  className="ml-1 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  aria-label="Remove size filter"
                >
                  <i className="fa-solid fa-times-circle"></i>
                </button>
              </span>
            )}
            {filters.goodWith && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                Good With: {filters.goodWith}
                <button
                  onClick={() => handleFilterChange("goodWith", "")}
                  className="ml-1 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  aria-label="Remove good with filter"
                >
                  <i className="fa-solid fa-times-circle"></i>
                </button>
              </span>
            )}
            {filters.location && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                Location: {filters.location}
                <button
                  onClick={() => handleFilterChange("location", "")}
                  className="ml-1 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  aria-label="Remove location filter"
                >
                  <i className="fa-solid fa-times-circle"></i>
                </button>
              </span>
            )}
            {filters.price && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                Price: ${filters.price}
                <button
                  onClick={() => handleFilterChange("price", "")}
                  className="ml-1 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  aria-label="Remove price filter"
                >
                  <i className="fa-solid fa-times-circle"></i>
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderAnimalGrid = () => {
    if (filteredAnimals.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-12 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <i className="fa-solid fa-search text-gray-400 text-4xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {showAdopted ? "No success stories yet" : "No matches found"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              {showAdopted
                ? "We will be adding success stories soon as our animals find their forever homes."
                : "We couldn't find any animals matching your criteria. Try adjusting your filters or search term."}
            </p>
            <button
              onClick={clearFilters}
              className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      );
    }

    if (viewMode === "grid") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnimals.map((animal) => (
            <AnimalCard
              key={animal.uniqueId}
              animal={animal}
              showDaysInSFP={!showAdopted}
              showAdoptionDate={showAdopted}
              isAdopted={showAdopted}
            />
          ))}
        </div>
      );
    } else {
      // List view
      return (
        <div className="space-y-4">
          {filteredAnimals.map((animal) => (
            <div
              key={animal.uniqueId}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row"
            >
              <div className="w-full sm:w-1/4 h-40 sm:h-auto overflow-hidden">
                <img
                  src={animal.imageUrls[0]}
                  alt={animal.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
              </div>
              <div className="p-4 sm:p-6 flex-1 flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      ID: {animal.uniqueId}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      {animal.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 mt-2 sm:mt-0">
                    <span
                      className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                        animal.sex === "Male"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                          : "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100"
                      }`}
                    >
                      {animal.sex}
                    </span>
                    {!showAdopted && (
                      <span className="text-[#4C51A4] font-semibold">
                        ${animal.adoptionFee}
                      </span>
                    )}
                    {showAdopted && animal.adoptionDate && (
                      <span className="text-green-500 font-semibold">
                        Adopted: {animal.adoptionDate}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <div className="flex items-center">
                    <i className="fa-solid fa-birthday-cake text-[#4C51A4] mr-1.5"></i>
                    <span>{animal.age}</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fa-solid fa-paw text-[#4C51A4] mr-1.5"></i>
                    <span>{animal.breed}</span>
                  </div>
                  {!showAdopted && (
                    <div className="flex items-center">
                      <i className="fa-solid fa-calendar-days text-[#4C51A4] mr-1.5"></i>
                      <span>
                        {calculateDaysInSFP(animal.intakeDate)} days in SFP
                      </span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <i className="fa-solid fa-ruler text-[#4C51A4] mr-1.5"></i>
                    <span>{animal.size}</span>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                  {showAdopted && animal.adoptionStory
                    ? animal.adoptionStory
                    : animal.description}
                </p>

                {!showAdopted && (
                  <>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {animal.personality.map(
                        (trait: string, index: number) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full"
                          >
                            {trait}
                          </span>
                        )
                      )}
                    </div>
                  </>
                )}

                <div className="mt-auto pt-2 flex justify-end">
                  <a
                    href={`/animal/${animal.uniqueId}`}
                    className="inline-block bg-[#4C51A4] hover:bg-[#383C80] text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {showAdopted ? "View Story" : "View Details"}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-lg text-gray-500">
        Loading animals...
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div>
      {renderFilters()}
      {renderAnimalGrid()}
    </div>
  );
};

export default AnimalList;
