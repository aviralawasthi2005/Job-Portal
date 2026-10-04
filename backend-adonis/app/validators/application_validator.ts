import type { CandidateApplication } from '../../../shared/types/job.js';

export class ApplicationValidator {
  public static validateApplication(payload: unknown): { valid: boolean; errors: string[]; data?: Partial<CandidateApplication> } {
    const errors: string[] = [];
    const data = payload as Partial<CandidateApplication>;

    if (!data.jobGuid || typeof data.jobGuid !== 'string') {
      errors.push('Valid jobGuid reference is required.');
    }

    if (!data.candidateName || typeof data.candidateName !== 'string' || data.candidateName.trim().length < 2) {
      errors.push('Candidate name is required.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.candidateEmail || !emailRegex.test(data.candidateEmail)) {
      errors.push('A valid candidate email address is required.');
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return {
      valid: true,
      errors: [],
      data: {
        jobGuid: data.jobGuid!.trim(),
        candidateName: data.candidateName!.trim(),
        candidateEmail: data.candidateEmail!.trim().toLowerCase(),
        candidatePhone: data.candidatePhone?.trim(),
        coverLetter: data.coverLetter?.trim(),
        resumeUrl: data.resumeUrl?.trim(),
        linkedInUrl: data.linkedInUrl?.trim(),
        yearsOfExperience: data.yearsOfExperience ? Number(data.yearsOfExperience) : undefined,
        clinicalLicenseNumber: data.clinicalLicenseNumber?.trim(),
        submittedAt: new Date().toISOString(),
        status: 'pending'
      }
    };
  }
}
