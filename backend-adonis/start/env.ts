import dotenv from 'dotenv';
dotenv.config();

export const Env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.ADONIS_PORT || process.env.PORT || 3333),
  HOST: process.env.ADONIS_HOST || '0.0.0.0',
  APP_KEY: process.env.APP_KEY || 'default_secret_key_healthcare_portal_2026',
  
  // n8n Webhook Endpoints
  N8N_WEBHOOK_NEW_JOB: process.env.N8N_WEBHOOK_NEW_JOB || 'http://localhost:5678/webhook/healthcare-new-job',
  N8N_WEBHOOK_APPLICATION: process.env.N8N_WEBHOOK_APPLICATION || 'http://localhost:5678/webhook/candidate-application',
  N8N_WEBHOOK_SIGNUP: process.env.N8N_WEBHOOK_SIGNUP || 'http://localhost:5678/webhook/user-signup',
  N8N_WEBHOOK_SECRET: process.env.N8N_WEBHOOK_SECRET || 'super_secret_healthcare_token_2026',
  
  // Himalayas API
  HIMALAYAS_API_URL: process.env.HIMALAYAS_API_URL || 'https://himalayas.app/jobs/api',
  CACHE_TTL_SECONDS: Number(process.env.CACHE_TTL_SECONDS || 900)
};
