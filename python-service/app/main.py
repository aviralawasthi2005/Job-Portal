"""
Healthcare Intelligence & n8n Automation Microservice
FastAPI + Pydantic + Strict Clinical Classification
"""

from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import httpx
import os
import uvicorn
from .classifier import StrictHealthcareClassifier
from .resume_analyzer import ResumeAnalyzer

app = FastAPI(
    title="Healthcare Intelligence & n8n Automation Engine",
    description="Microservice providing strict clinical job filtering, credential parsing, and n8n webhook orchestration.",
    version="2.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

HIMALAYAS_API_URL = os.getenv("HIMALAYAS_API_URL", "https://himalayas.app/jobs/api")
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "http://localhost:5678/webhook/healthcare-new-job")


# Models
class FilterJobsRequest(BaseModel):
    jobs: List[Dict[str, Any]]

class CandidateApplicationPayload(BaseModel):
    application: Dict[str, Any]
    jobTitle: str = Field(default="Healthcare Professional")
    companyName: str = Field(default="Healthcare Organization")

class N8nTriggerPayload(BaseModel):
    event: str
    data: Dict[str, Any]


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "python-healthcare-intelligence",
        "classifier_mode": "STRICT_HEALTHCARE_ONLY",
        "version": "2.0.0"
    }


@app.post("/api/v1/jobs/filter")
def filter_jobs(payload: FilterJobsRequest):
    """
    Takes an array of raw jobs from any external source,
    strips out all generic IT/sales/accounting noise, and
    returns ONLY 100% verified healthcare jobs.
    """
    cleaned = StrictHealthcareClassifier.filter_and_enrich_jobs(payload.jobs)
    return {
        "success": True,
        "rawCount": len(payload.jobs),
        "verifiedHealthcareCount": len(cleaned),
        "data": cleaned
    }


@app.post("/api/v1/jobs/sync")
async def sync_himalayas_jobs(limit: int = 150):
    """
    Directly scrapes and filters Himalayas API for strict healthcare roles.
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{HIMALAYAS_API_URL}?limit={limit}")
            if resp.status_code != 200:
                raise HTTPException(status_code=502, detail="Upstream Himalayas API error")
            raw_data = resp.json()
            raw_jobs = raw_data.get("jobs", []) if isinstance(raw_data, dict) else raw_data

        filtered_jobs = StrictHealthcareClassifier.filter_and_enrich_jobs(raw_jobs)

        return {
            "success": True,
            "totalFetchedFromHimalayas": len(raw_jobs),
            "totalValidHealthcareJobs": len(filtered_jobs),
            "jobs": filtered_jobs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/candidates/analyze-resume")
def analyze_candidate_application(payload: CandidateApplicationPayload):
    """
    Analyzes an applicant's credentials, checks state licensure,
    and returns a qualification score for n8n ATS integration.
    """
    result = ResumeAnalyzer.analyze_candidate(payload.application, payload.jobTitle)
    return {
        "success": True,
        "analysis": result
    }


@app.post("/api/v1/n8n/webhook")
async def n8n_webhook_receiver(payload: N8nTriggerPayload, background_tasks: BackgroundTasks):
    """
    Two-way communication endpoint called by n8n workflows.
    """
    event = payload.event
    print(f"[Python Service] Received event from n8n: {event}")
    return {
        "success": True,
        "eventReceived": event,
        "status": "processed"
    }


if __name__ == "__main__":
    port = int(os.getenv("PYTHON_PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
