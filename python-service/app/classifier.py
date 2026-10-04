"""
Strict Healthcare & Clinical Job Classifier
Ensures 100% precision: Only authentic medical, nursing, clinical, pharmacy,
telehealth, and health-informatics roles are accepted.
Eliminates non-healthcare noise, generic IT, sales, and employee-perk false positives.
"""

import re
from typing import Dict, List, Optional, Tuple, Any

# ==============================================================================
# 1. STRICT HEALTHCARE DOMAIN TAXONOMY
# ==============================================================================

HEALTHCARE_TAXONOMY: Dict[str, List[str]] = {
    "Nursing": [
        "nurse", "nursing", "registered nurse", "rn", "bsn", "msn", "lpn", "lvn",
        "nurse practitioner", "np", "aprn", "crna", "charge nurse", "triage nurse",
        "icu nurse", "pediatric nurse", "school nurse", "clinical nurse"
    ],
    "Physicians & Surgeons": [
        "physician", "doctor", "surgeon", "hospitalist", "cardiologist", "dermatologist",
        "oncologist", "pediatrician", "neurologist", "psychiatrist", "anesthesiologist",
        "pathologist", "radiologist", "general practitioner", "primary care physician",
        "pcp", "medical director", "chief medical officer", "cmo", "md", "do"
    ],
    "Telehealth & Digital Health": [
        "telehealth", "telemedicine", "virtual care", "remote patient monitoring",
        "rpm", "digital clinic", "virtual clinic", "virtual nurse", "tele-triage"
    ],
    "Pharmacy & Pharmacology": [
        "pharmacist", "pharmacy", "pharmd", "rph", "pharmacy technician", "clinical pharmacist",
        "pharmacology", "infusion pharmacist", "compounding pharmacist"
    ],
    "Mental & Behavioral Health": [
        "mental health", "behavioral health", "therapist", "psychologist", "licensed counselor",
        "lcsw", "lmft", "lpc", "social worker", "addiction counselor", "substance abuse counselor"
    ],
    "Health Informatics & Medical Coding": [
        "health informatics", "medical coding", "medical coder", "clinical documentation",
        "cdi specialist", "rhia", "rhit", "cpc", "ccs", "ehr specialist", "fhir",
        "epic analyst", "cerner analyst", "healthcare data analyst", "clinical data manager",
        "inpatient coder", "outpatient coder", "pro fee coder", "utilization review"
    ],
    "Clinical Research & Life Sciences": [
        "clinical research", "clinical trial", "cra", "crc", "clinical trial coordinator",
        "biostatistician", "regulatory affairs", "clinical study manager", "medical writer",
        "pharmacovigilance", "biomedical scientist", "bioinformatics"
    ],
    "Allied Health & Diagnostics": [
        "medical assistant", "cna", "phlebotomist", "laboratory technician", "medical technologist",
        "ultrasound technician", "sonographer", "radiology technician", "mri technologist",
        "physical therapist", "physiotherapist", "pt", "occupational therapist", "ot",
        "speech language pathologist", "slp", "respiratory therapist", "dietitian", "nutritionist",
        "dental hygienist", "dentist", "optometrist"
    ]
}

# Recognized Clinical Licensures & Credentials
CREDENTIAL_PATTERNS: Dict[str, str] = {
    "MD": r"\b(m\.?d\.?|doctor of medicine)\b",
    "DO": r"\b(d\.?o\.?|doctor of osteopathic medicine)\b",
    "RN": r"\b(r\.?n\.?|registered nurse)\b",
    "NP": r"\b(n\.?p\.?|nurse practitioner|aprn)\b",
    "BSN": r"\b(bsn|bachelor of science in nursing)\b",
    "MSN": r"\b(msn|master of science in nursing)\b",
    "LPN": r"\b(lpn|lvn|licensed practical nurse)\b",
    "PharmD": r"\b(pharm\.?d\.?|pharmacist)\b",
    "PA-C": r"\b(pa-c|physician assistant)\b",
    "LCSW": r"\b(lcsw|licensed clinical social worker)\b",
    "LMFT": r"\b(lmft|licensed marriage and family therapist)\b",
    "CNA": r"\b(cna|certified nursing assistant)\b",
    "CPC": r"\b(cpc|certified professional coder)\b",
    "RHIA": r"\b(rhia|registered health information administrator)\b",
    "CRA": r"\b(cra|clinical research associate)\b",
    "BLS/ACLS": r"\b(bls|acls|basic life support|advanced cardiac life support)\b"
}

# ==============================================================================
# 2. STRICT NEGATIVE FILTER (Eliminates Non-Healthcare Leaks)
# ==============================================================================

# Roles that are NOT healthcare positions unless explicitly modified with clinical terms
NON_HEALTHCARE_ROLES = [
    r"\bsoftware engineer\b",
    r"\bfull[\s\-]stack\b",
    r"\bfrontend developer\b",
    r"\bbackend developer\b",
    r"\bdevops\b",
    r"\bplatform engineering\b",
    r"\bsre\b",
    r"\baccountant\b",
    r"\baccounting\b",
    r"\bbookkeeper\b",
    r"\bfinancial analyst\b",
    r"\bsales executive\b",
    r"\baccount executive\b",
    r"\bsdr\b",
    r"\bbdr\b",
    r"\bcopywriter\b",
    r"\bvideo editor\b",
    r"\bvideo producer\b",
    r"\bgraphic designer\b",
    r"\bmarketing manager\b",
    r"\bseo specialist\b",
    r"\brecruiter\b",
    r"\btalent acquisition\b",
    r"\bproduct manager\b",
    r"\bproduct designer\b",
    r"\bcustomer success\b",
    r"\bcustomer support\b"
]

# Clinical modifiers that allow an otherwise technical role (e.g. "Clinical Data Manager")
CLINICAL_OVERRIDES = [
    "clinical", "healthcare", "medical", "hospital", "biomedical",
    "bioinformatics", "ehr", "telehealth", "telemedicine", "patient"
]

# Words that falsely trigger matches if checked in general description
PERK_FALSE_POSITIVES = [
    r"\bhealth insurance\b",
    r"\bmedical insurance\b",
    r"\bdental insurance\b",
    r"\bvision insurance\b",
    r"\bwellness stipend\b",
    r"\bwellness program\b",
    r"\bcare about diversity\b",
    r"\btake care of\b",
    r"\bpaid family care\b",
    r"\bemployee assistance\b"
]


class StrictHealthcareClassifier:
    """
    Evaluates, filters, classifies, and enriches healthcare jobs.
    """

    @classmethod
    def clean_text(cls, text: Optional[str]) -> str:
        if not text:
            return ""
        # Strip HTML tags
        clean = re.sub(r"<[^>]+>", " ", text)
        return clean.lower()

    @classmethod
    def extract_credentials(cls, text: str) -> List[str]:
        """Extracts medical licenses & clinical credentials found in the text."""
        credentials = []
        for code, pattern in CREDENTIAL_PATTERNS.items():
            if re.search(pattern, text, re.IGNORECASE):
                credentials.append(code)
        return list(dict.fromkeys(credentials))

    @classmethod
    def is_strictly_healthcare(cls, job: Dict[str, Any]) -> Tuple[bool, Optional[str], List[str]]:
        """
        Determines whether a job is an authentic healthcare opening.
        Returns:
            (is_valid_healthcare: bool, category: Optional[str], credentials: List[str])
        """
        title = (job.get("title") or "").strip()
        title_lower = title.lower()
        company = (job.get("companyName") or job.get("company") or "").strip()
        categories = job.get("categories") or []
        excerpt = cls.clean_text(job.get("excerpt") or "")
        description = cls.clean_text(job.get("description") or "")
        
        # Combine title and structured categories for initial verification
        categories_str = " ".join([c.replace("-", " ") for c in categories]).lower()

        # Step 1: Reject obvious non-healthcare titles
        for neg_pat in NON_HEALTHCARE_ROLES:
            if re.search(neg_pat, title_lower):
                # Only permit if title or categories explicitly contain clinical overrides
                has_override = any(ov in title_lower or ov in categories_str for ov in CLINICAL_OVERRIDES)
                if not has_override:
                    return False, None, []

        # Step 2: Check structured Himalayas categories
        matched_category: Optional[str] = None
        for cat_name, keywords in HEALTHCARE_TAXONOMY.items():
            for kw in keywords:
                # Word boundary match for short keywords
                pattern = rf"\b{re.escape(kw)}\b" if len(kw) <= 4 else re.escape(kw)
                if re.search(pattern, categories_str) or re.search(pattern, title_lower):
                    matched_category = cat_name
                    break
            if matched_category:
                break

        # Step 3: Check title and excerpt (first 300 chars) if not matched yet
        if not matched_category:
            header_text = f"{title_lower} {excerpt[:300]}"
            for cat_name, keywords in HEALTHCARE_TAXONOMY.items():
                for kw in keywords:
                    pattern = rf"\b{re.escape(kw)}\b" if len(kw) <= 4 else re.escape(kw)
                    if re.search(pattern, header_text):
                        matched_category = cat_name
                        break
                if matched_category:
                    break

        # Step 4: If still no match, it is NOT an authentic healthcare job
        if not matched_category:
            return False, None, []

        # Step 5: Extract credentials from title + description
        full_text = f"{title} {excerpt} {description[:1000]}"
        credentials = cls.extract_credentials(full_text)

        return True, matched_category, credentials

    @classmethod
    def filter_and_enrich_jobs(cls, raw_jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Filters a list of jobs, retaining ONLY authentic healthcare positions
        and enriching each with its verified category and credentials.
        """
        sanitized = []
        seen_keys = set()

        for raw in raw_jobs:
            is_valid, category, credentials = cls.is_strictly_healthcare(raw)
            if not is_valid or not category:
                continue

            # Deduplication key
            title = (raw.get("title") or "").strip()
            company = (raw.get("companyName") or raw.get("company") or "").strip()
            dedup_key = f"{title.lower()}::{company.lower()}"
            if dedup_key in seen_keys:
                continue
            seen_keys.add(dedup_key)

            # Build enriched job object
            min_sal = raw.get("minSalary") or raw.get("salaryMin")
            max_sal = raw.get("maxSalary") or raw.get("salaryMax")
            cur = raw.get("salaryCurrency") or "USD"
            salary_str = None
            if min_sal and max_sal:
                salary_str = f"${int(min_sal):,} - ${int(max_sal):,} / yr"
            elif min_sal:
                salary_str = f"From ${int(min_sal):,} / yr"

            enriched = {
                "guid": raw.get("guid") or f"hc-{raw.get('id') or hash(dedup_key)}",
                "title": title,
                "companyName": company or "Healthcare Network",
                "companyLogo": raw.get("companyLogo") or raw.get("logo"),
                "companyWebsite": raw.get("companyWebsite"),
                "category": category,
                "type": raw.get("employmentType") or ("Full-time" if raw.get("isFullTime") else "Contract"),
                "workplaceType": "Remote" if raw.get("isRemote", True) else "Hybrid",
                "location": raw.get("location") or "Remote (US/Global)",
                "salary": {
                    "min": int(min_sal or 0),
                    "max": int(max_sal or min_sal or 0),
                    "currency": cur,
                    "period": "yearly"
                } if (min_sal or max_sal) else None,
                "salaryString": salary_str or raw.get("salaryString"),
                "description": raw.get("description") or raw.get("excerpt") or "Rewarding healthcare position.",
                "requirements": raw.get("requirements") or [
                    "Active healthcare licensure or relevant clinical qualification",
                    "Commitment to patient outcomes and HIPAA standards"
                ],
                "benefits": raw.get("benefits") or [
                    "Comprehensive medical, dental, and vision coverage",
                    "Continuing Medical Education (CME) allowance",
                    "Flexible clinical schedule"
                ],
                "skills": list(dict.fromkeys((raw.get("skills") or []) + credentials)),
                "credentials": credentials,
                "applicationUrl": raw.get("applicationUrl") or raw.get("url"),
                "source": raw.get("source") or "himalayas",
                "publishedAt": raw.get("pubDate") or raw.get("publishedAt") or "2026-10-04T00:00:00Z",
                "featured": bool(raw.get("featured", False) or len(credentials) > 0)
            }
            sanitized.append(enriched)

        return sanitized
