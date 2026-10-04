import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Env } from '../../start/env.js';
import type { Job, JobFilterParams, PaginatedJobResponse } from '../../../shared/types/job.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CachedData {
  jobs: Job[];
  timestamp: number;
}

// Strict Healthcare Taxonomy
const HEALTHCARE_TAXONOMY: Record<string, string[]> = {
  'Nursing': [
    'nurse', 'nursing', 'registered nurse', 'rn', 'bsn', 'msn', 'lpn', 'lvn',
    'nurse practitioner', 'np', 'aprn', 'crna', 'charge nurse', 'triage nurse', 'icu nurse'
  ],
  'Physicians & Surgeons': [
    'physician', 'doctor', 'surgeon', 'hospitalist', 'cardiologist', 'dermatologist',
    'oncologist', 'pediatrician', 'neurologist', 'psychiatrist', 'anesthesiologist',
    'pathologist', 'radiologist', 'general practitioner', 'primary care', 'medical director', 'cmo'
  ],
  'Telehealth & Digital Health': [
    'telehealth', 'telemedicine', 'virtual care', 'remote patient monitoring', 'virtual clinic'
  ],
  'Pharmacy': [
    'pharmacist', 'pharmacy', 'pharmd', 'rph', 'pharmacy technician', 'clinical pharmacist'
  ],
  'Mental & Behavioral Health': [
    'mental health', 'behavioral health', 'therapist', 'psychologist', 'licensed counselor',
    'lcsw', 'lmft', 'lpc', 'addiction counselor'
  ],
  'Health Informatics & IT': [
    'health informatics', 'medical coding', 'medical coder', 'clinical documentation',
    'cdi specialist', 'rhia', 'rhit', 'cpc', 'ccs', 'ehr specialist', 'fhir',
    'epic analyst', 'cerner analyst', 'healthcare data analyst', 'clinical data manager',
    'inpatient coder', 'outpatient coder', 'pro fee coder', 'utilization review'
  ],
  'Clinical Research': [
    'clinical research', 'clinical trial', 'cra', 'crc', 'clinical trial coordinator',
    'biostatistician', 'regulatory affairs', 'pharmacovigilance', 'biomedical scientist'
  ],
  'Allied Health': [
    'medical assistant', 'cna', 'phlebotomist', 'laboratory technician', 'medical technologist',
    'ultrasound technician', 'sonographer', 'radiology technician', 'physical therapist',
    'physiotherapist', 'occupational therapist', 'dental hygienist', 'dentist'
  ]
};

// Strict non-healthcare titles to discard immediately
const NON_HEALTHCARE_PATTERNS = [
  /\bsoftware engineer\b/i,
  /\bfull[\s\-]stack\b/i,
  /\bfrontend developer\b/i,
  /\bbackend developer\b/i,
  /\bdevops\b/i,
  /\bplatform engineer\b/i,
  /\baccountant\b/i,
  /\baccounting\b/i,
  /\bbookkeeper\b/i,
  /\bfinancial analyst\b/i,
  /\bsales executive\b/i,
  /\baccount executive\b/i,
  /\bsdr\b/i,
  /\bbdr\b/i,
  /\bcopywriter\b/i,
  /\bvideo editor\b/i,
  /\bgraphic designer\b/i,
  /\bmarketing manager\b/i,
  /\bseo specialist\b/i,
  /\brecruiter\b/i,
  /\bproduct manager\b/i,
  /\bproduct designer\b/i
];

const CLINICAL_OVERRIDES = ['clinical', 'healthcare', 'medical', 'hospital', 'telehealth', 'ehr', 'bioinformatics'];

export class HimalayasService {
  private static cache: CachedData | null = null;
  private static readonly CACHE_TTL_MS = Env.CACHE_TTL_SECONDS * 1000;

  /**
   * Load local fallback manual jobs
   */
  public static getLocalManualJobs(): Job[] {
    try {
      const candidates = [
        path.resolve(__dirname, '../../../backend/src/data/manualJobs.json'),
        path.resolve(process.cwd(), 'backend/src/data/manualJobs.json'),
        path.resolve(process.cwd(), 'src/data/manualJobs.json')
      ];

      for (const p of candidates) {
        if (fs.existsSync(p)) {
          const raw = fs.readFileSync(p, 'utf-8');
          const parsed = JSON.parse(raw);
          const rawJobs = parsed.jobs || parsed || [];
          return rawJobs
            .filter((j: any) => this.isStrictHealthcare(j))
            .map((j: any) => ({
              ...j,
              source: 'manual',
              publishedAt: j.publishedAt || new Date().toISOString()
            }));
        }
      }
    } catch (e) {
      console.warn('[HimalayasService] Could not read local manualJobs.json fallback:', e);
    }
    return [];
  }

  /**
   * Strict validation: Only accept authentic healthcare roles
   */
  public static isStrictHealthcare(item: any): { valid: boolean; category?: string } {
    const title = (item.title || '').trim();
    const titleLower = title.toLowerCase();
    const categoriesStr = ((item.categories || []).join(' ') + ' ' + (item.category || '')).toLowerCase().replace(/-/g, ' ');

    // 1. Exclude blatant non-healthcare titles unless clinical override exists
    for (const pat of NON_HEALTHCARE_PATTERNS) {
      if (pat.test(titleLower)) {
        const hasOverride = CLINICAL_OVERRIDES.some(o => titleLower.includes(o) || categoriesStr.includes(o));
        if (!hasOverride) {
          return { valid: false };
        }
      }
    }

    // 2. Check structured categories first
    for (const [catName, keywords] of Object.entries(HEALTHCARE_TAXONOMY)) {
      for (const kw of keywords) {
        const regex = kw.length <= 4 ? new RegExp(`\\b${kw}\\b`, 'i') : new RegExp(kw, 'i');
        if (regex.test(categoriesStr)) {
          return { valid: true, category: catName };
        }
      }
    }

    // 3. Check job title
    for (const [catName, keywords] of Object.entries(HEALTHCARE_TAXONOMY)) {
      for (const kw of keywords) {
        const regex = kw.length <= 4 ? new RegExp(`\\b${kw}\\b`, 'i') : new RegExp(kw, 'i');
        if (regex.test(titleLower)) {
          return { valid: true, category: catName };
        }
      }
    }

    return { valid: false };
  }

  /**
   * Fetch all aggregated jobs with cache
   */
  public static async getAllHealthcareJobs(): Promise<Job[]> {
    const now = Date.now();
    if (this.cache && (now - this.cache.timestamp) < this.CACHE_TTL_MS) {
      return this.cache.jobs;
    }

    const localJobs = this.getLocalManualJobs();
    let remoteJobs: Job[] = [];

    try {
      const response = await axios.get(Env.HIMALAYAS_API_URL, {
        params: { limit: 150 },
        timeout: 7000
      });

      const items = response.data?.jobs || response.data || [];
      if (Array.isArray(items)) {
        for (const item of items) {
          const check = this.isStrictHealthcare(item);
          if (!check.valid || !check.category) {
            continue; // Skip all non-healthcare noise
          }

          const minSal = item.minSalary || item.salaryMin;
          const maxSal = item.maxSalary || item.salaryMax;
          const cur = item.salaryCurrency || 'USD';
          let salaryString: string | undefined = undefined;
          if (minSal && maxSal) {
            salaryString = `$${Number(minSal).toLocaleString()} - $${Number(maxSal).toLocaleString()} / yr`;
          } else if (minSal) {
            salaryString = `From $${Number(minSal).toLocaleString()} / yr`;
          }

          remoteJobs.push({
            guid: item.guid || `him-${item.id || Math.random().toString(36).substring(7)}`,
            title: item.title,
            companyName: item.companyName || 'Healthcare Provider',
            companyLogo: item.companyLogo || item.logo,
            companyWebsite: item.companyWebsite,
            category: check.category,
            type: item.employmentType || (item.isFullTime ? 'Full-time' : 'Contract'),
            workplaceType: 'Remote',
            location: item.location || 'Remote',
            salary: (minSal || maxSal) ? {
              min: Number(minSal || 0),
              max: Number(maxSal || minSal || 0),
              currency: cur,
              period: 'yearly'
            } : undefined,
            salaryString,
            description: item.description || item.excerpt || 'Clinical position providing medical or telehealth care.',
            requirements: item.requirements || [
              'Valid clinical licensure or professional healthcare certification',
              'Experience in patient care, clinical workflows, or HIPAA guidelines'
            ],
            benefits: item.benefits || ['Comprehensive Medical Coverage', 'Flexible Schedule', 'CME Allowance'],
            skills: item.skills || [check.category, 'Patient Care'],
            applicationUrl: item.applicationUrl || item.url,
            source: 'himalayas',
            publishedAt: item.pubDate || item.publishedAt || new Date().toISOString(),
            featured: item.featured || false
          });
        }
      }
    } catch (err: unknown) {
      console.warn('[HimalayasService] Could not reach external Himalayas API, using local fallback:', err instanceof Error ? err.message : err);
    }

    // Deduplicate
    const seen = new Set<string>();
    const combined: Job[] = [];

    for (const job of [...localJobs, ...remoteJobs]) {
      const key = `${job.title.toLowerCase().trim()}::${job.companyName.toLowerCase().trim()}`;
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(job);
      }
    }

    this.cache = {
      jobs: combined,
      timestamp: now
    };

    return combined;
  }

  /**
   * Filter and paginate jobs
   */
  public static async queryJobs(filters: JobFilterParams): Promise<PaginatedJobResponse> {
    const allJobs = await this.getAllHealthcareJobs();

    let filtered = allJobs;

    // Search text
    if (filters.search) {
      const query = filters.search.toLowerCase().trim();
      filtered = filtered.filter(j =>
        j.title.toLowerCase().includes(query) ||
        j.companyName.toLowerCase().includes(query) ||
        (j.category && j.category.toLowerCase().includes(query)) ||
        (j.skills && j.skills.some(s => s.toLowerCase().includes(query)))
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'All') {
      filtered = filtered.filter(j => j.category.toLowerCase() === filters.category!.toLowerCase());
    }

    // Workplace type filter
    if (filters.workplaceType && filters.workplaceType !== 'All') {
      filtered = filtered.filter(j => j.workplaceType.toLowerCase() === filters.workplaceType!.toLowerCase());
    }

    // Employment type
    if (filters.type && filters.type !== 'All') {
      filtered = filtered.filter(j => j.type.toLowerCase().includes(filters.type!.toLowerCase()));
    }

    // Min Salary
    if (filters.minSalary && filters.minSalary > 0) {
      filtered = filtered.filter(j => (j.salary?.min || 0) >= filters.minSalary! || (j.salary?.max || 0) >= filters.minSalary!);
    }

    // Sort
    if (filters.sort === 'salary_high') {
      filtered.sort((a, b) => (b.salary?.max || 0) - (a.salary?.max || 0));
    } else {
      filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }

    const page = Math.max(1, Number(filters.page || 1));
    const limit = Math.max(1, Math.min(100, Number(filters.limit || 12)));
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      metrics: {
        totalRemoteJobs: filtered.filter(j => j.workplaceType === 'Remote').length,
        categoriesAvailable: Array.from(new Set(allJobs.map(j => j.category))),
        fetchedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Save manual job
   */
  public static async saveManualJob(job: Job): Promise<void> {
    try {
      const p = path.resolve(__dirname, '../../../backend/src/data/manualJobs.json');
      let currentJobs: Job[] = [];
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf-8');
        const parsed = JSON.parse(raw);
        currentJobs = parsed.jobs || parsed || [];
      }
      currentJobs.unshift(job);
      fs.writeFileSync(p, JSON.stringify({ jobs: currentJobs }, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[HimalayasService] Could not persist manual job to file:', e);
    }
    this.cache = null;
  }
}
