// Mock database for development without requiring PostgreSQL
// This allows testing API endpoints without database setup

const mockData = {
  animals: [
    {
      id: 1,
      name: "Max",
      species: "Dog",
      breed: "Golden Retriever",
      age: 3,
      description: "Friendly and energetic",
      volunteer_id: 1,
      status: "available",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: "Bella",
      species: "Cat",
      breed: "Siamese",
      age: 2,
      description: "Calm and affectionate",
      volunteer_id: 2,
      status: "available",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  volunteers: [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "555-1234",
      role: "VOLUNTEER",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  applications: [],
  interviews: [],
  contracts: [],
};

export const mockDatabase = {
  findAll: async (model) => {
    return mockData[model] || [];
  },
  findById: async (model, id) => {
    const items = mockData[model] || [];
    return items.find((item) => item.id === parseInt(id));
  },
  create: async (model, data) => {
    const items = mockData[model] || [];
    const newItem = {
      id: Math.max(...items.map((i) => i.id), 0) + 1,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    items.push(newItem);
    return newItem;
  },
  update: async (model, id, data) => {
    const items = mockData[model] || [];
    const index = items.findIndex((item) => item.id === parseInt(id));
    if (index !== -1) {
      items[index] = { ...items[index], ...data, updatedAt: new Date() };
      return items[index];
    }
    return null;
  },
  delete: async (model, id) => {
    const items = mockData[model] || [];
    const index = items.findIndex((item) => item.id === parseInt(id));
    if (index !== -1) {
      const deleted = items[index];
      items.splice(index, 1);
      return deleted;
    }
    return null;
  },
};
