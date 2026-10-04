"""
CLI Utility: Strict Healthcare Job Synchronizer
Fetches from remote APIs, discards non-healthcare noise, and saves clean data.
Supports both httpx and standard urllib.
Usage:
    python cli_sync.py [--limit 100] [--output ../backend/src/data/manualJobs.json]
"""

import argparse
import json
import os
import sys
from pathlib import Path
import urllib.request

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure local app is importable
sys.path.insert(0, os.path.dirname(__file__))
from app.classifier import StrictHealthcareClassifier

HIMALAYAS_API_URL = "https://himalayas.app/jobs/api"

def fetch_jobs(limit: int):
    try:
        import httpx
        with httpx.Client(timeout=15.0) as client:
            resp = client.get(f"{HIMALAYAS_API_URL}?limit={limit}")
            if resp.status_code == 200:
                data = resp.json()
                return data.get("jobs", []) if isinstance(data, dict) else data
    except ImportError:
        pass

    # Standard library urllib fallback
    req = urllib.request.Request(
        f"{HIMALAYAS_API_URL}?limit={limit}",
        headers={"User-Agent": "HealthcareJobPortal/2.0"}
    )
    with urllib.request.urlopen(req, timeout=15) as response:
        data = json.loads(response.read().decode("utf-8"))
        return data.get("jobs", []) if isinstance(data, dict) else data

def run_sync(limit: int, output_path: str):
    print(f"[FETCH] Requesting {limit} jobs from Himalayas API...")
    try:
        raw_jobs = fetch_jobs(limit)
        print(f"[FILTER] Screening {len(raw_jobs)} raw jobs through Strict Healthcare Classifier...")
        cleaned = StrictHealthcareClassifier.filter_and_enrich_jobs(raw_jobs)
        print(f"[RESULT] Found {len(cleaned)} strictly authentic healthcare opportunities.")

        target = Path(output_path).resolve()
        target.parent.mkdir(parents=True, exist_ok=True)

        existing = []
        if target.exists():
            try:
                with open(target, "r", encoding="utf-8") as f:
                    content = json.load(f)
                    existing = content.get("jobs", []) if isinstance(content, dict) else content
            except Exception:
                existing = []

        # Merge deduplicated
        merged = []
        seen = set()
        for j in (cleaned + existing):
            title = (j.get("title") or "").strip().lower()
            company = (j.get("companyName") or "").strip().lower()
            key = f"{title}::{company}"
            if key not in seen:
                seen.add(key)
                merged.append(j)

        with open(target, "w", encoding="utf-8") as f:
            json.dump(merged, f, indent=2)

        print(f"[SAVED] Persisted {len(merged)} verified healthcare jobs to: {target}")

    except Exception as e:
        print(f"[ERROR] Error during sync: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Strict Healthcare Job Synchronizer")
    parser.add_argument("--limit", type=int, default=150, help="Number of upstream jobs to fetch")
    parser.add_argument(
        "--output",
        type=str,
        default=os.path.join(os.path.dirname(__file__), "..", "backend", "src", "data", "manualJobs.json"),
        help="Path to manualJobs.json"
    )
    args = parser.parse_args()
    run_sync(args.limit, args.output)
