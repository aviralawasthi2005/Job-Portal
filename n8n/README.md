# n8n Workflow Automation Engine for Healthcare Job Portal

This directory houses the workflow automation specifications, triggers, and templates for the Healthcare Job Portal.

## 🚀 Workflows Overview

| Workflow | Trigger Type | File | Description |
| :--- | :--- | :--- | :--- |
| **New Job Multi-Channel Dispatch** | Webhook (`POST /webhook/healthcare-new-job`) | [`workflows/new-job-webhook-dispatch.json`](file:///c:/Users/HP/Job-Portal/n8n/workflows/new-job-webhook-dispatch.json) | Broadcasts newly published jobs to Discord/Slack channels and email subscriber lists. |
| **Candidate Application & ATS** | Webhook (`POST /webhook/candidate-application`) | [`workflows/application-resume-parser.json`](file:///c:/Users/HP/Job-Portal/n8n/workflows/application-resume-parser.json) | Ingests candidate applications, extracts clinical credentials, notifies recruiters, and dispatches confirmation receipts. |
| **Daily Job Alert Digest** | Cron Schedule (`0 8 * * *`) | [`workflows/job-alert-digest.json`](file:///c:/Users/HP/Job-Portal/n8n/workflows/job-alert-digest.json) | Fetches the latest 5 healthcare opportunities from the API at 8:00 AM daily and compiles an executive digest. |

---

## 🛠️ Quick Start with Docker

To spin up the n8n automation engine locally:

```bash
# Start n8n in detached mode
docker compose up -d n8n
```

- Open the n8n Web Console at: [http://localhost:5678](http://localhost:5678)
- Complete the initial setup (create admin owner account).

---

## 📥 Importing Workflows

1. In the n8n UI, navigate to **Workflows**.
2. Click the top-right **"..."** (More options) menu -> **"Import from File"**.
3. Select any of the files in `n8n/workflows/`.
4. Click **"Save"** and toggle the workflow to **"Active"**.

---

## 🔗 Testing Webhooks Locally

You can test the webhook endpoints directly using `curl` or Postman:

### 1. Test New Job Webhook
```bash
curl -X POST http://localhost:5678/webhook/healthcare-new-job \
  -H "Content-Type: application/json" \
  -d '{
    "event": "job.created",
    "timestamp": "2026-10-04T10:00:00Z",
    "job": {
      "guid": "test-guid-123",
      "title": "Telehealth Psychiatric Nurse Practitioner (PMHNP)",
      "companyName": "CareHealth Telemedicine",
      "category": "Nursing",
      "workplaceType": "Remote",
      "salaryString": "$135,000 - $160,000 / year",
      "applicationUrl": "http://localhost:5174"
    }
  }'
```

### 2. Test Candidate Application Webhook
```bash
curl -X POST http://localhost:5678/webhook/candidate-application \
  -H "Content-Type: application/json" \
  -d '{
    "event": "application.submitted",
    "jobTitle": "Telehealth Psychiatric Nurse Practitioner",
    "companyName": "CareHealth Telemedicine",
    "application": {
      "candidateName": "Sarah Jenkins, RN",
      "candidateEmail": "sarah.jenkins@example.com",
      "clinicalLicenseNumber": "RN-CA-994821",
      "resumeUrl": "https://linkedin.com/in/sarahjenkins"
    }
  }'
```
