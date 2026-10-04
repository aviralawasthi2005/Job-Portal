export type JobType =
  | 'Full-time'
  | 'Part-time'
  | 'Contract'
  | 'Per Diem'
  | 'Locum Tenens'
  | 'Internship';

export type WorkLocationType = 'Remote' | 'On-site' | 'Hybrid';

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  period: 'yearly' | 'monthly' | 'hourly';
}

export interface Job {
  guid: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  companyWebsite?: string;
  category: string;
  type: string;
  workplaceType: WorkLocationType;
  location: string;
  salary?: SalaryRange;
  salaryString?: string;
  description: string;
  requirements?: string[];
  benefits?: string[];
  skills?: string[];
  credentials?: string[];
  applicationUrl?: string;
  source: 'himalayas' | 'manual' | 'n8n_sync';
  publishedAt: string;
  featured?: boolean;
  urgent?: boolean;
}

export interface JobFilterParams {
  search?: string;
  location?: string;
  category?: string;
  workplaceType?: string;
  type?: string;
  minSalary?: number;
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
  jobGuid: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  coverLetter?: string;
  resumeUrl?: string;
  clinicalLicenseNumber?: string;
  yearsOfExperience?: number;
}

export interface TrackedApplication {
  id: string;
  jobGuid: string;
  jobTitle: string;
  companyName: string;
  location: string;
  clinicalLicense?: string;
  status: 'applied' | 'under_review' | 'shortlisted' | 'interview' | 'offer';
  appliedAt: string;
}
