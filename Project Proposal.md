# 🐾 SFP Animal Management System — Project Proposal

## 1. Motivation

### Problem
Save Fur Pets (SFP) is a volunteer-run animal rescue organization that coordinates fosters, coordinators, interviewers, and adopters. Currently, SFP relies on **scattered tools** — spreadsheets, email threads, and forms — to manage adoptions.  
This fragmented process creates several operational challenges:

- **Slow turnaround:** It can take weeks for foster animals to be published online.  
- **Inconsistent workflows:** Application handling and communication differ across coordinators.  
- **Manual scheduling:** Interview coordination often involves multiple back-and-forth emails.  
- **Privacy risks:** Sensitive adopter data (PII) is shared through unstructured channels.

### Why This Project
A **stateful, cloud-native web application** can centralize this adoption workflow end-to-end:

> Foster draft → Coordinator review → Publish adoptables → Applicant applies → Interview → Decision → E-contract → Adopted.

By consolidating these steps into one system, we aim to:
- Reduce volunteer workload  
- Increase consistency and transparency  
- Shorten time-to-adoption  
- Enhance data security and privacy compliance

### Target Users
- **Fosters:** Upload and update animal profiles with photos/videos.  
- **Coordinators:** Review listings, publish animals, manage applications, assign interviewers, and finalize decisions.  
- **Interviewers:** Review assigned applications, schedule interviews, record outcomes.  
- **Applicants/Adopters:** Submit applications, receive status updates, and sign contracts electronically.  

### Existing Solutions and Limitations
Generic CRM or shelter management tools exist, but they are often:
- Overly complex for small volunteer groups  
- Costly or not customizable  
- Lacking integrations like **ICS scheduling**, **serverless email triggers**, or **role-based access** for volunteers  
Therefore, SFP requires a lightweight, purpose-built solution.

---

## 2. Objective and Key Features

### Objective
Deliver a **secure, reliable, and maintainable** adoption management system that automates and tracks every stage of the adoption pipeline while ensuring data confidentiality.

---

### Core Features (User Flow)

#### 🐕 Animal Pipeline  
- States: `Draft → Review → Published → Interviewing → Reserved → Adopted → Archived`  
- Immutable **AuditLog** for every state change.

#### 🌐 Public Website  
- `/adoptables`: searchable list of available animals  
- `/animal/:id`: animal details, photos, and “Apply” button  
- Public endpoints never expose personal information.

#### 📝 Application Workflow  
- Per-animal application forms tied to applicant accounts  
- Confirmation email and live status tracking  
- Coordinators can triage, comment, and assign interviewers.

#### 📅 Interview Scheduling  
- Interviewers propose time slots  
- System sends **calendar invites (ICS)** to both applicant and interviewer  
- Outcomes recorded and linked to applications.

#### 📜 Decision & Contract  
- Coordinators mark a final adopter; automatic polite rejections to others  
- System generates adoption agreement PDF, pre-filled with adopter and animal info  
- Contract sent for **e-signature**, tracked via webhook  
- On signature, animal marked “Adopted” and welcome email sent.

#### 🔒 Confidentiality by Design  
- Personally identifiable information (PII) stored in encrypted columns  
- Media served through **short-lived presigned URLs**  
- Strict **Role-Based Access Control (RBAC)**  
- Redacted logs to prevent data leakage.

---

### Technology Stack

#### **Containerization and Local Development**
- Multi-container setup with **Docker Compose**
- Services:  
  - API (Node.js/Express or FastAPI)  
  - Web Frontend (React)  
  - PostgreSQL (persistent state)  
  - Redis (job queue and caching)  
  - NGINX (reverse proxy and HTTPS termination)

#### **State Management**
- **PostgreSQL** as the single source of truth for all relational data  
- Persistent storage via **DigitalOcean Volumes**, ensuring data survives restarts and redeployments  
- Data entities: Animals, Applications, Interviews, Contracts, Users, EmailLogs, and AuditLogs.

#### **Deployment Provider**
- **DigitalOcean** chosen for its developer-friendly infrastructure (Droplets, Volumes, Spaces, and Kubernetes integration).  


#### **Orchestration Approach**
We will use **Kubernetes (K8s)** for orchestration, starting locally with Minikube and deploying to **DigitalOcean Kubernetes Service (DOKS)**.

**Key K8s Components:**
- **Deployments** for API, Web, Redis  
- **Service** objects for internal communication  
- **Ingress** for external HTTPS access  
- **PersistentVolume (PV)** bound to DO Volume  
- **Horizontal Pod Autoscaler (HPA)** for auto-scaling under load  
- **Secrets/ConfigMaps** for environment management  
- **Readiness/Liveness probes** for health checks  

This setup enables **fault tolerance**, **scalability**, and **easy rolling updates**.

---

### **Monitoring and Observability**
- **DigitalOcean Metrics and Alerts** for CPU, memory, disk, and restarts  
- Application endpoints:
  - `/health` — readiness and liveness check  
  - `/metrics` — Prometheus-compatible metrics  
- Structured JSON logs aggregated by DO’s logging tools   
- Alert thresholds:  
  - CPU > 70% for 5 minutes  
  - Disk usage > 80%  
  - Error rate > 2%  

---

### **Advanced Features**
We plan to implement **three advanced features**:

1. **Serverless Integration**  
   - Using **DigitalOcean Functions** for event-driven tasks:  
     - Sending confirmation emails and calendar invites (ICS)  
     - Nightly cleanup of stale drafts  
     - Contract reminder notifications  

2. **Security Enhancements**  
   - JWT-based authentication  
   - Fine-grained RBAC (Foster / Coordinator / Interviewer / Applicant)  
   - HTTPS enforced via NGINX ingress  
   - Presigned URLs for media access  
   - Secrets management via K8s Secrets  
   - Redacted logs for privacy protection  

3. **CI/CD Pipeline**  
   - **GitHub Actions**:  
     - Build and test containers  
     - Push to GitHub Container Registry  
     - Apply Kubernetes manifests via `kubectl`  
     - Automated smoke tests post-deployment    

---

### **Database Schema (Concise Overview)**

| Table | Description |
|--------|--------------|
| `User` | `id`, `role`, `name`, `email`, `phone`, `created_at` |
| `Animal` | `id`, `name`, `species`, `sex`, `dob`, `color`, `weight`, `description_md`, `state`, `created_by` |
| `Media` | `id`, `animal_id`, `url`, `kind`, `caption`, `created_by`, `created_at` |
| `Application` | `id`, `animal_id`, `applicant_id`, `status`, `answers_json`, `created_at` |
| `Interview` | `id`, `application_id`, `interviewer_id`, `start_ts`, `end_ts`, `notes_md`, `outcome` |
| `Decision` | `id`, `animal_id`, `application_id`, `decided_by`, `reason_md`, `at` |
| `Contract` | `id`, `animal_id`, `adopter_id`, `status`, `pdf_url`, `signed_at` |
| `EmailLog` | `id`, `to`, `subject`, `template`, `payload_json`, `status`, `sent_at` |
| `AuditLog` | `id`, `actor_id`, `action`, `entity`, `entity_id`, `before_json`, `after_json`, `at` |

Sensitive fields (email, phone) will be encrypted at rest or isolated in a separate table.

---

### **Scope and Feasibility**
The workflow is narrow and well-defined, allowing the project to be completed within the short timeline.  
Each feature is independently demonstrable and incrementally buildable:

1. Foundation: Dockerized API and DB  
2. Publish Flow and Public Site  
3. Applications and Interviews  
4. Contracts and Adoption Pipeline  
5. Kubernetes Deployment + Monitoring  
6. Advanced and Security Features  
7. Final Demo and Documentation  

Given the modular nature of the stack, we can parallelize development efficiently across backend, frontend, and infrastructure tracks.

---

## 3. Tentative Plan

### Team Members and Responsibilities

| Role | Student Number | Role | Responsibilities |
|------|------------------|------|---------------------|
| **Yiming Liu** |1011337402| Backend & Auth Owner | <ul><li>Design REST API (OpenAPI spec)</li><li>Implement database schema and migrations</li><li>JWT authentication and RBAC</li><li>Endpoints for Applications, Interviews, and Decisions</li><li>Serverless email functions and notifications</li></ul> |
| **Jinhua Yan** |1012858686| Frontend & User Interface Owner | <ul><li>Admin UI for fosters, coordinators, and interviewers</li><li>Public pages (`/adoptables`, `/animal/:id`, Apply form)</li><li>Media upload via presigned URLs</li><li>ICS integration for calendar scheduling</li></ul> |
| **Jiayan Xu** |1012882436| Platform & DevOps Owner | <ul><li>Docker Compose and Kubernetes manifests (DOKS)</li><li>PostgreSQL persistent volume setup</li><li>Monitoring and DigitalOcean metrics/alerts</li><li>TLS/Ingress configuration</li><li>Automated backups and CI/CD pipeline</li></ul> |

---

### Development Approach
1. **Start locally with Docker Compose** for fast iteration and testing.  
2. **Gradually migrate to Kubernetes (DOKS)** once all core components are stable.  
3. Use **feature branches and PR reviews** for modular collaboration.  
4. Deploy production builds automatically through CI/CD.  
5. Conduct a **final end-to-end demo** showing all user roles and system monitoring.

---

### Feasibility Summary
The SFP Animal Management System is realistic within the project timeline:
- The adoption workflow is compact and testable.  
- Team roles cover all major technical areas.  
- Each milestone yields a functional slice of the system.  
- The project meets or exceeds all course technical requirements.

---
