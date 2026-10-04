/**
 * Healthcare Job Portal - Shared Core TypeScript Interfaces
 * Shared across AdonisJS backend, SvelteJS client, Express proxy, and n8n webhooks.
 */

export type JobType =
  | 'Full-time'
  | 'Part-time'
  | 'Contract'
  | 'Per Diem'
  | 'Locum Tenens'
  | 'Internship';

export type ExperienceLevel =
  | 'Entry Level'
  | 'Mid Level'
  | 'Senior'
  | 'Director'
  | 'Executive';

export type WorkLocationType = 'Remote' | 'On-site' | 'Hybrid';

export type HealthcareCategory =
  | 'Nursing'
  | 'Physicians & Surgeons'
  | 'Telehealth & Digital Health'
  | 'Health Informatics & IT'
  | 'Pharmacy'
  | 'Mental & Behavioral Health'
  | 'Clinical Research'
  | 'Healthcare Administration'
  | 'Allied Health'
  | 'Medical Devices & Biotech';

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  period: 'yearly' | 'monthly' | 'hourly';
}

export interface Company {
  name: string;
  logo?: string;
  website?: string;
  location?: string;
  verified?: boolean;
}

export interface Job {
  guid: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  companyWebsite?: string;
  category: HealthcareCategory | string;
  type: JobType | string;
  workplaceType: WorkLocationType;
  location: string;
  salary?: SalaryRange;
  salaryString?: string;
  description: string;
  requirements?: string[];
  benefits?: string[];
  skills?: string[];
  applicationUrl?: string;
  source: 'himalayas' | 'manual' | 'n8n_sync';
  publishedAt: string;
  expiresAt?: string;
  featured?: boolean;
  urgent?: boolean;
}

export interface JobFilterParams {
  search?: string;
  category?: string;
  type?: string;
  workplaceType?: string;
  location?: string;
  minSalary?: number;
  source?: 'all' | 'himalayas' | 'manual';
  page?: number;
  limit?: number;
  sort?: 'newest' | 'salary_high' | 'featured';
}

export interface PaginatedJobResponse {
  success: boolean;
  data: Job[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  metrics?: {
    totalRemoteJobs: number;
    categoriesAvailable: string[];
    fetchedAt: string;
  };
}

export interface CandidateApplication {
  id?: string;
  jobGuid: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  coverLetter?: string;
  resumeUrl?: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
  yearsOfExperience?: number;
  clinicalLicenseNumber?: string;
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'interviewing' | 'rejected' | 'accepted';
}

export interface ManualJobPayload {
  title: string;
  companyName: string;
  category: HealthcareCategory | string;
  type: JobType | string;
  workplaceType: WorkLocationType;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  description: string;
  requirements?: string[];
  benefits?: string[];
  skills?: string[];
  applicationEmailOrUrl: string;
  contactEmail: string;
}

/**
 * n8n Webhook Payloads for Event-Driven Automations
 */
export interface N8nNewJobWebhookPayload {
  event: 'job.created' | 'job.updated';
  timestamp: string;
  job: Job;
  source: 'portal_api' | 'himalayas_sync';
}

export interface N8nApplicationWebhookPayload {
  event: 'application.submitted';
  timestamp: string;
  application: CandidateApplication;
  jobTitle: string;
  companyName: string;
}

export interface N8nJobDigestRequest {
  frequency: 'daily' | 'weekly';
  subscriberEmail?: string;
  categoryFilter?: string;
  remoteOnly?: boolean;
}
