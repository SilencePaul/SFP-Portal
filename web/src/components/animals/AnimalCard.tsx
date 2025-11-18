import React from "react";
import { Link } from "react-router-dom";
import { calculateDaysInSFP } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";

interface AnimalCardProps {
  animal: {
    id: string;
    uniqueId: string;
    name: string;
    species: string;
    breed: string;
    age: string;
    sex: string;
    size: string;
    color: string;
    description: string;
    personality: string[];
    imageUrls: string[];
    adoptionFee: number;
    intakeDate: string;
    postedDate: string;
    status: string;
    adoptionDate?: string;
    adoptionStory?: string;
    goodWith: {
      children: boolean;
      dogs: boolean;
      cats: boolean;
    };
    location: string;
  };
  className?: string;
  showUniqueId?: boolean;
  showDaysInSFP?: boolean;
  showAdoptionDate?: boolean;
  isAdopted?: boolean;
}

const AnimalCard: React.FC<AnimalCardProps> = ({
  animal,
  className,
  showUniqueId = true,
  showDaysInSFP = true,
  showAdoptionDate = false,
  isAdopted = false,
}) => {
  const daysInSFP = calculateDaysInSFP(animal.intakeDate);

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col",
        className
      )}
    >
      {/* Animal Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={animal.imageUrls[0]}
          alt={animal.name}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
        />
        {/* Species badge */}
        <div className="absolute top-3 left-3 bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          {animal.species}
        </div>

        {/* Adoption fee badge */}
        {!isAdopted && animal.status !== "reserved" && (
          <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 text-[#4C51A4] text-xs font-semibold px-2.5 py-1 rounded-full shadow">
            ${animal.adoptionFee}
          </div>
        )}

        {/* Reserved badge */}
        {animal.status === "reserved" && (
          <div className="absolute top-3 right-3 bg-yellow-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
            Reserved
          </div>
        )}

        {/* Adopted badge */}
        {isAdopted && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
            Adopted
          </div>
        )}
      </div>

      {/* Animal Info */}
      <div className="p-4 flex-grow flex flex-col">
        {/* Unique ID */}
        {showUniqueId && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            ID: {animal.uniqueId}
          </div>
        )}

        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            {animal.name}
          </h3>
          <span
            className={`text-sm font-medium px-2 py-0.5 rounded-full ${
              animal.sex === "Male"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                : "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100"
            }`}
          >
            {animal.sex}
          </span>
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
          {showDaysInSFP && (
            <>
              <div className="flex items-center">
                <i className="fa-solid fa-calendar-days text-[#4C51A4] mr-1.5"></i>
                <span>{daysInSFP} days in SFP</span>
              </div>
            </>
          )}
          {showAdoptionDate && animal.adoptionDate && (
            <div className="flex items-center">
              <i className="fa-solid fa-calendar-check text-green-500 mr-1.5"></i>
              <span>Adopted: {animal.adoptionDate}</span>
            </div>
          )}
          <div className="flex items-center">
            <i className="fa-solid fa-ruler text-[#4C51A4] mr-1.5"></i>
            <span>{animal.size}</span>
          </div>
        </div>

        {/* Adoption story for adopted animals */}
        {isAdopted && animal.adoptionStory && (
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
            {animal.adoptionStory}
          </p>
        )}

        {/* Personality traits for available animals */}
        {!isAdopted && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {animal.personality.map((trait, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full"
              >
                {trait}
              </span>
            ))}
          </div>
        )}

        {/* Good with indicators for available animals */}
        {!isAdopted && (
          <div className="flex items-center gap-2 mb-4 text-sm">
            <span className="text-gray-700 dark:text-gray-300">Good with:</span>
            {animal.goodWith.children && (
              <span className="flex items-center text-green-600 dark:text-green-400">
                <i className="fa-solid fa-child mr-1"></i>
                <span>kids</span>
              </span>
            )}
            {animal.goodWith.dogs && (
              <span className="flex items-center text-green-600 dark:text-green-400">
                <i className="fa-solid fa-dog mr-1"></i>
                <span>dogs</span>
              </span>
            )}
            {animal.goodWith.cats && (
              <span className="flex items-center text-green-600 dark:text-green-400">
                <i className="fa-solid fa-cat mr-1"></i>
                <span>cats</span>
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        {!isAdopted && (
          <div className="mt-auto pt-2">
            <Link
              to={`/animal/${animal.uniqueId}`}
              className="block w-full text-center bg-[#4C51A4] hover:bg-[#383C80] text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              View Details
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimalCard;
