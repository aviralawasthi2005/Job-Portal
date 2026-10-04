import type { Request, Response } from 'express';
import crypto from 'crypto';
import { ApplicationValidator } from '../validators/application_validator.js';
import { N8nDispatcherService } from '../services/n8n_dispatcher_service.js';
import { HimalayasService } from '../services/himalayas_service.js';
import type { CandidateApplication } from '../../../shared/types/job.js';

export class ApplicationsController {
  /**
   * POST /api/v1/applications
   * Candidate submits job application
   */
  public static async store(req: Request, res: Response): Promise<void> {
    try {
      const validation = ApplicationValidator.validateApplication(req.body);

      if (!validation.valid || !validation.data) {
        res.status(422).json({
          success: false,
          message: 'Invalid application submission',
          errors: validation.errors
        });
        return;
      }

      const p = validation.data;
      const allJobs = await HimalayasService.getAllHealthcareJobs();
      const job = allJobs.find(j => j.guid === p.jobGuid);

      const application: CandidateApplication = {
        id: crypto.randomUUID(),
        jobGuid: p.jobGuid!,
        candidateName: p.candidateName!,
        candidateEmail: p.candidateEmail!,
        candidatePhone: p.candidatePhone,
        coverLetter: p.coverLetter,
        resumeUrl: p.resumeUrl,
        linkedInUrl: p.linkedInUrl,
        yearsOfExperience: p.yearsOfExperience,
        clinicalLicenseNumber: p.clinicalLicenseNumber,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      };

      const jobTitle = job ? job.title : 'Healthcare Position';
      const companyName = job ? job.companyName : 'Healthcare Employer';

      // Asynchronously trigger n8n applicant intake pipeline
      N8nDispatcherService.dispatchApplication(application, jobTitle, companyName).catch(err => {
        console.warn('[ApplicationsController] n8n dispatch caught:', err);
      });

      res.status(201).json({
        success: true,
        message: 'Your application has been received and candidate automation pipeline triggered.',
        data: {
          applicationId: application.id,
          jobTitle,
          companyName,
          status: 'pending',
          submittedAt: application.submittedAt
        }
      });
    } catch (error: unknown) {
      console.error('[ApplicationsController] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process application',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}
