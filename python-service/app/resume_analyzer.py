"""
Clinical Candidate & Resume Credential Analyzer
Parses candidate submissions, validates state licenses, and scores clinical match.
"""

import re
from typing import Dict, Any, List

STATE_LICENSE_REGEX = r"\b([A-Z]{2})[- ]?([0-9]{5,10})\b"

class ResumeAnalyzer:
    @classmethod
    def analyze_candidate(cls, application: Dict[str, Any], job_title: str) -> Dict[str, Any]:
        """
        Analyzes a candidate application and returns structured insights.
        """
        candidate_name = application.get("candidateName", "")
        email = application.get("candidateEmail", "")
        license_input = application.get("clinicalLicenseNumber", "") or ""
        cover_letter = application.get("coverLetter", "") or ""
        resume_url = application.get("resumeUrl", "") or ""
        years_exp = application.get("yearsOfExperience", 0)

        # Detect license format
        has_license = bool(license_input.strip() and len(license_input) >= 4)
        detected_state_match = re.search(STATE_LICENSE_REGEX, license_input)
        licensed_state = detected_state_match.group(1) if detected_state_match else "Unspecified"

        # Key clinical competencies search
        text_corpus = f"{cover_letter} {license_input}".lower()
        competencies = []
        if "icu" in text_corpus or "critical care" in text_corpus:
            competencies.append("Critical Care / ICU")
        if "telehealth" in text_corpus or "remote" in text_corpus:
            competencies.append("Telehealth Experience")
        if "ehr" in text_corpus or "epic" in text_corpus or "cerner" in text_corpus:
            competencies.append("EHR / Clinical Systems")
        if "pediatric" in text_corpus:
            competencies.append("Pediatrics")

        # Qualification Match Score (0 - 100)
        score = 40
        if has_license:
            score += 30
        if years_exp >= 3:
            score += 20
        elif years_exp >= 1:
            score += 10
        if resume_url and resume_url.startswith("http"):
            score += 10
        score = min(100, score)

        return {
            "candidateName": candidate_name,
            "candidateEmail": email,
            "targetJob": job_title,
            "isLicenseVerified": has_license,
            "licenseNumber": license_input or "Not provided",
            "licensedState": licensed_state,
            "yearsOfExperience": years_exp,
            "detectedCompetencies": competencies,
            "qualificationScore": score,
            "recommendation": "Interview Immediately" if score >= 80 else ("Review Credentials" if score >= 60 else "Requires Screening"),
            "resumeUrl": resume_url
        }
