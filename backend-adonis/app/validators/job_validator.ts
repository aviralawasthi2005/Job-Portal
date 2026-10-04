import type { ManualJobPayload } from '../../../shared/types/job.js';

export class JobValidator {
  public static validateManualJob(payload: unknown): { valid: boolean; errors: string[]; data?: ManualJobPayload } {
    const errors: string[] = [];
    const data = payload as Partial<ManualJobPayload>;

    if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 3) {
      errors.push('Job title is required and must be at least 3 characters.');
    }

    if (!data.companyName || typeof data.companyName !== 'string' || data.companyName.trim().length < 2) {
      errors.push('Company name is required.');
    }

    if (!data.category || typeof data.category !== 'string') {
      errors.push('Category is required (e.g. Nursing, Telehealth, Pharmacy).');
    }

    if (!data.description || typeof data.description !== 'string' || data.description.trim().length < 20) {
      errors.push('Job description must be at least 20 characters.');
    }

    if (!data.applicationEmailOrUrl || typeof data.applicationEmailOrUrl !== 'string') {
      errors.push('Application email or URL is required.');
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return {
      valid: true,
      errors: [],
      data: {
        title: data.title!.trim(),
        companyName: data.companyName!.trim(),
        category: data.category!.trim(),
        type: data.type || 'Full-time',
        workplaceType: data.workplaceType || 'Remote',
        location: data.location || 'Remote',
        salaryMin: data.salaryMin ? Number(data.salaryMin) : undefined,
        salaryMax: data.salaryMax ? Number(data.salaryMax) : undefined,
        salaryCurrency: data.salaryCurrency || 'USD',
        description: data.description!.trim(),
        requirements: Array.isArray(data.requirements) ? data.requirements : [],
        benefits: Array.isArray(data.benefits) ? data.benefits : [],
        skills: Array.isArray(data.skills) ? data.skills : [],
        applicationEmailOrUrl: data.applicationEmailOrUrl!.trim(),
        contactEmail: data.contactEmail?.trim() || ''
      }
    };
  }
}
