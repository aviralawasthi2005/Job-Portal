import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

// In-memory unified cache: maps guid/slug -> job details
const jobCache = new Map();

// Supported healthcare categories and their associated keywords for filtering
const HEALTHCARE_CATEGORIES = {
  'Doctor': ['doctor', 'physician', 'md', 'do', 'pediatrician', 'cardiologist', 'dermatologist', 'gp', 'general practitioner', 'oncologist'],
  'Nurse': ['nurse', 'rn', 'lpn', 'np', 'nursing', 'nurse practitioner', 'registered nurse', 'midwife'],
  'Medical Assistant': ['medical assistant', 'ma', 'cna', 'certified nursing assistant', 'orderly', 'clinical assistant'],
  'Pharmacist': ['pharmacist', 'pharmacy', 'pharmacology', 'pharmd', 'apothecary'],
  'Dentist': ['dentist', 'dental', 'orthodontist', 'dental hygienist', 'hygienist'],
  'Radiologist': ['radiologist', 'radiology', 'x-ray', 'mri', 'ultrasound', 'sonographer'],
  'Healthcare Administrator': ['administrator', 'healthcare administrator', 'medical billing', 'medical coder', 'billing', 'coder', 'health admin', 'receptionist', 'medical office'],
  'Physiotherapist': ['physiotherapist', 'physiotherapy', 'physical therapist', 'pt', 'occupational therapist', 'ot', 'rehab'],
  'Lab Technician': ['lab technician', 'laboratory', 'pathology', 'phlebotomist', 'lab tech', 'clinical lab'],
  'Clinical Research': ['researcher', 'clinical research', 'clinical trials', 'cra', 'trial coordinator', 'biostatistician'],
  'Mental Health': ['mental health', 'therapist', 'psychologist', 'psychiatrist', 'counselor', 'lcsw', 'social worker', 'behavioral'],
  'Telemedicine': ['telemedicine', 'telehealth', 'remote medicine', 'virtual care', 'digital health'],
  'Biomedical & Biotech': ['biomedical', 'biotech', 'biotechnology', 'bioinformatics', 'genetics', 'prosthetics', 'biomaterial', 'biomechanical', 'bioengineering', 'biomed', 'geneticist', 'clinical engineer', 'biomedical engineer', 'biomedical scientist', 'biomedical technician']
};

// High-confidence healthcare/clinical/biotech keywords (these are safe to check anywhere, including description)
const HIGH_CONFIDENCE_KEYWORDS = [
  'doctor', 'physician', 'md', 'do', 'pediatrician', 'cardiologist', 'dermatologist', 'gp', 'general practitioner', 'oncologist',
  'nurse', 'rn', 'lpn', 'np', 'nursing', 'nurse practitioner', 'registered nurse', 'midwife',
  'medical assistant', 'ma', 'cna', 'certified nursing assistant', 'orderly', 'clinical assistant',
  'pharmacist', 'pharmacy', 'pharmacology', 'pharmd', 'apothecary',
  'dentist', 'dental', 'orthodontist', 'dental hygienist', 'hygienist',
  'radiologist', 'radiology', 'x-ray', 'mri', 'ultrasound', 'sonographer',
  'physiotherapist', 'physiotherapy', 'physical therapist', 'pt', 'occupational therapist', 'ot', 'rehab',
  'lab technician', 'laboratory', 'pathology', 'phlebotomist', 'lab tech', 'clinical lab',
  'clinical research', 'clinical trials', 'cra', 'trial coordinator', 'biostatistician',
  'mental health', 'therapist', 'psychologist', 'psychiatrist', 'counselor', 'lcsw', 'social worker', 'behavioral',
  'telemedicine', 'telehealth', 'remote medicine', 'virtual care', 'digital health',
  'biomedical', 'biotech', 'biotechnology', 'bioinformatics', 'genetics', 'prosthetics', 'biomaterial', 
  'biomechanical', 'bioengineering', 'biomed', 'geneticist', 'clinical engineer', 'biomedical engineer', 
  'biomedical scientist', 'biomedical technician', 'laboratory equipment', 'clinic', 'caregiver', 'tele-health',
  'biomedical engineering'
];

// Generic/Low-confidence keywords (checking these in full description causes false positives like "health insurance" or "medical benefits")
// We ONLY search for these in the job TITLE or EXCERPT (first 150 chars of description) to ensure it's a real healthcare role!
const GENERIC_HEALTHCARE_KEYWORDS = [
  'healthcare', 'medical', 'hospital', 'patient', 'health', 'medicine', 'clinical', 'administrator', 'billing', 'coder', 'receptionist'
];

const normalizeText = (text) => {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
};

/**
 * Checks if a job matches healthcare criteria
 */
const EXCLUDED_TITLE_KEYWORDS = [
  'software engineer', 'full stack', 'full-stack', 'video editor', 'video editing', 'devops', 
  'graphic designer', 'copywriter', 'seo specialist', 'web developer', 'backend developer', 
  'frontend developer', 'system administrator', 'sysadmin', 'sales representative', 'telemarketer',
  'video producer'
];

const isHealthcareJob = (job, category = null) => {
  const title = normalizeText(job.title);
  const excerpt = normalizeText(job.excerpt);
  const description = normalizeText(job.description);

  const titleLower = title.toLowerCase();
  
  // Exclude non-healthcare generic tech/media/sales roles
  const hasExcludedKeyword = EXCLUDED_TITLE_KEYWORDS.some(k => titleLower.includes(k));
  if (hasExcludedKeyword) {
    // Exception: Keep if the title explicitly contains highly specific clinical/medical terms
    const hasSpecificClinical = ['doctor', 'nurse', 'biomedical', 'biotech', 'clinical', 'pharmacist', 'dentist'].some(c => titleLower.includes(c));
    if (!hasSpecificClinical) {
      return false;
    }
  }

  // 1. If an active category is chosen, use category-specific strict checks
  if (category && HEALTHCARE_CATEGORIES[category]) {
    const keywords = HEALTHCARE_CATEGORIES[category];
    return keywords.some(keyword => {
      if (keyword.length <= 3) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        return regex.test(title) || regex.test(excerpt) || regex.test(description);
      }
      return title.includes(keyword) || excerpt.includes(keyword) || description.includes(keyword);
    });
  }

  // 2. If no category is chosen, screen general healthcare/biotech keywords
  
  // A. Check high-confidence clinical keywords anywhere (including full description)
  const hasHighConfidence = HIGH_CONFIDENCE_KEYWORDS.some(keyword => {
    if (keyword.length <= 3) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      return regex.test(title) || regex.test(excerpt) || regex.test(description);
    }
    return title.includes(keyword) || excerpt.includes(keyword) || description.includes(keyword);
  });

  if (hasHighConfidence) return true;

  // B. Check generic keywords ONLY in the TITLE or EXCERPT to completely avoid "health benefits" false positives in full descriptions!
  const hasGeneric = GENERIC_HEALTHCARE_KEYWORDS.some(keyword => {
    if (keyword.length <= 3) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      return regex.test(title) || regex.test(excerpt);
    }
    return title.includes(keyword) || excerpt.includes(keyword);
  });

  return hasGeneric;
};

/**
 * Checks if a job is remote to India or Worldwide
 * Returns a score: 3 = Specific India remote, 2 = Worldwide remote, 1 = Other remote
 */
const getIndiaRelevanceScore = (job) => {
  const locations = (job.locationRestrictions || []).map(l => l.toLowerCase());
  const title = (job.title || '').toLowerCase();
  const desc = (job.description || '').toLowerCase();

  // 1. Specific India / APAC references in location restrictions or details
  const hasIndiaLocation = locations.some(l => l.includes('india') || l === 'in' || l === 'ind' || l === 'apac' || l.includes('apac'));
  if (hasIndiaLocation || title.includes('india') || desc.includes('remote in india') || desc.includes('based in india')) {
    return 3;
  }

  // 2. Worldwide remote positions (accessible to Indian seekers)
  const isWorldwide = locations.some(l => l.includes('worldwide') || l.includes('anywhere') || l.includes('global') || l.includes('remote ok')) || locations.length === 0;
  if (isWorldwide) {
    return 2;
  }

  return 1;
};

/**
 * Helper to flat-extract string representations of seniority
 */
const getSeniorityString = (val) => {
  if (!val) return 'Mid-level';
  if (Array.isArray(val)) {
    return val.length > 0 ? String(val[0]) : 'Mid-level';
  }
  return String(val);
};

const getNormalizedSeniority = (val) => {
  if (!val) return 'mid-level';
  const clean = val.toLowerCase().trim();
  if (clean.includes('entry') || clean.includes('junior') || clean.includes('intern') || clean.includes('associate')) {
    return 'entry-level';
  }
  if (clean.includes('senior') || clean.includes('lead') || clean.includes('principal') || clean.includes('sr')) {
    return 'senior';
  }
  if (clean.includes('manager') || clean.includes('mgmt') || clean.includes('head')) {
    return 'manager';
  }
  if (clean.includes('director') || clean.includes('vp')) {
    return 'director';
  }
  if (clean.includes('executive') || clean.includes('chief') || clean.includes('c-level') || clean.includes('coo') || clean.includes('ceo') || clean.includes('cto')) {
    return 'executive';
  }
  return 'mid-level';
};

/**
 * Helper to flat-extract string representations of employment types
 */
const getEmploymentTypeString = (val) => {
  if (!val) return 'Full Time';
  if (Array.isArray(val)) {
    return val.length > 0 ? String(val[0]) : 'Full Time';
  }
  return String(val);
};

const getNormalizedEmploymentType = (val) => {
  if (!val) return 'full time';
  const clean = val.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
  if (clean.includes('full') || clean.includes('permanent')) {
    return 'full time';
  }
  if (clean.includes('part')) {
    return 'part time';
  }
  if (clean.includes('contract') || clean.includes('freelance') || clean.includes('temp')) {
    return 'contractor';
  }
  if (clean.includes('intern')) {
    return 'intern';
  }
  return 'full time';
};

/**
 * Normalization Pipelines
 */
const normalizeHimalayas = (job) => ({
  guid: job.guid || `himalayas-${job.title}-${job.companyName}`,
  title: job.title || '',
  excerpt: job.excerpt || '',
  description: job.description || '',
  companyName: job.companyName || '',
  companyLogo: job.companyLogo || '',
  companySlug: job.companySlug || '',
  employmentType: getEmploymentTypeString(job.employmentType),
  seniority: getSeniorityString(job.seniority),
  minSalary: job.minSalary || null,
  maxSalary: job.maxSalary || null,
  currency: job.currency || 'USD',
  locationRestrictions: job.locationRestrictions || [],
  timezoneRestrictions: job.timezoneRestrictions || [],
  pubDate: job.pubDate ? new Date(job.pubDate).getTime() : Date.now(),
  source: 'Himalayas',
  applicationLink: job.applicationLink || ''
});

const normalizeRemotive = (job) => {
  let minSalary = null;
  let maxSalary = null;
  let currency = 'USD';
  if (job.salary) {
    const salaryStr = job.salary.toLowerCase();
    const matches = salaryStr.match(/\d+/g);
    if (matches && matches.length >= 2) {
      minSalary = parseInt(matches[0]) * (salaryStr.includes('k') ? 1000 : 1);
      maxSalary = parseInt(matches[1]) * (salaryStr.includes('k') ? 1000 : 1);
    } else if (matches && matches.length === 1) {
      minSalary = parseInt(matches[0]) * (salaryStr.includes('k') ? 1000 : 1);
    }
    if (salaryStr.includes('€') || salaryStr.includes('eur')) currency = 'EUR';
    else if (salaryStr.includes('£') || salaryStr.includes('gbp')) currency = 'GBP';
  }

  let empType = 'Full Time';
  if (job.job_type) {
    const type = job.job_type.toLowerCase();
    if (type.includes('part')) empType = 'Part Time';
    else if (type.includes('contract')) empType = 'Contractor';
    else if (type.includes('intern')) empType = 'Intern';
  }

  const locations = job.candidate_required_location ? [job.candidate_required_location] : [];

  return {
    guid: String(job.id || job.url),
    title: job.title || '',
    excerpt: job.description ? job.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
    description: job.description || '',
    companyName: job.company_name || '',
    companyLogo: job.company_logo || '',
    companySlug: job.company_name ? job.company_name.toLowerCase().replace(/[^a-z0-9]/g, '-') : '',
    employmentType: empType,
    seniority: job.tags && job.tags.some(t => t.toLowerCase().includes('senior')) ? 'Senior' : 'Mid-level',
    minSalary,
    maxSalary,
    currency,
    locationRestrictions: locations,
    timezoneRestrictions: [],
    pubDate: job.publication_date ? new Date(job.publication_date).getTime() : Date.now(),
    source: 'Remotive',
    applicationLink: job.url || ''
  };
};

const normalizeArbeitnow = (job) => {
  let empType = 'Full Time';
  if (job.job_types && job.job_types.length > 0) {
    const primaryType = job.job_types[0].toLowerCase();
    if (primaryType.includes('part')) empType = 'Part Time';
    else if (primaryType.includes('contract')) empType = 'Contractor';
    else if (primaryType.includes('intern')) empType = 'Intern';
  }

  const locations = job.location ? [job.location] : [];

  return {
    guid: job.slug || job.url,
    title: job.title || '',
    excerpt: job.description ? job.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
    description: job.description || '',
    companyName: job.company_name || '',
    companyLogo: '',
    companySlug: job.company_name ? job.company_name.toLowerCase().replace(/[^a-z0-9]/g, '-') : '',
    employmentType: empType,
    seniority: job.tags && job.tags.some(t => t.toLowerCase().includes('senior')) ? 'Senior' : 'Mid-level',
    minSalary: null,
    maxSalary: null,
    currency: 'EUR',
    locationRestrictions: locations,
    timezoneRestrictions: [],
    pubDate: job.created_at ? new Date(job.created_at).getTime() : Date.now(),
    source: 'Arbeitnow',
    applicationLink: job.url || ''
  };
};

const normalizeTheMuse = (job) => {
  return {
    guid: String(job.id || job.refs?.landing_page),
    title: job.name || '',
    excerpt: job.contents ? job.contents.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').substring(0, 150) + '...' : '',
    description: job.contents || '',
    companyName: job.company?.name || '',
    companyLogo: '',
    companySlug: job.company?.name ? job.company.name.toLowerCase().replace(/[^a-z0-9]/g, '-') : '',
    employmentType: 'Full Time',
    seniority: 'Mid-level',
    minSalary: null,
    maxSalary: null,
    currency: 'USD',
    locationRestrictions: (job.locations || []).map(l => l.name),
    timezoneRestrictions: [],
    pubDate: job.publication_date ? new Date(job.publication_date).getTime() : Date.now(),
    source: 'The Muse',
    applicationLink: job.refs?.landing_page || ''
  };
};

const normalizeJobicy = (job) => {
  let empType = 'Full Time';
  if (job.jobType && job.jobType.length > 0) {
    const type = job.jobType[0].toLowerCase();
    if (type.includes('part')) empType = 'Part Time';
    else if (type.includes('contract')) empType = 'Contractor';
    else if (type.includes('intern')) empType = 'Intern';
  }

  const locations = job.jobGeo ? job.jobGeo.split(',').map(g => g.trim()) : [];

  return {
    guid: job.id ? `jobicy-${job.id}` : (job.url || `jobicy-${job.jobSlug}-${job.companyName}`),
    title: job.jobTitle || '',
    excerpt: job.jobExcerpt ? job.jobExcerpt.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : (job.jobDescription ? job.jobDescription.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : ''),
    description: job.jobDescription || '',
    companyName: job.companyName || '',
    companyLogo: job.companyLogo || '',
    companySlug: job.jobSlug || (job.companyName ? job.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-') : ''),
    employmentType: empType,
    seniority: job.jobLevel || 'Mid-level',
    minSalary: job.salaryMin || null,
    maxSalary: job.salaryMax || null,
    currency: job.salaryCurrency || 'USD',
    locationRestrictions: locations,
    timezoneRestrictions: [],
    pubDate: job.pubDate ? new Date(job.pubDate).getTime() : Date.now(),
    source: 'Jobicy',
    applicationLink: job.url || ''
  };
};

/**
 * Service to aggregate, normalize, filter, and prioritize India remote healthcare jobs.
 */
export const HimalayasService = {
  /**
   * Fetches, merges, and filters jobs from Himalayas, Remotive, and Arbeitnow concurrently
   */
  async getJobs(filters = {}) {
    const {
      q,
      country,
      worldwide,
      exclude_worldwide,
      seniority,
      employment_type,
      company,
      timezone,
      sort,
      page = 1,
      category
    } = filters;

    const himalayasBase = process.env.HIMALAYAS_API_BASE || 'https://himalayas.app/jobs/api';
    const remotiveUrl = process.env.REMOTIVE_API_BASE || 'https://remotive.com/api/remote-jobs';
    const arbeitnowUrl = process.env.ARBEITNOW_API_BASE || 'https://www.arbeitnow.com/api/job-board-api';
    const theMuseUrl = process.env.THE_MUSE_API_BASE || 'https://www.themuse.com/api/public/jobs';
    const jobicyUrl = process.env.JOBICY_API_BASE || 'https://jobicy.com/api/v2/remote-jobs';

    let unifiedJobs = [];

    // Load manual jobs from JSON
    const manualPath = path.join(process.cwd(), 'src/data/manualJobs.json');
    try {
      const fileData = await fs.readFile(manualPath, 'utf-8');
      const manualJobs = JSON.parse(fileData);
      if (Array.isArray(manualJobs)) {
        unifiedJobs = [...manualJobs];
        console.log(`[API Aggregator] Loaded ${manualJobs.length} manual jobs from LinkedIn/local JSON.`);
      }
    } catch (err) {
      console.log('[API Aggregator] No manual jobs found or failed to read manualJobs.json');
    }

    // 1. Concurrently fetch all five feeds using Promise.allSettled for maximum resilience
    const fetchResults = await Promise.allSettled([
      // Feed A: Himalayas (Browse increased to 250 limit to enrich pool)
      (async () => {
        let hJobs = [];
        if (q || country || company || seniority || employment_type || timezone || worldwide || exclude_worldwide) {
          const params = { page: 1 };
          if (q) params.q = q;
          if (company) params.company = company;
          if (seniority) params.seniority = seniority;
          if (employment_type) params.employment_type = employment_type;
          if (timezone) params.timezone = timezone;
          if (worldwide !== undefined) params.worldwide = worldwide;
          if (exclude_worldwide !== undefined) params.exclude_worldwide = exclude_worldwide;
          
          if (country) {
            const cleanC = country.toLowerCase().trim();
            if (cleanC === 'india' || cleanC === 'ind' || cleanC === 'in') {
              params.country = 'in';
            } else if (cleanC === 'united states' || cleanC === 'usa' || cleanC === 'us') {
              params.country = 'us';
            } else if (cleanC === 'united kingdom' || cleanC === 'uk' || cleanC === 'gb' || cleanC === 'england') {
              params.country = 'gb';
            } else if (cleanC === 'canada' || cleanC === 'ca') {
              params.country = 'ca';
            } else if (cleanC.length === 2) {
              params.country = cleanC;
            }
          }
          
          console.log(`[API Aggregator] Fetching Himalayas search...`);
          const res = await axios.get(`${himalayasBase}/search`, { params, timeout: 8000 });
          hJobs = res.data.jobs || [];
        } else {
          console.log(`[API Aggregator] Fetching Himalayas browse (limit 250)...`);
          const res = await axios.get(himalayasBase, { params: { limit: 250 }, timeout: 8000 });
          hJobs = res.data.jobs || [];
        }
        return hJobs.map(normalizeHimalayas);
      })(),

      // Feed B: Remotive (ALWAYS query dedicated medical-health channel to get rich clinical listings)
      (async () => {
        console.log(`[API Aggregator] Fetching Remotive medical-health channel...`);
        const params = { category: 'medical-health' };
        if (q) params.search = q;
        if (company) params.company_name = company;
        
        const res = await axios.get(remotiveUrl, { params, timeout: 8000 });
        const rJobs = res.data.jobs || [];
        return rJobs.map(normalizeRemotive);
      })(),

      // Feed C: Arbeitnow
      (async () => {
        console.log(`[API Aggregator] Fetching Arbeitnow feed...`);
        const res = await axios.get(arbeitnowUrl, { timeout: 8000 });
        const aJobs = res.data.data || [];
        return aJobs.map(normalizeArbeitnow);
      })(),

      // Feed D: The Muse (Dedicated public Healthcare board fetch)
      (async () => {
        console.log(`[API Aggregator] Fetching The Muse Healthcare board...`);
        const params = { category: 'Healthcare', page: 1 };
        const res = await axios.get(theMuseUrl, { params, timeout: 8000 });
        const museJobs = res.data.results || [];
        return museJobs.map(normalizeTheMuse);
      })(),

      // Feed E: Jobicy (Dedicated public Remote Healthcare fetch)
      (async () => {
        console.log(`[API Aggregator] Fetching Jobicy healthcare feed...`);
        const params = { industry: 'healthcare', count: 100 };
        if (q) params.tag = q;
        
        const res = await axios.get(jobicyUrl, { params, timeout: 8000 });
        const jJobs = res.data.jobs || [];
        return jJobs.map(normalizeJobicy);
      })()
    ]);

    // Merge only fulfilled promises to prevent rate-limiting or down-states from breaking the board
    fetchResults.forEach((result, idx) => {
      const sourceName = idx === 0 ? 'Himalayas' : idx === 1 ? 'Remotive' : idx === 2 ? 'Arbeitnow' : idx === 3 ? 'The Muse' : 'Jobicy';
      if (result.status === 'fulfilled') {
        console.log(`[API Aggregator] Successfully fetched ${result.value.length} items from ${sourceName}`);
        unifiedJobs = [...unifiedJobs, ...result.value];
      } else {
        console.error(`[API Aggregator] Feeds failed for ${sourceName}:`, result.reason.message);
      }
    });

    // 2. Apply Custom Healthcare Semantic Filters across all merged feeds
    let filteredJobs = unifiedJobs.filter(job => isHealthcareJob(job, category));
    console.log(`[API Filter] Semantically filtered ${unifiedJobs.length} raw aggregated jobs down to ${filteredJobs.length} matching "${category || 'All Health'}" positions.`);
    
    // Diagnostic logging for semantic matches
    filteredJobs.forEach(job => {
      console.log(`[API Filter Match] "${job.title}" | Company: "${job.companyName}" | Locations: ${JSON.stringify(job.locationRestrictions)} | Source: "${job.source}"`);
    });

    // 3. Local filtering for country / query / company overrides from other sources
    if (country) {
      const cQuery = country.toLowerCase();
      // If filtering specifically for India, prioritize matching India or Worldwide
      if (cQuery.includes('india') || cQuery === 'in' || cQuery === 'ind') {
        filteredJobs = filteredJobs.filter(job => {
          const locations = (job.locationRestrictions || []).map(l => l.toLowerCase());
          return locations.some(l => 
            l.includes('india') || 
            l === 'in' || 
            l === 'ind' || 
            l === 'apac' || 
            l.includes('apac') || 
            l.includes('worldwide') || 
            l.includes('anywhere') || 
            l.includes('global') ||
            l === 'remote' ||
            l === 'remote ok'
          ) || locations.length === 0;
        });
      } else {
        filteredJobs = filteredJobs.filter(job => {
          const locations = (job.locationRestrictions || []).map(l => l.toLowerCase());
          return locations.some(l => l.includes(cQuery));
        });
      }
    }

    if (q && !filters.searchHandledExternally) {
      const txt = q.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        (job.title || '').toLowerCase().includes(txt) || 
        (job.description || '').toLowerCase().includes(txt) ||
        (job.companyName || '').toLowerCase().includes(txt)
      );
    }

    if (company) {
      const comp = company.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        (job.companySlug || '').toLowerCase() === comp || 
        (job.companyName || '').toLowerCase().includes(comp)
      );
    }

    // Local filtering for seniority checkboxes across aggregated sources
    if (seniority) {
      const activeSeniorities = seniority.toLowerCase().split(',');
      filteredJobs = filteredJobs.filter(job => 
        job.seniority && activeSeniorities.includes(getNormalizedSeniority(job.seniority))
      );
    }

    // Local filtering for employment style checkboxes across aggregated sources
    if (employment_type) {
      const activeTypes = employment_type.toLowerCase().split(',');
      filteredJobs = filteredJobs.filter(job => 
        job.employmentType && activeTypes.includes(getNormalizedEmploymentType(job.employmentType))
      );
    }

    // Local filtering for worldwide-only toggle across aggregated sources
    if (worldwide === true) {
      filteredJobs = filteredJobs.filter(job => {
        const locations = (job.locationRestrictions || []).map(l => l.toLowerCase());
        return locations.some(l => l.includes('worldwide') || l.includes('anywhere') || l.includes('global') || l.includes('remote ok')) || locations.length === 0;
      });
    }

    // Local filtering for exclude-worldwide toggle across aggregated sources
    if (exclude_worldwide === true) {
      filteredJobs = filteredJobs.filter(job => {
        const locations = (job.locationRestrictions || []).map(l => l.toLowerCase());
        return !locations.some(l => l.includes('worldwide') || l.includes('anywhere') || l.includes('global') || l.includes('remote ok')) && locations.length > 0;
      });
    }

    // 4. Update the Unified Cache map for deep details retrieval
    filteredJobs.forEach(job => {
      if (job.guid) {
        jobCache.set(job.guid, job);
      }
    });

    // 5. India Focus Prioritization & Custom Sorting
    // India-specific / Worldwide remote jobs are prioritized to the very top by default!
    filteredJobs = this.sortJobsWithIndiaPriority(filteredJobs, sort || 'relevant');
    console.log(`[API Filter] Final: After applying country ("${country || 'any'}"), worldwide (${worldwide || 'any'}), seniority ("${seniority || 'any'}"), returning ${filteredJobs.length} matching jobs.`);

    // 6. Pagination Calculations
    const limitPerPage = 10;
    const totalFilteredCount = filteredJobs.length;
    const startIndex = (page - 1) * limitPerPage;
    const paginatedJobs = filteredJobs.slice(startIndex, startIndex + limitPerPage);

    return {
      jobs: paginatedJobs,
      totalCount: totalFilteredCount,
      page: parseInt(page),
      totalPages: Math.ceil(totalFilteredCount / limitPerPage)
    };
  },

  /**
   * Retrieves single job details from Cache
   */
  async getJobByGuid(guid) {
    if (!guid) throw new Error('Job GUID is required');

    // Check Cache first (highly likely to match since list loads first)
    if (jobCache.has(guid)) {
      console.log(`[API Cache] Hit for job GUID: ${guid}`);
      return jobCache.get(guid);
    }

    console.log(`[API Cache] Miss for job GUID: ${guid}. Rebuilding pool...`);
    // Re-fetch to pop cache
    await this.getJobs();
    
    if (jobCache.has(guid)) {
      return jobCache.get(guid);
    }

    throw new Error('Listing details not found or expired.');
  },

  /**
   * Custom local sorting prioritizing India / Worldwide remote listings
   */
  sortJobsWithIndiaPriority(jobs, sortBy) {
    return [...jobs].sort((a, b) => {
      // Step A: Rank by India / Worldwide relevance score (Score 3 = India, Score 2 = Worldwide, Score 1 = Other)
      const scoreA = getIndiaRelevanceScore(a);
      const scoreB = getIndiaRelevanceScore(b);

      if (scoreA !== scoreB) {
        return scoreB - scoreA; // Prioritize highest scores to the top
      }

      // Step B: Within identical scores, execute requested filter sorts
      switch (sortBy) {
        case 'recent':
          return (b.pubDate || 0) - (a.pubDate || 0);
        case 'salaryAsc':
          const minA = a.minSalary || 0;
          const minB = b.minSalary || 0;
          return minA - minB;
        case 'salaryDesc':
          const maxA = a.maxSalary || 0;
          const maxB = b.maxSalary || 0;
          return maxB - maxA;
        case 'nameAToZ':
          return (a.companyName || '').localeCompare(b.companyName || '');
        case 'nameZToA':
          return (b.companyName || '').localeCompare(a.companyName || '');
        case 'jobs':
          return (a.title || '').localeCompare(b.title || '');
        case 'relevant':
        default:
          return (b.pubDate || 0) - (a.pubDate || 0); // fallback to date recent inside same score
      }
    });
  }
};
