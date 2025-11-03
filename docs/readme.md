# 🐾 SFP Animal Management System

A cloud-native adoption management platform for **Save Fur Pets (SFP)** — a volunteer-run animal rescue organization.  
This system centralizes the adoption workflow from foster submission to electronic contract, replacing spreadsheets and emails with a single integrated web platform.

---

## 📘 Overview

**Goal:** Streamline SFP’s adoption pipeline to reduce volunteer workload, improve transparency, and enhance data security.

**Workflow:**

> Foster draft → Coordinator review → Publish → Application → Interview → Decision → E-contract → Adopted

---

## 🧱 Project Structure

sfp-animal-system/
│
├── api/ # Node.js backend
│ ├── src/
│ │ ├── routes/ # REST API routes (Animals, Applications, etc.)
│ │ ├── controllers/ # Request handlers and business logic
│ │ ├── models/ # PostgreSQL entities via ORM (e.g., Prisma/Sequelize)
│ │ ├── middleware/ # Auth, validation, error handlers
│ │ └── utils/ # Helpers (email, presigned URLs, logging)
│ ├── tests/ # Unit and integration tests
│ ├── Dockerfile # API service container
│ └── package.json
│
├── web/ # React frontend
│ ├── src/
│ │ ├── components/ # Reusable UI widgets
│ │ ├── pages/ # Page-level views (Dashboard, AnimalDetail, etc.)
│ │ ├── services/ # API service layer (axios/fetch wrappers)
│ │ ├── context/ # Auth and global state providers
│ │ └── styles/ # Tailwind / SCSS / CSS modules
│ ├── public/
│ ├── Dockerfile # Web service container
│ └── package.json
│
├── infra/ # Infrastructure as Code
│ ├── docker-compose.yml # Local multi-container setup (API, DB, Redis, Web)
│ ├── k8s/ # Kubernetes manifests for DOKS deployment
│ │ ├── deployments/
│ │ ├── services/
│ │ ├── ingress/
│ │ └── secrets/
│ └── scripts/ # Utility scripts (init-db, backups, etc.)
│
├── serverless/ # Event-driven functions (DigitalOcean Functions)
│ ├── email-handler/ # Sends transactional emails & ICS invites
│ ├── cleanup-jobs/ # Nightly stale data cleanup
│ └── contract-reminder/ # Contract signing reminders
│
├── docs/ # Documentation & diagrams
│ ├── architecture.png # System architecture diagram
│ ├── openapi.yaml # REST API specification
│ ├── schema.sql # Database schema snapshot
│ └── README.md # Documentation index
│
├── .env.example # Example environment variables
├── README.md # (This file)
└── LICENSE

---

## 🚀 Setup Guide

### Prerequisites

- Node.js ≥ 18
- Docker + Docker Compose
- PostgreSQL (or rely on the containerized DB)
- (Optional) DigitalOcean account for production deployment

---

1️⃣ Clone and Install

```bash
git clone https://github.com/savefurpets/sfp-animal-system.git
cd sfp-animal-system

2️⃣ Local Development (Docker Compose)

To start the entire stack (API, Web, DB, Redis, NGINX):

cd infra
docker compose up --build


Then open:

Frontend: http://localhost:3000

API: http://localhost:5000/api


3️⃣ Manual Setup (Alternative)

Run backend and frontend separately (no containers):

# Backend

cd api
npm install
npm run dev

# Frontend

cd ../web
npm install
npm start

Ensure .env values for API and frontend are properly set.

⚙️ Environment Variables

Example .env.example (root-level):

# Common

NODE_ENV=development

# Backend

DATABASE_URL=postgres://user:pass@db:5432/sfp
JWT_SECRET=supersecret
REDIS_URL=redis://redis:6379
CLOUD_STORAGE_BUCKET=sfp-media
CLOUD_STORAGE_REGION=nyc3

# Frontend

REACT_APP_API_BASE_URL=http://localhost:5000/api

🔐 Authentication and Roles
Role Description
Foster Creates and updates animal drafts
Coordinator Reviews, publishes, manages applications
Interviewer Conducts interviews and records outcomes
Applicant Submits and tracks adoption applications

Authentication uses JWT tokens, with access control handled via RBAC middleware in api/src/middleware/auth.js.

☁️ Deployment (Kubernetes on DigitalOcean)

Push all images to GitHub Container Registry:

docker build -t ghcr.io/sfp/api:latest ./api
docker build -t ghcr.io/sfp/web:latest ./web
docker push ghcr.io/sfp/api:latest
docker push ghcr.io/sfp/web:latest

Apply K8s manifests:

kubectl apply -f infra/k8s/

Verify:

kubectl get pods
kubectl get svc
kubectl get ingress

🧩 Future Enhancements

Serverless email + ICS scheduling

e-Signature integration for contracts

Automated backups via DigitalOcean Volumes

CI/CD GitHub Actions for build + deploy

👩‍💻 Team
Member Role Focus
Yiming Liu Backend & Auth Owner Database schema, API endpoints, RBAC
Jinhua Yan Frontend & UI Owner React interface, media upload, scheduler
Jiayan Xu Platform & DevOps Owner Docker/K8s, monitoring, CI/CD

📜 License
MIT License © Save Fur Pets Development Team
```
