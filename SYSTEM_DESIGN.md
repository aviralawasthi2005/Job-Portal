# System Design & Architecture Specification
## Healthcare Job Portal & Automation Platform

**Version:** 2.0.0  
**Status:** Approved & Implemented  
**Architecture:** Event-Driven Polyglot Monorepo (TypeScript, AdonisJS v6, SvelteJS, React, Express, n8n Automation Engine)

---

## 1. Executive Summary & Vision

The **Healthcare Job Portal** is an enterprise-grade recruitment and job aggregation platform tailored for the modern healthcare sector. It bridges the gap between healthcare institutions (hospitals, telehealth clinics, research labs, health-tech startups) and qualified medical and digital health professionals (nurses, physicians, medical informatics engineers, clinical researchers, pharmacists).

### Key Architectural Pillars
- **Dual-Engine Frontend Options:**
  - **SvelteJS Client (`frontend-svelte`):** Ultra-lightweight, zero-virtual-DOM, reactive client delivering sub-second initial loads, micro-animations, and fluid filtering.
  - **React Client (`frontend`):** Component-rich React 18 single-page application powered by TanStack Query and Lucide icons.
- **Dual Backend Architectures:**
  - **AdonisJS v6 Service (`backend-adonis`):** Full-featured TypeScript enterprise backend with IOC container, request validators, Lucid ORM data models, and event dispatchers.
  - **Express Service (`backend`):** High-throughput microservice proxy handling fast JSON responses and Himalayas API aggregation.
- **Python Healthcare Intelligence & Resume Engine (`python-service`):**
  - **Strict Healthcare Filtering:** Eliminates non-healthcare roles (software engineers, accountants, sales) and perk false positives.
  - **Clinical Licensure & Credential Extraction:** Recognizes MD, DO, RN, BSN, MSN, NP, PMHNP, LPN, PharmD, PA-C, LCSW, LMFT, CPC, RHIA.
  - **Resume Qualification Scorer:** Analyzes applicant clinical licenses and years of experience.
- **Workflow Automation with n8n (`n8n`):**
  - Webhook-driven candidate intake, resume processing, scheduled job syncs, and multi-channel candidate alert digests (Slack, Discord, Email).
- **Resilience & Caching:**
  - Cache-aside strategy with in-memory / Redis caching to minimize external API limits and ensure 99.9% uptime even during upstream degradation.

---

## 2. High-Level System Architecture

```mermaid
flowchart TB
    subgraph Clients["Presentation Layer"]
        SvelteClient["SvelteJS Client (TypeScript + Vite)\nPort: 5174"]
        ReactClient["React Client (Vite + React 18)\nPort: 5173"]
    end

    subgraph GatewayLoadBalancer["API Routing & Security Layer"]
        ReverseProxy["Nginx / Cloudflare / Docker Network"]
    end

    subgraph BackendServices["Application Services Layer"]
        AdonisBackend["AdonisJS v6 Core Backend (TypeScript)\n- RESTful API\n- Lucid ORM\n- Event Dispatcher\nPort: 3333"]
        ExpressBackend["Express.js Proxy Engine\n- Himalayas Ingestion\n- Fast JSON Streaming\nPort: 5000"]
        PythonService["Python Healthcare Intelligence (FastAPI)\n- Strict Healthcare Classifier\n- Credential Extractor\n- Resume ATS Analyzer\nPort: 8000"]
    end

    subgraph AutomationEngine["Workflow Automation Layer (n8n)"]
        N8nInstance["n8n Automation Engine\n- Daily Job Digest\n- Candidate Ingestion Workflow\n- Multi-Channel Alerts (Slack/Discord)\nPort: 5678"]
        N8nWebhooks["n8n Webhook Listeners\n/webhook/job-created\n/webhook/candidate-apply"]
    end

    subgraph DataCacheLayer["Persistence & Caching Layer"]
        PostgresDB[("PostgreSQL 16\nJobs, Applications, Recruiters")]
        RedisCache[("Redis 7.0\nAPI Cache & Job Queue")]
        LocalStore[("Local Fallback Storage\nmanualJobs.json")]
    end

    subgraph ExternalServices["External Providers"]
        HimalayasAPI["Himalayas Remote Jobs API\n(Healthcare Endpoint)"]
        NotificationChannels["Discord / Slack / Email (SMTP/SendGrid)"]
    end

    %% Client Traffic
    SvelteClient --> ReverseProxy
    ReactClient --> ReverseProxy
    ReverseProxy --> AdonisBackend
    ReverseProxy --> ExpressBackend

    %% Backend Dependencies
    AdonisBackend --> PostgresDB
    AdonisBackend --> RedisCache
    AdonisBackend --> LocalStore
    AdonisBackend -.->|Webhook Events| N8nWebhooks

    ExpressBackend --> HimalayasAPI
    ExpressBackend --> LocalStore
    ExpressBackend --> RedisCache

    PythonService --> HimalayasAPI
    PythonService -.-> LocalStore

    %% Automation Flow
    N8nWebhooks --> N8nInstance
    N8nInstance --> PythonService
    N8nInstance --> NotificationChannels
    N8nInstance -.->|Fetch Recent Jobs| AdonisBackend
```

---

## 3. Component Deep Dive

### 3.1 SvelteJS Client (`frontend-svelte`)
- **Technology:** Svelte 5 / SvelteKit / Vite, TypeScript, Tailwind CSS, Lucide Svelte.
- **Responsibilities:**
  - Client-side reactive filtering (specialty, salary bracket, workplace mode: Remote / On-site / Hybrid).
  - Instant job search with debounce.
  - Interactive job detail drawer and slide-out modal.
  - Direct candidate application with resume link validation and instant feedback.
  - Recruiter job posting submission dialog with client-side schema validation.

### 3.2 AdonisJS v6 Backend (`backend-adonis`)
- **Technology:** AdonisJS v6, TypeScript, VineJS schema validator, Lucid ORM, Node.js v20+.
- **Key Modules:**
  - `JobsController`: Implements query parsing, category normalization, multi-source union (Himalayas remote + internal manual posts), pagination, and caching.
  - `ApplicationsController`: Handles applicant intake, validates clinical licenses/experience, stores application records, and emits `application.submitted` event.
  - `N8nWebhooksController`: Two-way integration endpoint for receiving automated updates and trigger dispatches from n8n workflows.
  - `N8nDispatcherService`: HTTP client sending signed webhook payloads to the n8n automation engine.

### 3.3 n8n Workflow Automation Suite (`n8n/`)
- **Technology:** n8n Workflow Automation (Dockerized), Webhook Triggers, Cron Schedules, HTTP Nodes.
- **Implemented Workflows:**
  1. **New Job Multi-Channel Dispatch (`new-job-alert-digest.json`):**
     - When a recruiter posts a new healthcare position or a high-priority opening is scraped, n8n formats an interactive rich card and posts to Discord, Slack, and candidate newsletter lists.
  2. **Job Application & ATS Processor (`job-application-processor.json`):**
     - Captures applicant data from AdonisJS webhook, parses resume link, checks qualification keywords (e.g. RN, MD, PharmD), stores candidate in applicant tracking system (Airtable / Google Sheets / Postgres), and sends an automated confirmation email to the candidate.
  3. **Himalayas Sync Scheduler (`himalayas-sync-scheduler.json`):**
     - Runs on a cron schedule (e.g. every 6 hours), queries Himalayas healthcare job endpoints, deduplicates entries against existing database records, and flushes Redis cache.

---

## 4. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    COMPANIES ||--o{ JOBS : "posts"
    CATEGORIES ||--o{ JOBS : "classifies"
    JOBS ||--o{ APPLICATIONS : "receives"
    JOBS ||--o{ AUTOMATION_LOGS : "triggers"
    APPLICATIONS ||--o{ AUTOMATION_LOGS : "triggers"

    COMPANIES {
        uuid id PK
        string name
        string website
        string logo_url
        string location
        boolean verified
        timestamp created_at
    }

    CATEGORIES {
        uuid id PK
        string name
        string slug
        string description
    }

    JOBS {
        uuid id PK
        string guid UK
        uuid company_id FK
        uuid category_id FK
        string title
        string workplace_type "Remote | Hybrid | On-site"
        string employment_type "Full-time | Part-time | Contract | Locum"
        string location
        integer salary_min
        integer salary_max
        string salary_currency
        text description
        jsonb requirements
        jsonb benefits
        jsonb skills
        string application_url
        string source "himalayas | manual | n8n_sync"
        boolean is_featured
        boolean is_urgent
        timestamp published_at
        timestamp created_at
    }

    APPLICATIONS {
        uuid id PK
        uuid job_id FK
        string candidate_name
        string candidate_email
        string candidate_phone
        text cover_letter
        string resume_url
        string clinical_license_number
        integer years_of_experience
        string status "pending | reviewed | interviewing | rejected | accepted"
        timestamp submitted_at
    }

    AUTOMATION_LOGS {
        uuid id PK
        string event_type "job.created | application.submitted | sync.completed"
        jsonb payload
        string n8n_execution_id
        string status "dispatched | completed | failed"
        timestamp executed_at
    }
```

---

## 5. Sequence Diagrams

### 5.1 Candidate Search & Cached Query Flow

```mermaid
sequenceDiagram
    autonumber
    actor Candidate as Healthcare Job Seeker
    participant Svelte as SvelteJS Client
    participant Adonis as AdonisJS API
    participant Redis as Redis Cache
    participant Himalayas as Himalayas API
    participant DB as Postgres / Local Store

    Candidate->>Svelte: Search "Telehealth Nursing" ($90k+, Remote)
    Svelte->>Adonis: GET /api/v1/jobs?search=Telehealth&category=Nursing&minSalary=90000
    Adonis->>Redis: Check Cache (key: jobs:Telehealth:Nursing:90000)
    alt Cache Hit
        Redis-->>Adonis: Return cached JSON payload
    else Cache Miss
        Adonis->>DB: Query manual & synced jobs
        Adonis->>Himalayas: Fetch upstream remote jobs
        Himalayas-->>Adonis: Upstream items
        DB-->>Adonis: Local curated jobs
        Adonis->>Adonis: Merge, normalize, deduplicate & sort
        Adonis->>Redis: Store in Redis (TTL: 15 mins)
    end
    Adonis-->>Svelte: 200 OK (Paginated Job Response)
    Svelte-->>Candidate: Render job cards with salary badges & tags
```

### 5.2 Recruiter Job Posting & n8n Automation Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor Recruiter
    participant Svelte as Svelte Client
    participant Adonis as AdonisJS API
    participant DB as PostgreSQL
    participant N8n as n8n Automation Engine
    participant Slack as Healthcare Slack/Discord Channel
    participant Email as Candidate Notification Queue

    Recruiter->>Svelte: Fill "Post Healthcare Job" Form
    Svelte->>Adonis: POST /api/v1/jobs (Job Payload)
    Adonis->>Adonis: Validate with VineJS Schema
    Adonis->>DB: INSERT into jobs table
    DB-->>Adonis: Job persisted (guid generated)
    Adonis->>N8n: POST /webhook/job-created (Signed Webhook Payload)
    Adonis-->>Svelte: 201 Created (Job details & live URL)
    Svelte-->>Recruiter: Display success notification
    
    par Async n8n Workflow
        N8n->>Slack: Post rich embed card to #healthcare-job-feed
        N8n->>Email: Query candidate subscribers & send alert digest
    end
```

### 5.3 Candidate Application & Automated Resume Intake

```mermaid
sequenceDiagram
    autonumber
    actor Applicant as Candidate
    participant Svelte as Svelte Client
    participant Adonis as AdonisJS API
    participant DB as PostgreSQL
    participant N8n as n8n Automation Engine
    participant ATS as Airtable / ATS CRM
    participant Mailer as SMTP Notification Service

    Applicant->>Svelte: Submit Application (CV URL, License #, Cover Letter)
    Svelte->>Adonis: POST /api/v1/applications
    Adonis->>Adonis: Validate required fields & email format
    Adonis->>DB: Save application record (status: pending)
    Adonis->>N8n: Trigger Webhook /webhook/candidate-apply
    Adonis-->>Svelte: 201 Created ("Application submitted successfully")
    
    par Async ATS Logging & Email
        N8n->>ATS: Create Candidate Record & Attach Resume Link
        N8n->>Mailer: Send Confirmation Email to Applicant
        N8n->>Mailer: Send Alert to Hospital Hiring Team
    end
```

---

## 6. Security, Resilience & Quality Attributes

| Attribute | Implementation Strategy |
| :--- | :--- |
| **Type Safety** | End-to-end TypeScript interfaces shared via `@shared/types/job.ts`. |
| **Input Validation** | VineJS / Zod schema validation on all POST/PUT routes to prevent injection or malformed data. |
| **CORS Policy** | Strict origin whitelisting allowing only configured frontend origins in production. |
| **Rate Limiting** | Express-rate-limit & Adonis rate limiter (100 req/min per IP for reads; 10 req/min for posts). |
| **Fault Tolerance** | If Himalayas API is down or rate-limited, the system falls back seamlessly to cached/local storage. |
| **Idempotency** | Webhook deliveries use unique event UUIDs to prevent duplicate notifications in n8n. |

---

## 7. Deployment & Infrastructure Architecture

```mermaid
flowchart LR
    subgraph Host["Production Node / Docker Host"]
        DockerCompose["Docker Compose"]
        
        subgraph Containers["Containers"]
            C_Svelte["svelte-client\nNode:20-alpine (Nginx/Node)"]
            C_Adonis["adonis-backend\nNode:20-alpine"]
            C_Express["express-backend\nNode:20-alpine"]
            C_N8N["n8n\nn8nio/n8n:latest"]
            C_Postgres["postgres\npostgres:16-alpine"]
            C_Redis["redis\nredis:7-alpine"]
        end
    end

    DockerCompose --> Containers
    C_Adonis --> C_Postgres
    C_Adonis --> C_Redis
    C_Adonis --> C_N8N
```

---

## 8. Summary of Deliverables in this Workspace

1. **System Design (`SYSTEM_DESIGN.md`):** This comprehensive architecture blueprint.
2. **License (`LICENSE`):** Open-source MIT License.
3. **TypeScript Definitions (`shared/types/`):** Unified schemas for jobs, filters, applications, and n8n webhooks.
4. **AdonisJS Backend (`backend-adonis/`):** TypeScript MVC architecture with controllers, validators, models, and n8n webhook dispatcher.
5. **SvelteJS Frontend (`frontend-svelte/`):** High-performance reactive Svelte client with rich medical theme, filters, modals, and job application flow.
6. **n8n Automation Suite (`n8n/`):** Pre-built workflow templates for daily digests, application parsing, and sync schedules.
7. **Monorepo Orchestration (`docker-compose.yml`, `package.json`, `.env.example`):** Multi-service dev and production runners.
