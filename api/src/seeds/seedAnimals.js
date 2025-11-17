import sequelize from "../config/database.js";
import Animal from "../models/Animal.js";

async function seedAnimals() {
  try {
    await sequelize.sync();

    const animals = [
      {
        unique_id: "SFP-001",
        name: "Mochi",
        species: "Cat",
        breed: "Domestic Shorthair",
        age: "2 years",
        sex: "Female",
        size: "Small",
        color: "Calico",
        description: "A sweet, gentle girl who loves cuddles and soft blankets.",
        personality: ["Calm", "Affectionate", "Quiet"],
        image_urls: [
          "https://placekitten.com/400/400",
          "https://placekitten.com/401/400"
        ],
        vaccinated: true,
        neutered: true,
        good_with_children: true,
        good_with_dogs: false,
        good_with_cats: true,
        location: "Toronto, ON",
        adoption_fee: 200,
        intake_date: "2024-12-01",
        posted_date: "2024-12-10",
        status: "Ready for Adoption"
      },
      {
        unique_id: "SFP-002",
        name: "Benny",
        species: "Dog",
        breed: "Golden Retriever",
        age: "1 year",
        sex: "Male",
        size: "Large",
        color: "Golden",
        description: "Energetic, playful, and loves people!",
        personality: ["Energetic", "Friendly", "Playful"],
        image_urls: [
          "https://placedog.net/500/400",
          "https://placedog.net/501/400"
        ],
        vaccinated: true,
        neutered: false,
        good_with_children: true,
        good_with_dogs: true,
        good_with_cats: false,
        location: "Mississauga, ON",
        adoption_fee: 350,
        intake_date: "2024-11-20",
        posted_date: "2024-12-01",
        status: "Published"
      },
      {
        unique_id: "SFP-003",
        name: "Peanut",
        species: "Cat",
        breed: "Tabby",
        age: "6 months",
        sex: "Male",
        size: "Small",
        color: "Brown Tabby",
        description: "A curious kitten who loves climbing and exploring.",
        personality: ["Curious", "Playful"],
        image_urls: [
          "https://placekitten.com/402/400"
        ],
        vaccinated: false,
        neutered: false,
        good_with_children: true,
        good_with_dogs: false,
        good_with_cats: true,
        location: "Markham, ON",
        adoption_fee: 180,
        intake_date: "2025-01-05",
        posted_date: "2025-01-08",
        status: "Fostering"
      }
    ];

    for (const animal of animals) {
      await Animal.findOrCreate({
        where: { unique_id: animal.unique_id },
        defaults: animal
      });
    }

    console.log("✓ Animals table seeded successfully");
    process.exit(0);

  } catch (error) {
    console.error("Error seeding animals:", error);
    process.exit(1);
  }
}

seedAnimals();
