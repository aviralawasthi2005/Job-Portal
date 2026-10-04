import type { Request, Response } from 'express';
import crypto from 'crypto';
import { HimalayasService } from '../services/himalayas_service.js';
import { N8nDispatcherService } from '../services/n8n_dispatcher_service.js';
import { JobValidator } from '../validators/job_validator.js';
import type { Job } from '../../../shared/types/job.js';

export class JobsController {
  /**
   * GET /api/v1/jobs
   * Return paginated, filtered healthcare jobs
   */
  public static async index(req: Request, res: Response): Promise<void> {
    try {
      const { search, category, workplaceType, type, minSalary, page, limit, sort } = req.query;

      const result = await HimalayasService.queryJobs({
        search: search ? String(search) : undefined,
        category: category ? String(category) : undefined,
        workplaceType: workplaceType ? String(workplaceType) : undefined,
        type: type ? String(type) : undefined,
        minSalary: minSalary ? Number(minSalary) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 12,
        sort: (sort as any) || 'newest'
      });

      res.status(200).json(result);
    } catch (error: unknown) {
      console.error('[JobsController] Error fetching jobs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve jobs',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * GET /api/v1/jobs/:guid
   * Return single job detail
   */
  public static async show(req: Request, res: Response): Promise<void> {
    try {
      const { guid } = req.params;
      const allJobs = await HimalayasService.getAllHealthcareJobs();
      const job = allJobs.find(j => j.guid === guid);

      if (!job) {
        res.status(404).json({
          success: false,
          message: `Job with guid "${guid}" not found`
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: job
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        message: 'Error fetching job details',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * POST /api/v1/jobs
   * Recruiter posts a new healthcare job
   * Triggers n8n webhook notification
   */
  public static async store(req: Request, res: Response): Promise<void> {
    try {
      const validation = JobValidator.validateManualJob(req.body);

      if (!validation.valid || !validation.data) {
        res.status(422).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
        return;
      }

      const p = validation.data;
      const guid = `hc-${crypto.randomUUID()}`;

      let salaryString: string | undefined = undefined;
      if (p.salaryMin && p.salaryMax) {
        salaryString = `$${p.salaryMin.toLocaleString()} - $${p.salaryMax.toLocaleString()} / yr`;
      } else if (p.salaryMin) {
        salaryString = `From $${p.salaryMin.toLocaleString()} / yr`;
      }

      const newJob: Job = {
        guid,
        title: p.title,
        companyName: p.companyName,
        category: p.category,
        type: p.type,
        workplaceType: p.workplaceType,
        location: p.location,
        salary: (p.salaryMin || p.salaryMax) ? {
          min: p.salaryMin || 0,
          max: p.salaryMax || p.salaryMin || 0,
          currency: p.salaryCurrency || 'USD',
          period: 'yearly'
        } : undefined,
        salaryString,
        description: p.description,
        requirements: p.requirements,
        benefits: p.benefits,
        skills: p.skills,
        applicationUrl: p.applicationEmailOrUrl.startsWith('http')
          ? p.applicationEmailOrUrl
          : `mailto:${p.applicationEmailOrUrl}`,
        source: 'manual',
        publishedAt: new Date().toISOString(),
        featured: true
      };

      // Persist to store
      await HimalayasService.saveManualJob(newJob);

      // Async trigger n8n event
      N8nDispatcherService.dispatchNewJob(newJob).catch(err => {
        console.warn('[JobsController] n8n dispatch caught:', err);
      });

      res.status(201).json({
        success: true,
        message: 'Healthcare job posted successfully and automation broadcast dispatched',
        data: newJob
      });
    } catch (error: unknown) {
      console.error('[JobsController] Error creating job:', error);
      res.status(500).json({
        success: false,
        message: 'Internal error while posting job',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}
