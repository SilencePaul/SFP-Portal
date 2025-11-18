# SFP Animal Management System - Backend

This is the backend API for the Save Fur Pets (SFP) Animal Management System. It's built with Node.js, Express, and PostgreSQL.

## Features

- RESTful API endpoints for managing:
  - Animals
  - Volunteers
  - Applications
  - Interviews
  - Contracts
- JWT authentication with role-based access control
- PostgreSQL database integration with Sequelize ORM
- Input validation
- Error handling
- Database seeding with sample data

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn or pnpm

## Installation

1. Clone the repository

2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables

```bash
cp .env.example .env
# Edit .env file with your database credentials and other settings
```

4. Create PostgreSQL database

```sql
CREATE DATABASE sfp_portal;
```

## Database Setup

1. Run database migrations

```bash
npm run migrate
```

2. Seed the database with sample data

```bash
npm run seed
```

## Running the Server

Start the server in development mode

```bash
npm run dev
```

Start the server in production mode

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/register` - Register a new volunteer
- `GET /api/auth/verify` - Verify JWT token (protected)

### Animals

- `GET /api/animals` - Get all animals
- `GET /api/animals/available` - Get available animals
- `GET /api/animals/:id` - Get animal by ID
- `POST /api/animals` - Create a new animal (protected)
- `PUT /api/animals/:id` - Update animal (protected)
- `PATCH /api/animals/:id/state` - Update animal state (protected)

### Volunteers

- `GET /api/volunteers` - Get all volunteers (protected)
- `GET /api/volunteers/current` - Get current volunteers (protected)
- `GET /api/volunteers/:id` - Get volunteer by ID (protected)
- `POST /api/volunteers` - Create a new volunteer
- `PUT /api/volunteers/:id` - Update volunteer (protected)

### Applications

- `GET /api/applications` - Get all applications (protected)
- `GET /api/applications/:id` - Get application by ID (protected)
- `GET /api/applications/animal/:animalId` - Get applications by animal (protected)
- `POST /api/applications` - Create a new application
- `PATCH /api/applications/:id/status` - Update application status (protected)

### Interviews

- `GET /api/interviews` - Get all interviews (protected)
- `GET /api/interviews/:id` - Get interview by ID (protected)
- `GET /api/interviews/application/:applicationId` - Get interviews by application (protected)
- `GET /api/interviews/volunteer/:volunteerId` - Get interviews by volunteer (protected)
- `POST /api/interviews` - Schedule an interview (protected)
- `PATCH /api/interviews/:id/result` - Update interview result (protected)

### Contracts

- `GET /api/contracts` - Get all contracts (protected)
- `GET /api/contracts/:id` - Get contract by ID (protected)
- `GET /api/contracts/animal/:animalId` - Get contracts by animal (protected)
- `POST /api/contracts` - Create a contract (protected)
- `PATCH /api/contracts/:id/signature` - Update contract signature (protected)

### Utility

- `GET /api/health` - Health check endpoint
- `POST /api/migrate` - Run database migrations (development only)

## Role-Based Access Control

The API uses role-based access control to restrict access to certain endpoints. The available roles are:

- `admin` - Full access to all endpoints
- `interviewer` - Manage interviews assigned to them and view applications
- `foster` - Manage animals they are responsible for

## License

This project is licensed under the MIT License.
