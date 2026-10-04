import axios from 'axios';
import { Env } from '../../start/env.js';
import type { Job, CandidateApplication, N8nNewJobWebhookPayload, N8nApplicationWebhookPayload } from '../../../shared/types/job.js';

export class N8nDispatcherService {
  /**
   * Helper to dispatch to both production and test webhook URLs
   */
  private static async postWithFallback(primaryUrl: string, payload: any): Promise<boolean> {
    const testUrl = primaryUrl.replace('/webhook/', '/webhook-test/');
    
    // 1. Try primary (Active workflow)
    try {
      await axios.post(primaryUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': Env.N8N_WEBHOOK_SECRET
        },
        timeout: 3000
      });
      console.log(`[n8n Dispatcher] Delivered to active webhook: ${primaryUrl}`);
      return true;
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Workflow may be in test mode in n8n UI
        try {
          await axios.post(testUrl, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 3000
          });
          console.log(`[n8n Dispatcher] Delivered to test webhook: ${testUrl}`);
          return true;
        } catch {
          console.warn(`[n8n Dispatcher] Webhook not registered in n8n yet. Make sure the workflow is imported and Active in n8n.`);
          return false;
        }
      }
      
      if (err.code === 'ECONNREFUSED') {
        console.warn(`[n8n Dispatcher] n8n service is offline on ${primaryUrl}. Start it with 'npm run dev:n8n' or start Docker.`);
        return false;
      }

      console.warn(`[n8n Dispatcher] Webhook notification skipped: ${err.message}`);
      return false;
    }
  }

  /**
   * Dispatch a webhook event to n8n when a new job is created
   */
  public static async dispatchNewJob(job: Job): Promise<boolean> {
    const payload: N8nNewJobWebhookPayload = {
      event: 'job.created',
      timestamp: new Date().toISOString(),
      job,
      source: 'portal_api'
    };

    console.log(`[n8n Dispatcher] Triggering new job broadcast for "${job.title}"...`);
    return await this.postWithFallback(Env.N8N_WEBHOOK_NEW_JOB, payload);
  }

  /**
   * Dispatch a webhook event to n8n when a candidate submits an application
   */
  public static async dispatchApplication(application: CandidateApplication, jobTitle: string, companyName: string): Promise<boolean> {
    const payload: N8nApplicationWebhookPayload = {
      event: 'application.submitted',
      timestamp: new Date().toISOString(),
      application,
      jobTitle,
      companyName
    };

    console.log(`[n8n Dispatcher] Triggering application workflow for "${application.candidateName}"...`);
    return await this.postWithFallback(Env.N8N_WEBHOOK_APPLICATION, payload);
  }
}
