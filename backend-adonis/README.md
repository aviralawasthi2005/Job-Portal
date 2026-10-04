# AdonisJS v6 TypeScript Healthcare Backend

This service powers the core API for the Healthcare Job Portal, built with **AdonisJS v6 architecture**, **TypeScript**, and integrated with **n8n automation webhooks** and the **Himalayas remote jobs API**.

## 🌟 Key Features
- **TypeScript First:** Comprehensive typings shared across the monorepo via `@shared/types/job.ts`.
- **Himalayas Aggregator:** Fetches and normalizes clinical, telehealth, nursing, and medical tech jobs with in-memory TTL caching.
- **Event-Driven n8n Triggers:** Automatically dispatches `job.created` and `application.submitted` webhooks to n8n workflows for email notifications and Discord/Slack broadcasts.
- **Robust Validation:** Dedicated validators (`JobValidator`, `ApplicationValidator`) ensuring pristine data integrity.

## 🚀 Running Locally

```bash
# From workspace root:
npm run dev:adonis

# Or inside backend-adonis:
cd backend-adonis
npm install
npm run dev
```

The server will start on [http://localhost:3333](http://localhost:3333).

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Service health status |
| `GET` | `/api/v1/jobs` | Search & filter jobs (`?search=`, `?category=`, `?minSalary=`, etc.) |
| `GET` | `/api/v1/jobs/:guid` | Fetch single job detail |
| `POST` | `/api/v1/jobs` | Recruiter post job (triggers n8n broadcast) |
| `POST` | `/api/v1/applications` | Candidate apply (triggers n8n intake) |
| `POST` | `/api/v1/n8n/webhook-receive` | Inbound n8n automation callback |
| `GET` | `/api/v1/metrics` | High-level metrics for dashboard |
