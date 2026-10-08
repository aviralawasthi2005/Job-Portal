#!/usr/bin/env node

/**
 * n8n Workflow Manager & Health Diagnostic Tool
 * Healthcare Job Portal Enterprise Automation
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKFLOWS_DIR = path.join(__dirname, 'workflows');
const N8N_BASE_URL = process.env.N8N_BASE_URL || 'http://localhost:5678';

function log(msg, symbol = 'ℹ️') {
  console.log(`${symbol} ${msg}`);
}

function success(msg) {
  console.log(`\x1b[32m✔ ${msg}\x1b[0m`);
}

function warn(msg) {
  console.log(`\x1b[33m⚠ ${msg}\x1b[0m`);
}

function error(msg) {
  console.log(`\x1b[31m✖ ${msg}\x1b[0m`);
}

// 1. Validate workflow JSON files
function validateWorkflows() {
  console.log('\n--- 1. Validating Workflow JSON Specifications ---');
  if (!fs.existsSync(WORKFLOWS_DIR)) {
    error(`Workflows directory not found at: ${WORKFLOWS_DIR}`);
    return false;
  }

  const files = fs.readdirSync(WORKFLOWS_DIR).filter(f => f.endsWith('.json'));
  let allValid = true;

  for (const file of files) {
    const fullPath = path.join(WORKFLOWS_DIR, file);
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const parsed = JSON.parse(content);
      const nodeCount = parsed.nodes ? parsed.nodes.length : 0;
      success(`${file} (Valid JSON, ${nodeCount} nodes: "${parsed.name}")`);
    } catch (e) {
      error(`${file} Invalid JSON: ${e.message}`);
      allValid = false;
    }
  }

  return allValid;
}

// 2. Check n8n service connectivity
async function checkN8nHealth() {
  console.log(`\n--- 2. Checking n8n Service Status (${N8N_BASE_URL}) ---`);
  
  return new Promise((resolve) => {
    const url = new URL('/healthz', N8N_BASE_URL);
    const req = http.get(url, (res) => {
      if (res.statusCode === 200) {
        success(`n8n is ONLINE and Healthy (HTTP ${res.statusCode})`);
        resolve(true);
      } else {
        warn(`n8n responded with HTTP ${res.statusCode}`);
        resolve(false);
      }
    });

    req.on('error', (err) => {
      warn(`n8n is currently OFFLINE or unreachable at ${N8N_BASE_URL} (${err.code || err.message})`);
      log('To start n8n, run: npm run dev:n8n  OR  docker compose up -d n8n');
      resolve(false);
    });

    req.setTimeout(3000, () => {
      req.destroy();
      warn('n8n health check timed out after 3000ms');
      resolve(false);
    });
  });
}

// 3. Test Webhook endpoints
async function testWebhook(webhookPath, samplePayload, description) {
  return new Promise((resolve) => {
    const prodUrl = new URL(webhookPath, N8N_BASE_URL);
    const testUrl = new URL(webhookPath.replace('/webhook/', '/webhook-test/'), N8N_BASE_URL);

    const payloadStr = JSON.stringify(samplePayload);

    function doRequest(targetUrl, isTestMode) {
      const parsed = new URL(targetUrl);
      const options = {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payloadStr)
        },
        timeout: 4000
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            success(`${description} -> Active on ${targetUrl.pathname} (HTTP ${res.statusCode})`);
            resolve(true);
          } else if (res.statusCode === 404 && !isTestMode) {
            // Try test mode
            doRequest(testUrl, true);
          } else {
            warn(`${description} -> HTTP ${res.statusCode} (${isTestMode ? 'Test Mode' : 'Production Mode'}). Body: ${body.slice(0, 100)}`);
            resolve(false);
          }
        });
      });

      req.on('error', (err) => {
        warn(`${description} failed: ${err.message}`);
        resolve(false);
      });

      req.write(payloadStr);
      req.end();
    }

    doRequest(prodUrl, false);
  });
}

async function run() {
  console.log('====================================================');
  console.log('🏥 PulseCareers - n8n Workflow Automation Diagnostic');
  console.log('====================================================');

  validateWorkflows();
  const isOnline = await checkN8nHealth();

  if (isOnline) {
    console.log('\n--- 3. Testing Webhook Endpoints ---');
    await testWebhook(
      '/webhook/healthcare-new-job',
      {
        event: 'job.created',
        job: {
          title: 'Health Diagnostics System Check',
          companyName: 'PulseCareers Automation Test',
          category: 'Healthcare Analytics',
          workplaceType: 'Remote',
          salaryString: '$120,000 / year'
        }
      },
      'New Job Webhook'
    );

    await testWebhook(
      '/webhook/candidate-application',
      {
        event: 'application.submitted',
        jobTitle: 'Health Diagnostics System Check',
        companyName: 'PulseCareers Automation Test',
        application: {
          candidateName: 'Test Candidate',
          candidateEmail: 'test@example.com',
          clinicalLicenseNumber: 'TEST-999',
          licensedState: 'CA'
        }
      },
      'Candidate Application Webhook'
    );

    await testWebhook(
      '/webhook/user-signup',
      {
        event: 'user.signup',
        user: {
          name: 'Dr. Jane Watson',
          email: 'jane.watson@example.com',
          role: 'candidate',
          specialty: 'Nursing',
          clinicalLicenseNumber: 'RN-882910'
        }
      },
      'User Signup & Onboarding Webhook'
    );
  }

  console.log('\n====================================================');
  console.log('💡 Quick Tips to Keep n8n Strong:');
  console.log('1. Make sure imported workflows are switched to "Active" in the n8n UI.');
  console.log('2. When in "Test" mode in the n8n editor, webhooks listen at /webhook-test/<path>');
  console.log('3. When in "Active" mode, webhooks listen at /webhook/<path>');
  console.log('4. The backend AdonisJS automatically retries both /webhook/ and /webhook-test/');
  console.log('====================================================\n');
}

run();
