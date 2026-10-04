# 🤖 Enterprise n8n Automation Engine — Healthcare Job Portal

Production-grade workflow automation for candidate screening, clinical credential parsing, multi-channel job dispatch, scheduled digests, and system-wide self-healing alerts.

---

## ⚡ Hardened Workflow Architecture

| Workflow | Trigger Type | Spec File | Reliability & Hardening Features |
| :--- | :--- | :--- | :--- |
| **New Job Dispatcher** | `POST /webhook/healthcare-new-job` | [`workflows/new-job-webhook-dispatch.json`](file:///c:/Users/HP/Job-Portal/n8n/workflows/new-job-webhook-dispatch.json) | Payload sanitization, 3x HTTP retries, `continueOnFail`, 200/400 validation responses, Discord + Email broadcast. |
| **Candidate Application & ATS** | `POST /webhook/candidate-application` | [`workflows/application-resume-parser.json`](file:///c:/Users/HP/Job-Portal/n8n/workflows/application-resume-parser.json) | Heuristic fallback when Python service is offline, candidate receipt confirmation, Discord alert, 200 OK status. |
| **Daily Job Alert Digest** | Cron (`0 8 * * *`) | [`workflows/job-alert-digest.json`](file:///c:/Users/HP/Job-Portal/n8n/workflows/job-alert-digest.json) | Dynamic backend URL fallback, zero-jobs guard, 3x HTTP retry on API pull, Discord broadcast. |
| **Python Strict Sync** | Cron (`0 */6 * * *`) | [`workflows/python-himalayas-sync.json`](file:///c:/Users/HP/Job-Portal/n8n/workflows/python-himalayas-sync.json) | Scrapes & filters healthcare positions, 3x retry on sync & cache flush webhook. |
| **Global Error Alert Handler** | `n8n-nodes-base.errorTrigger` | [`workflows/system-error-handler.json`](file:///c:/Users/HP/Job-Portal/n8n/workflows/system-error-handler.json) | Automatically captures any execution failure across workflows and dispatches diagnostic alerts. |

---

## 🚀 Running n8n Locally

You can run n8n either via Docker or directly using Node/npx:

### Option A: Via Docker Compose (Recommended for isolated containers)
```bash
docker compose up -d n8n
```

### Option B: Via Direct npx (Recommended for fast local testing)
```bash
npm run dev:n8n
```
The console will be accessible at: **`http://localhost:5678`**

---

## 🔍 Diagnostics & Health Verification

Run our built-in diagnostics utility to validate workflow schemas, check n8n server connectivity, and test webhook responsiveness:

```bash
npm run n8n:diagnose
```

---

## ⚙️ Why Webhooks Return 404 & How to Fix It

If calling `http://localhost:5678/webhook/healthcare-new-job` returns:
```json
{ "code": 404, "message": "The requested webhook \"POST healthcare-new-job\" is not registered." }
```

### Explanation:
n8n distinguishes between **Test Mode** and **Active Production Mode**:
1. **In Test Mode (in the n8n UI canvas):**
   - Click "Test step" or "Execute workflow".
   - In this mode, n8n listens exclusively at `/webhook-test/...` (e.g. `http://localhost:5678/webhook-test/healthcare-new-job`).
2. **In Production Mode:**
   - In the top-right corner of the workflow editor, toggle the switch from **Inactive** to **Active**.
   - Click **Save**.
   - n8n now permanently listens at `/webhook/healthcare-new-job`.

> [!TIP]
> **AdonisJS Backend Resilience:**
> The `N8nDispatcherService` in our backend automatically handles this! If `/webhook/...` returns 404, it immediately attempts `/webhook-test/...` so you can test workflows in the canvas without toggling them active!

---

## 🧪 Quick Webhook Testing via curl

### 1. Test New Job Webhook
```bash
curl -X POST http://localhost:5678/webhook/healthcare-new-job \
  -H "Content-Type: application/json" \
  -d '{
    "event": "job.created",
    "job": {
      "guid": "test-rn-101",
      "title": "Clinical Nurse Specialist (ICU)",
      "companyName": "Mercy Health Hospital",
      "category": "Nursing",
      "workplaceType": "On-site",
      "location": "Boston, MA",
      "salaryString": "$125,000 - $145,000 / year",
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
    "jobTitle": "Clinical Nurse Specialist (ICU)",
    "companyName": "Mercy Health Hospital",
    "application": {
      "candidateName": "David Chen, RN, BSN",
      "candidateEmail": "david.chen@example.com",
      "clinicalLicenseNumber": "MA-RN-883921",
      "licensedState": "MA",
      "yearsOfExperience": 6,
      "resumeUrl": "https://linkedin.com/in/davidchen-rn"
    }
  }'
```
