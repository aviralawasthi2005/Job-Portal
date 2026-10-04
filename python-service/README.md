# Python Healthcare Intelligence & n8n Automation Microservice

FastAPI microservice engineered specifically to ensure **100% precision in healthcare recruitment**, eliminating generic software, sales, accounting, and false-positive employer perks.

## 🎯 What This Service Does
1. **Strict Healthcare Classifier:** Multi-stage NLP filter rejecting all non-clinical roles. Never relies on generic description keywords like "health insurance" or "wellness perks".
2. **Clinical Credential Extractor:** Extracts verified certifications (MD, DO, RN, BSN, MSN, NP, PMHNP, LPN, PharmD, PA-C, LCSW, LMFT, CPC, RHIA).
3. **Resume & Qualification Analyzer:** Validates candidate state licenses and generates candidate ATS readiness scores for n8n.
4. **n8n Automation Connector:** Provides REST endpoints and webhook receivers for orchestrating multi-channel alerts and candidate emails.

## 🚀 Running Locally

```bash
cd python-service
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000 --reload
```

Interactive API Swagger docs: [http://localhost:8000/docs](http://localhost:8000/docs).

## 🩺 Run One-Off Sync CLI

To scrape from Himalayas, filter strictly for healthcare, and populate the database:

```bash
python cli_sync.py --limit 150
```
