import { Router } from 'express';
import { JobsController } from '../app/controllers/jobs_controller.js';
import { ApplicationsController } from '../app/controllers/applications_controller.js';
import { N8nWebhooksController } from '../app/controllers/n8n_webhooks_controller.js';
import { HimalayasService } from '../app/services/himalayas_service.js';

export const router = Router();

// Health Check
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'healthcare-job-portal-adonis',
    timestamp: new Date().toISOString(),
    engine: 'AdonisJS v6 Core + TypeScript'
  });
});

// Job Endpoints
router.get('/api/v1/jobs', JobsController.index);
router.get('/api/v1/jobs/:guid', JobsController.show);
router.post('/api/v1/jobs', JobsController.store);

// Application Submission
router.post('/api/v1/applications', ApplicationsController.store);

// Inbound n8n Webhook
router.post('/api/v1/n8n/webhook-receive', N8nWebhooksController.handleInbound);

// Metrics & Analytics
router.get('/api/v1/metrics', async (_req, res) => {
  try {
    const jobs = await HimalayasService.getAllHealthcareJobs();
    const categories = Array.from(new Set(jobs.map(j => j.category)));
    const remoteCount = jobs.filter(j => j.workplaceType === 'Remote').length;
    res.status(200).json({
      success: true,
      totalJobs: jobs.length,
      remoteJobs: remoteCount,
      categoriesCount: categories.length,
      categories
    });
  } catch (e: unknown) {
    res.status(500).json({ success: false, error: 'Failed to compute metrics' });
  }
});
