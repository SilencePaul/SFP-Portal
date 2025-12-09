# 🐾 SFP Animal Management System — Final Report

**Course:** Cloud Computing (ECE 1779/CSC 2233)  
**Project Name:** Save Fur Pets (SFP) Animal Management System

---

## Video Demo

Video URL: https://youtu.be/kvB1B6O-kOc

## Deployment URL

Deployed on: http://129.212.134.118

## 1. Team Information

| Name       | Student Number | Email                           | Role                    |
| ---------- | -------------- | ------------------------------- | ----------------------- |
| Yiming Liu | 1011337402     | yimingpaul.liu@mail.utoronto.ca | Frontend & UI Owner     |
| Jinhua Yan | 1012858686     | jinhua.yan@mail.utoronto.ca     | Backend & Auth Owner    |
| Jiayan Xu  | 1012882436     | rayjiayan.xu@mail.utoronto.ca   | Platform & DevOps Owner |

---

## 2. Motivation

### Problem Statement

Save Fur Pets (SFP) is a volunteer-run animal rescue organization that faced critical operational inefficiencies:

- **Fragmented Workflow:** Adoption processes relied on scattered tools—spreadsheets, email threads, and Google Forms—making it difficult to track animals and applications.
- **Slow Turnaround:** Animals could take days to move from foster care to public listings due to manual coordination.
- **Inconsistent Processes:** Different coordinators followed different workflows, leading to errors and miscommunication.
- **Privacy Risks:** Sensitive adopter information (names, phone numbers, addresses) was stored and shared in one platform only with risks of lossing or leaking.
- **Lack of transparency:** No standardized procedure in performing various volunteer jobs, information acquiring process not centeralized.

### Significance

By building a centralized, cloud-native platform, we aimed to:

1. **Reduce volunteer workload** through automation (e.g., automated emails, calendar invites)
2. **Increase adoption speed** by streamlining the publish-and-interview workflow
3. **Enhance data security** with role-based access control and encrypted storage
4. **Improve transparency** with real-time status tracking for all stakeholders
5. **Demonstrate cloud best practices** including containerization, orchestration, and monitoring

This project directly addresses the operational pain points of a real-world organization while serving as a comprehensive demonstration of cloud computing principles.

---

## 3. Objectives

### Primary Objectives

1. **Centralize Adoption Workflow:**  
   Consolidate foster submissions, coordinator reviews, applicant applications, interview scheduling, and contract signing into a single integrated system.

2. **Implement Role-Based Access Control (RBAC):**  
   Support four distinct user roles—Foster, Interviewer, Interviewer, and Applicant(currently applicants are treated as individual application) with appropriate permissions and UI views.

3. **Ensure Data Privacy and Security:**  
   Use JWT authentication, encrypted storage with hashing, and presigned URLs for media access.

4. **Deploy on Cloud Infrastructure:**  
   Containerize the application using Docker and orchestrate it with Kubernetes on DigitalOcean, demonstrating production-ready deployment patterns.

5. **Demonstrate High-Availability Patterns:**  
   Implement rolling updates, auto-scaling via HPA, health checks, and persistent storage to ensure system reliability.

6. **Support Advance Features:**
   Implemented email automation with SendGrid to improve workflow efficiency and reduce volunteer workloads.

### Key Achievements

✅ **Animal Management (Foster):** Fosters can create, upload photos, and publish animal profiles to the public site.  
✅ **Animal Management (Admin):** Admins have full control - create, review, publish, and delete animals from the system.  
✅ **Application Management:** Applicants submit forms, coordinators triage and assign interviewers.  
✅ **Interview Scheduling:** Interviewers propose time slots; system sends automatic email notifications with interview details.  
✅ **Contract Management:** Automated contract generation, e-signature integration, and adoption confirmation (admin-approved only).  
✅ **Kubernetes Deployment:** Full orchestration on DOKS with rolling updates, auto-scaling, and persistent storage.

---

## 4. Technical Stack

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│              DigitalOcean Kubernetes (DOKS)         │
├─────────────────────────────────────────────────────┤
│ Load Balancer (HTTP) → Service → Deployment (Pods)  │
├─────────────────────────────────────────────────────┤
│  Frontend (React/Vite)  │  Backend (Node/Express)   │
│  Port: 3000             │  Port: 5000               │
├─────────────────────────────────────────────────────┤
│   PostgreSQL (RDS/Persistent Volume)                │
│   Redis (Cache & Sessions)                          │
│   DigitalOcean Spaces (S3-compatible object storage)│
└─────────────────────────────────────────────────────┘
```

### Technology Choices

| Component                   | Technology                               | Rationale                                                     |
| --------------------------- | ---------------------------------------- | ------------------------------------------------------------- |
| **Frontend**                | React + TypeScript + Tailwind CSS + Vite | Modern SPA framework, type safety, rapid builds               |
| **Backend**                 | Node.js + Express + Sequelize ORM        | JavaScript full-stack, rapid API development, mature ORM      |
| **Database**                | PostgreSQL                               | Relational data model, ACID compliance, rich feature set      |
| **Cache/Sessions**          | Redis                                    | In-memory cache for performance, session storage              |
| **Object Storage**          | DigitalOcean Spaces (S3-compatible)      | Serverless blob storage for animal photos                     |
| **Email Service**           | SendGrid                                 | Reliable transactional emails, webhook support                |
| **Containerization**        | Docker                                   | Reproducible environments, industry standard                  |
| **Orchestration**           | Kubernetes (DOKS)                        | Production-grade orchestration, auto-scaling, rolling updates |
| **Local Development**       | Docker Compose                           | Multi-container local stack matching production               |
| **Infrastructure Provider** | DigitalOcean                             | Developer-friendly, integrated storage/compute/k8s            |
| **Monitoring**              | DigitalOcean Metrics                     | Native integration, cost-effective observability              |

### Orchestration Approach: **Kubernetes on DigitalOcean**

We selected **Kubernetes (K8s) over Docker Swarm** because:

1. **Production-Grade:** Kubernetes is the industry standard for enterprise deployments.
2. **Auto-Scaling:** HPA automatically scales pods based on CPU and memory metrics.
3. **Rolling Updates:** Zero-downtime deployments with configurable surge/unavailability.
4. **Self-Healing:** Automatic pod restart on failure.
5. **Declarative Infrastructure:** Manifest-driven deployments, version control friendly.
6. **Multi-Tenancy:** Namespace isolation for different environments.

### Key Infrastructure Components

- **Deployments:** API, Web, Redis (replicated for high availability)
- **Services:** ClusterIP for internal communication, LoadBalancer for external access
- **HPA:** Auto-scales API and Web based on CPU/memory utilization
- **Persistent Volumes:** PostgreSQL backed by DigitalOcean volumes for data persistence
- **Secrets/ConfigMaps:** Secure storage for credentials and configuration

---

## 5. Features

### 5.1 Animal Management - Animal Upload (Foster)

**Description:**  
Fosters create animal profiles with photos, breed info, and description. Fosters can upload and publish animal listings to make them available for adoption.

**Key Features:**

- Create animal profiles with detailed information (species, breed, age, health notes)
- Upload photos to DigitalOcean Spaces with presigned URLs
- Publish animals directly to make them visible on public site
- Real-time status tracking and audit logs
- Foster-specific animal management dashboard

**How It Fulfills Requirements:**

- Demonstrates CRUD operations (Create, Read, Update, Delete)
- Shows cloud storage integration (DO Spaces) for media management
- Implements RBAC (Fosters can only manage their own animals)
- Provides audit trail for compliance

### 5.2 Animal Management - Admin Publish (Admin)

**Description:**  
Admins create animal profiles with photos, breed info, and description. Admins have full control over all animals, can review, publish, and delete listings.

**Key Features:**

- Create animal profiles with detailed information (species, breed, age, health notes)
- Upload photos to DigitalOcean Spaces with presigned URLs
- Review and approve animal drafts before publishing
- Publish animals to make them visible on public site
- Delete animal records permanently from the system
- Full visibility and management of all animals
- Real-time status tracking and audit logs
- Admin-wide animal management dashboard

**How It Fulfills Requirements:**

- Demonstrates full CRUD operations including delete
- Shows cloud storage integration (DO Spaces) for media management
- Implements RBAC (Admins have unrestricted access)
- Provides audit trail for compliance
- Demonstrates admin oversight and approval workflows

### 5.3 Application Management (Applicant & Foster/Admin)

**Description:**  
Applicants submit adoption forms; fosters or admins review, comment, and triage applications.

**Key Features:**

- Online application forms per animal
- Confirmation emails via SendGrid
- All roles volunteer dashboard with status filtering
- Comments and internal notes
- Bulk triage actions

**How It Fulfills Requirements:**

- Demonstrates email service integration
- Shows form validation and state transitions
- Implements role-based visibility (Admins and fosters see all applications, interviwers only see applications assigned to them)

### 5.4 Interview Scheduling (Interviewer & Applicant)

**Description:**  
Interviewers propose interview times; system generates calendar invites (ICS) and emails.

**Key Features:**

- Time slot selection
- Automatic email notifications with interview details sent to both parties
- Interview outcome recording (Approved/Rejected)

**How It Fulfills Requirements:**

- Demonstrates event-driven architecture
- Shows email templating and transactional notifications
- Implements interview workflow automation

### 5.5 Contract Management (Admin & Adopter)

**Description:**  
After interviewers mark applicants as reviewed, admins approve qualified applicants and generate adoption agreements pre-filled with animal and adopter info. Contracts are sent for e-signature via email.

**Key Features:**

- PDF generation with adopter and animal data
- E-signature link in contract emails
- Webhook integration to update status on signature
- Automatic "Adopted" state transition

**How It Fulfills Requirements:**

- Demonstrates document generation and webhooks
- Shows multi-step transaction workflow with role-based approval gates (Interviewer → Review, Admin → Approve)
- Implements final state confirmation with admin oversight

### 5.6 Public Website (Public & Applicants)

**Description:**  
Searchable, public-facing listing of adoptable animals.

**Key Features:**

- `/adoptables` — searchable animal grid with filters
- `/animal/:id` — detailed animal page with photos and "Apply" button
- No PII exposure on public endpoints
- Responsive design for mobile/desktop

**How It Fulfills Requirements:**

- Demonstrates public vs. authenticated API split
- Shows SEO-friendly URLs and pagination
- Ensures data privacy by redacting sensitive fields

### 5.7 User Authentication & RBAC (All Users)

**Description:**  
JWT-based authentication with four role types: Foster, Interviewer, Admin.

**Key Features:**

- Login/signup with email and password
- JWT tokens with 24-hour expiry
- Role-based middleware enforcing access control
- Protected routes and API endpoints
- Secure password hashing with bcrypt

**How It Fulfills Requirements:**

- Demonstrates authentication best practices
- Shows authorization enforcement
- Implements secure session management

### 5.8 Delete Animal Feature (Admin Only)

**Description:**  
Admins can permanently delete animal records from the system with a confirmation dialog.

**Key Features:**

- "Delete" button (trash icon) in Animal Management table
- Confirmation dialog: "Are you sure you want to delete 'AnimalName'? This action is permanent."
- Calls `DELETE /api/animals/:id` endpoint
- Removes animal from UI on successful deletion
- Success/error toast notifications
- Backend enforces admin-only permission (403 Forbidden for non-admin)

**How It Fulfills Requirements:**

- Demonstrates full CRUD operations
- Shows HTTP DELETE method usage
- Implements destructive action confirmation
- Proves RBAC enforcement on backend
- **Used as Rolling Update Demo:** Small UI change (button text/icon) deployed via rolling updates to show zero-downtime updates on Kubernetes

---

## 6. User Guide

### 6.1 Accessing the Application

**Live URL:** `http://129.212.134.118` (DigitalOcean Kubernetes Ingress)

### 6.2 User Roles and Login

#### Role: **Foster**

- **Email:** `foster@example.com` | **Password:** `password123`
- **Access:** Create and publish animal profiles, upload photos, view applications

#### Role: **Admin**

- **Email:** `admin@example.com` | **Password:** `password123`
- **Access:** Create and publish animals, review and publish animal drafts, triage applications, assign interviewers, delete animals, view all data

#### Role: **Interviewer**

- **Email:** `interviewer@example.com` | **Password:** `password123`
- **Access:** View assigned applications, schedule interviews, record interview outcomes

### 6.3 Main Features & Workflows

#### **Feature 1: Browse Public Adoptables**

1. Navigate to `/adoptables` (or Homepage → "Browse Adoptables")
2. View searchable grid of published animals
3. Filter by species, breed, size, adoption fee
4. Click animal card to view details

#### **Feature 2: Submit an Application (Applicant)**

1. From animal detail page, click **"Apply Now"** button
2. Fill out adoption application form:
   - Living situation (house/apartment, rental/own)
   - Household info (adults, children, pets)
   - Experience with animals
   - References
3. Click **"Submit Application"**
4. Receive confirmation email; track status in Dashboard

#### **Feature 3: Foster Upload and Publish Animal Profile**

1. Log in as Foster
2. Navigate to **Animal Management** → **"Add New Animal"**
3. Fill form:
   - Animal name, species, breed
   - Age, sex, color, size
   - Description and health notes
4. Upload **3-5 photos** via file picker
5. Click **"Publish"** to make animal visible on public site
6. Animal now appears in `/adoptables` where applicants can apply

#### **Feature 4: Admin Upload, Review, and Manage Animals**

1. Log in as Admin
2. Navigate to **Animal Management** → **"Add New Animal"**
3. Fill form:
   - Animal name, species, breed
   - Age, sex, color, size
   - Description and health notes
4. Upload **3-5 photos** via file picker
5. Click **"Publish"** to make animal visible, or **"Save as Draft"** to review later
6. View all animals in the system (including Foster-created ones)
7. Edit or delete any animal records as needed
8. Animal now visible on public site if published; applicants can apply

#### **Feature 5: Schedule Interview & Record Outcome (Interviewer)**

1. Log in as Interviewer
2. Navigate to **Schedule Interview** page
3. Select application and propose time slot
4. System sends email notification to applicant and interviewer with interview details
5. After conducting interview, click **Record Outcome**
6. If approved, change application status to **"Review"** (waiting for admin approval)
7. Admin reviews and approves qualified applicants for contract generation

---

## 7. Development Guide

### 7.1 Prerequisites

- **Node.js:** v18 or higher
- **Docker & Docker Compose:** Latest versions
- **Git:** Version control
- **pnpm:** Package manager (alternative to npm)
- **kubectl:** For Kubernetes operations (optional for local dev)

### 7.2 Local Development Setup (Docker Compose)

#### Step 1: Clone Repository

```bash
git clone https://github.com/SilencePaul/SFP-Portal.git
cd SFP-Portal
```

#### Step 2: Configure Environment Variables

Create `.env` files for backend and frontend:

**`api/.env`:**

```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgres://sfp_user:sfp_password@db:5432/sfp_portal
JWT_SECRET=your-super-secret-key-change-in-production
FRONTEND_URL=http://localhost:5173
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@savefurpets.org
DO_SPACES_KEY=your-do-spaces-key
DO_SPACES_SECRET=your-do-spaces-secret
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_SPACES_BUCKET=sfp-portal-media
REDIS_URL=redis://redis:6379
```

**`web/.env`:**

```
VITE_API_BASE_URL=http://localhost:5000
```

#### Step 3: Start the Full Stack

```bash
cd infra
docker-compose -f docker-compose.yml up --build
```

Services will start:

- **Frontend:** http://localhost:3000
- **API:** http://localhost:5000
- **Database:** PostgreSQL on localhost:5432
- **Redis:** localhost:6379

#### Step 4: Initialize Database

```bash
# Run migrations
docker-compose exec api pnpm run migrate

# (Optional) Seed with mock data
docker-compose exec api pnpm run seed
```

#### Step 5: Test the Application

1. Open http://localhost:3000 in browser
2. Log in with test credentials (see User Guide section 6.2)
3. Test CRUD operations: CRUD animal, submit application, schedule interview

### 7.3 Manual Local Setup (Without Docker)

#### Backend

```bash
cd api
pnpm install
pnpm run dev
# API runs on http://localhost:5000
```

#### Frontend

```bash
cd web
pnpm install
pnpm run dev
# Frontend runs on http://localhost:5173
```

#### Database (separate PostgreSQL instance required)

```bash
# Ensure PostgreSQL is running on localhost:5432
# Set DATABASE_URL in api/.env
cd api
pnpm run migrate
```

### 7.4 Key Environment Variables Explained

| Variable           | Description                              | Example                            |
| ------------------ | ---------------------------------------- | ---------------------------------- |
| `DATABASE_URL`     | PostgreSQL connection string             | `postgres://user:pass@db:5432/sfp` |
| `JWT_SECRET`       | Secret key for signing JWTs              | `SuperSecretKey123!`               |
| `FRONTEND_URL`     | Frontend base URL (used for email links) | `http://localhost:5173`            |
| `SENDGRID_API_KEY` | SendGrid API key for email               | `SG.xxxxx`                         |
| `DO_SPACES_*`      | DigitalOcean Spaces credentials          | `nyc3.digitaloceanspaces.com`      |
| `REDIS_URL`        | Redis connection string                  | `redis://redis:6379`               |

### 7.5 Database Migrations

```bash
# Run pending migrations
pnpm run migrate

# See current schema
pnpm run migrate:status

# Rollback last migration
pnpm run migrate:down
```

### 7.6 Running Tests

```bash
cd api
pnpm test

cd ../web
pnpm test
```

### 7.7 Building Docker Images Locally

```bash
# Build API image
docker build -t sfp-api:latest ./api

# Build Web image
docker build -t sfp-web:latest ./web \
  --build-arg VITE_API_BASE_URL="http://localhost:5000"

# Run images
docker run -p 5000:5000 --env-file api/.env sfp-api:latest
docker run -p 3000:3000 sfp-web:latest
```

### 7.8 Useful Docker Compose Commands

```bash
# View logs
docker-compose logs -f api
docker-compose logs -f web

# Stop services
docker-compose down

# Rebuild specific service
docker-compose build api

# Execute command in running container
docker-compose exec api pnpm run migrate
```

---

## 8. Deployment Information

### 8.1 Live Application URL

**Production URL:** `http://129.212.134.118`

### 8.2 Kubernetes Deployment Architecture

#### Cluster Information

- **Provider:** DigitalOcean Kubernetes Service (DOKS)
- **Region:** nyc3 (New York)
- **Cluster Size:** 2 worker nodes (flexible scaling via HPA)
- **Namespace:** `sfp-portal`

#### Deployed Manifests

```
infra/digitalocean/
├── 00-namespace.yaml           # sfp-portal namespace
├── 01-configmap.yaml           # App configuration (URLs, etc.)
├── 02-secret.yaml              # Secrets (API keys, DB creds)
├── 03-redis.yaml               # Redis Deployment & Service
├── 04-api.yaml                 # API Deployment & Service
└── 05-web.yaml                 # Web Deployment, Service, HPA
```

#### Deployment Strategy: **Rolling Updates**

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1 # Allow 1 extra pod during update
    maxUnavailable: 0 # Never reduce capacity below replicas
```

This ensures **zero-downtime deployments:** new pods are created and become Ready before old pods are terminated.

#### Auto-Scaling (HPA)

- **Min Replicas:** 2
- **Max Replicas:** 5
- **Triggers:** CPU > 75% or Memory > 80%

#### Persistent Storage

- **Database:** PostgreSQL on DigitalOcean managed database or Persistent Volume
- **Media:** DigitalOcean Spaces (S3-compatible object storage)

### 8.3 Deploying Updates

#### Trigger a Deployment Update

```bash
# Option 1: Update image in 05-web.yaml and apply
kubectl -n sfp-portal apply -f infra/digitalocean/05-web.yaml

# Option 2: Set image directly (for existing deployment)
TAG=$(git rev-parse --short HEAD)
kubectl -n sfp-portal set image deployment/web web=registry.digitalocean.com/sfp-portal/web:$TAG

# Monitor rollout
kubectl -n sfp-portal rollout status deployment/web
```

#### Verify Deployment Health

```bash
# Check pod status
kubectl -n sfp-portal get pods -l app=web

# View deployment details
kubectl -n sfp-portal describe deployment web

# Check service connectivity
kubectl -n sfp-portal get svc web
```

## 9. Individual Contributions

### Jiayan Xu (1012882436) — Platform & DevOps Owner

#### Infrastructure & Deployment

- **Kubernetes Setup:** Designed and implemented DOKS cluster with 2 worker nodes, configured namespaces, RBAC, and network policies.
- **Manifest Development:** Created 8 Kubernetes manifests (00-08) covering deployments, services, ingress, cert-manager, and HPA configurations.
- **Docker Compose:** Built local multi-container stack for development with proper volume mounts, environment variable management, and service networking.
- **DigitalOcean Integration:** Configured Spaces for object storage, managed volumes for PostgreSQL persistence, set up load balancers and reserved IPs.

#### Monitoring & Configuration

- **Health Checks:** Configured readiness and liveness probes for all services; implemented `/health` endpoint.
- **Monitoring:** Set up DigitalOcean native monitoring with CPU, memory, and error rate alerts; configured log aggregation.
- **Secrets Management:** Implemented Kubernetes Secrets for API keys, database credentials; used ConfigMaps for non-sensitive configuration.

#### Zero-Downtime Deployment Demo

- **Rolling Update Configuration:** Tuned `maxSurge: 1` and `maxUnavailable: 0` to enable safe, observable pod replacement without downtime.
- **Load Testing:** Created HTTP probe scripts to measure and verify zero-downtime during deployments.
- **Documentation:** Provided step-by-step commands for demonstrating rolling updates in presentation.

**Key Git Commits:**

- Initial K8s manifests setup
- Rolling update configuration tuning
- Docker Compose local dev environment fixes

---

### Yiming Liu (1011337402) — Frontend & UI Owner

#### React Application Development

- **Component Architecture:** Built reusable components (AnimalCard, ApplicationCard, Interview Scheduler, etc.) with TypeScript.
- **Page Implementation:** Created 12+ pages covering all user workflows (Dashboard, AnimalManagement, ApplicationManagement, AnimalDetail, etc.).
- **State Management:** React Context API for authentication state, theme management, and global data.

#### User Interface Design

- **Responsive Design:** Tailwind CSS for mobile-first, responsive layouts across all devices.
- **Design System:** Consistent spacing, typography, color palette; dark/light theme support.
- **User Experience:** Intuitive navigation, clear error messages, loading states, confirmation dialogs.

#### Feature Implementation

- **Public Pages:** `/adoptables` searchable animal grid, `/animal/:id` detail page with photo carousel.
- **Authentication:** Login/signup pages with form validation and persistent session management.
- **Animal Management Dashboard:** Table view with status filters, search, edit, delete, and publish actions.
- **Application Workflow:** Applicant view showing submitted applications with status tracking.
- **Interview Scheduler:** UI for proposing interview times and recording outcomes.
- **Delete Functionality:** Implemented delete button with confirmation dialog, success/error toasts.

#### Media & File Handling

- **Photo Upload:** Integrated with DigitalOcean Spaces presigned URL system for secure uploads.
- **Image Display:** Lazy loading, responsive image sizing, fallback handling.
- **File Management:** Multi-file upload UI with progress indication.

#### Performance & Optimization

- **Vite Build Tool:** Fast development server and optimized production builds.
- **Code Splitting:** Lazy-loaded routes to reduce initial bundle size.
- **Caching:** HTTP caching headers for static assets; client-side caching for API responses.

#### API Integration

- **Fetch Library:** Wrapper for HTTP requests with auth headers, error handling, credential inclusion.
- **Error Handling:** User-friendly error messages from API responses; retry logic for failed requests.
- **Loading States:** Skeleton screens and spinners during async operations.

**Key Git Commits:**

- Initial React project setup with Vite
- Page scaffolding for all major features
- Animal management dashboard implementation
- Application workflow UI
- Interview scheduler component
- Delete functionality UI integration
- Responsive design improvements
- Dark theme support

---

### Jinhua Yan (1012858686) — Backend & Auth Owner

#### Core API Development

- **REST API Design:** Implemented 50+ endpoints across routes: animals, volunteers, applications, interviews, contracts.
- **Authentication:** JWT-based login/signup with 24-hour token expiry; secure password hashing using bcrypt.
- **Authorization:** Role-based middleware enforcing RBAC for Foster, Interviewer, Interviewer, Applicant roles.

#### Database & Models

- **Schema Design:** Designed relational data model with 9 tables: Animal, Volunteer, Application, Interview, Contract, EmailLog, AuditLog, AnimalPhoto, etc.
- **ORM Integration:** Used Sequelize ORM for migrations, associations, and query building.
- **Migrations:** Created automated database schema updates; rollback-safe migration framework.

#### Feature Implementation

- **Animal Management:** Full CRUD for animals with state machine (Draft → Published → Adopted).
- **Applications:** Application submission, filtering, status tracking with comment system.
- **Interview Scheduling:** Time slot management, email notifications, interview outcome recording with status updates (interviewers mark as "review" after assessment; admins approve for contract generation).
- **Contract Workflow:** PDF generation with pre-filled data, e-signature webhook integration.

#### Email & Notifications

- **SendGrid Integration:** Transactional emails for confirmations, status updates, interview invitations.
- **Email Templates:** Created dynamic email templates using SendGrid's template engine.
- **Webhook Handlers:** Implemented contract signature webhooks to update application state.

#### Error Handling & Validation

- **Express Validator:** Request validation for all endpoints using express-validator.
- **Custom Error Middleware:** Global error handler with appropriate HTTP status codes and error messages.
- **Input Sanitization:** Protected against SQL injection, XSS, and invalid data types.

**Key Git Commits:**

- User authentication and JWT implementation
- Database schema and migrations
- CRUD endpoints for all entities
- SendGrid email integration
- Error handling middleware

---

## 10. Lessons Learned & Concluding Remarks

### 10.1 Technical Lessons

**1. Kubernetes requires deliberate configuration.**  
Rolling updates, readiness/liveness probes, and HPA tuning are essential for zero-downtime deployment. Misconfiguration can easily cause outages.

**2. Environment variable management is critical for portability.**  
Separating build-time variables (e.g., `VITE_API_BASE_URL`) from runtime configuration (e.g., `FRONTEND_URL`) prevented deployment failures and ensured consistent environments across local, staging, and production.

**3. Docker volume mounts must be scoped carefully.**  
An overly broad bind mount initially overwrote `node_modules`, causing missing-module errors. Restricting mounts and understanding Docker layer behavior resolved the issue.

**4. Presigned URLs greatly simplify secure media handling.**  
Direct browser→Spaces uploads reduced API load, bandwidth usage, and architectural complexity.

**5. State machines improve workflow reliability.**  
Modeling the animal lifecycle (Draft → Published → Adopted) enforced valid transitions and clarified business logic.

---

### 10.2 Project Management Lessons

**1. Clear role ownership reduces integration problems.**  
Assigning DevOps, Backend, and Frontend responsibilities enabled efficient parallel development and minimized merge conflicts.

**2. Early documentation prevents rework.**  
Maintaining API specs, environment variable tables, and deployment guides improved onboarding and reduced debugging time.

**3. Iterative development is superior to big-bang delivery.**  
Delivering features in sequence (animals → applications → interviews → contracts) allowed early feedback and smoother integration.

---

### 10.3 Real-World Insights

**1. Nonprofits often struggle with fragmented workflows.**  
Building for a real rescue organization revealed how much manual effort can be reduced through centralized digital systems.

**2. Security and privacy must be intentional from the start.**  
Working with PII required strict RBAC, audit logging, and careful API exposure; security cannot be bolted on later.

**3. Cloud-native architecture requires a mindset shift.**  
Designing with containers, orchestration, and declarative infrastructure improved reliability, deployment consistency, and scalability.

---

### 10.4 Future Enhancements

- Automated e-signature integration (DocuSign, SignNow)
- Native mobile app for fosters and adopters
- Advanced search (Elasticsearch)
- Multi-language support (e.g., Spanish, Mandarin)
- Online adoption fee payments (Stripe)

---

### 10.5 Concluding Remarks

The **SFP Animal Management System** demonstrates practical cloud-native engineering: containerization, orchestration, persistent state management, secure workflows, and automated communication. Beyond meeting course requirements, it meaningfully improves the operational workflow of a real nonprofit organization. This project provided hands-on experience with designing scalable cloud systems and showed how thoughtful engineering can streamline real-world adoption processes.

### Final Thoughts

This project transcends a typical course assignment. It delivers a production-ready system for a real organization while demonstrating mastery of cloud computing, infrastructure, and full-stack development. We hope this system continues to benefit SFP and inspires other student teams to build technology for causes they believe in.

**Team 22 — December 3, 2025**
