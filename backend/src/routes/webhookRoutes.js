import { Router } from 'express';
import { HimalayasService } from '../services/himalayasService.js';

const router = Router();

/**
 * POST /api/v1/n8n/webhook-receive or /api/n8n/webhook-receive
 * Inbound webhook callback for n8n automations
 */
router.post('/webhook-receive', async (req, res) => {
  try {
    const { event, data } = req.body || {};
    console.log(`[n8n Webhook Inbound] Received event: ${event}`, data || '');

    switch (event) {
      case 'cache.flush':
        // Force refresh Himalayas jobs cache
        await HimalayasService.fetchJobs();
        return res.status(200).json({
          success: true,
          message: 'Himalayas cache successfully refreshed by n8n workflow',
          timestamp: new Date().toISOString()
        });

      case 'candidate.status_update':
      case 'job.alert':
        return res.status(200).json({
          success: true,
          message: `Event "${event}" processed`,
          timestamp: new Date().toISOString()
        });

      default:
        return res.status(200).json({
          success: true,
          received: true,
          event: event || 'general'
        });
    }
  } catch (error) {
    console.error('[n8n Inbound Webhook Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process n8n webhook',
      error: error.message
    });
  }
});

export default router;
