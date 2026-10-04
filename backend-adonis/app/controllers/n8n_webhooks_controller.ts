import type { Request, Response } from 'express';
import { HimalayasService } from '../services/himalayas_service.js';

export class N8nWebhooksController {
  /**
   * POST /api/v1/n8n/webhook-receive
   * Inbound webhook receiver from n8n automations
   */
  public static async handleInbound(req: Request, res: Response): Promise<void> {
    try {
      const { event, data } = req.body || {};
      console.log(`[n8n Webhook Inbound] Received event: ${event}`);

      switch (event) {
        case 'cache.flush':
          // Force reload Himalayas cache
          await HimalayasService.getAllHealthcareJobs();
          res.status(200).json({ success: true, message: 'Cache reloaded by n8n workflow' });
          return;

        case 'candidate.status_update':
          console.log(`[n8n Webhook Inbound] Candidate status update:`, data);
          res.status(200).json({ success: true, message: 'Status recorded' });
          return;

        default:
          res.status(200).json({
            success: true,
            received: true,
            event: event || 'unspecified'
          });
          return;
      }
    } catch (err: unknown) {
      console.error('[n8n Webhooks Controller] Error handling inbound webhook:', err);
      res.status(500).json({ success: false, error: 'Internal processing error' });
    }
  }
}
