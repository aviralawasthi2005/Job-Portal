import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jobRoutes from '../backend/src/routes/jobRoutes.js';
import authRoutes from '../backend/src/routes/authRoutes.js';
import webhookRoutes from '../backend/src/routes/webhookRoutes.js';

// Load environment variables (Vercel injects these automatically in production)
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Healthcare Job Portal Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/n8n', webhookRoutes);
app.use('/api/v1/n8n', webhookRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Healthcare Job Portal Backend is active' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Export for Vercel serverless (no app.listen needed)
export default app;
