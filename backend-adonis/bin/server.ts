import express from 'express';
import cors from 'cors';
import { Env } from '../start/env.js';
import { router } from '../start/routes.js';

const app = express();

// Security & Parsing Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Webhook-Secret']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logging
app.use((req, _res, next) => {
  console.log(`[AdonisJS ${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount Routes
app.use(router);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found on AdonisJS Healthcare API Gateway'
  });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[AdonisJS Global Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: Env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Boot HTTP Server
app.listen(Env.PORT, Env.HOST, () => {
  console.log('====================================================');
  console.log(`🏥 Healthcare Job Portal - AdonisJS v6 Backend`);
  console.log(`📡 URL: http://${Env.HOST}:${Env.PORT}`);
  console.log(`🩺 Health: http://${Env.HOST}:${Env.PORT}/health`);
  console.log(`💼 Jobs API: http://${Env.HOST}:${Env.PORT}/api/v1/jobs`);
  console.log(`🤖 n8n Webhook: ${Env.N8N_WEBHOOK_NEW_JOB}`);
  console.log('====================================================');
});

export default app;
