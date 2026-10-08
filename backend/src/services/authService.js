import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.warn('[AuthService] Could not create data dir:', e.message);
  }
}

function hashPassword(password, salt = 'pulse_health_secure_salt_2026') {
  return crypto.scryptSync(password, salt, 32).toString('hex');
}

// Seed demo users so the portal can be immediately evaluated
const DEMO_USERS = [
  {
    id: 'usr-clinician-01',
    name: 'Dr. Sarah Jenkins, MD',
    email: 'doctor@pulsehealth.org',
    passwordHash: hashPassword('pulse123'),
    role: 'candidate',
    specialty: 'Physicians & Surgeons',
    clinicalLicenseNumber: 'MD-883921-CA',
    title: 'Board-Certified Internist',
    bio: '12+ years experience in acute care and remote patient monitoring.',
    createdAt: new Date('2026-01-15').toISOString()
  },
  {
    id: 'usr-clinician-02',
    name: 'Elena Rostova, BSN, RN',
    email: 'nurse@pulsehealth.org',
    passwordHash: hashPassword('pulse123'),
    role: 'candidate',
    specialty: 'Nursing',
    clinicalLicenseNumber: 'RN-994821-NY',
    title: 'Critical Care & Telehealth Nurse',
    bio: 'Specializing in cardiac ICU, triage, and remote telehealth consultations.',
    createdAt: new Date('2026-02-10').toISOString()
  },
  {
    id: 'usr-employer-01',
    name: 'Marcus Vance',
    email: 'recruiter@carehealth.com',
    passwordHash: hashPassword('pulse123'),
    role: 'employer',
    organization: 'CareHealth Telemedicine Network',
    title: 'Director of Clinical Talent Acquisition',
    bio: 'Hiring verified clinicians and telehealth providers across North America.',
    createdAt: new Date('2026-01-01').toISOString()
  }
];

class AuthService {
  constructor() {
    this.users = new Map();
    this.tokens = new Map();
    this.loadUsers();
  }

  loadUsers() {
    // Seed demo accounts first
    for (const u of DEMO_USERS) {
      this.users.set(u.email.toLowerCase(), u);
    }

    if (fs.existsSync(USERS_FILE)) {
      try {
        const raw = fs.readFileSync(USERS_FILE, 'utf8');
        const list = JSON.parse(raw);
        for (const u of list) {
          this.users.set(u.email.toLowerCase(), u);
        }
      } catch (e) {
        console.warn('[AuthService] Could not load persisted users:', e.message);
      }
    }
  }

  saveUsers() {
    try {
      const arr = Array.from(this.users.values());
      fs.writeFileSync(USERS_FILE, JSON.stringify(arr, null, 2), 'utf8');
    } catch (e) {
      console.warn('[AuthService] Could not persist users to disk:', e.message);
    }
  }

  sanitize(user) {
    if (!user) return null;
    const { passwordHash, ...safe } = user;
    return safe;
  }

  generateToken(user) {
    const token = `pulse_tk_${crypto.randomBytes(24).toString('hex')}`;
    this.tokens.set(token, {
      userId: user.id,
      email: user.email.toLowerCase(),
      expiresAt: Date.now() + 7 * 24 * 3600 * 1000 // 7 days
    });
    return token;
  }

  async notifyN8nSignup(user) {
    const webhookUrl = process.env.N8N_WEBHOOK_URL
      ? `${process.env.N8N_WEBHOOK_URL.replace(/\/$/, '')}/webhook/user-signup`
      : 'http://localhost:5678/webhook/user-signup';

    const testUrl = webhookUrl.replace('/webhook/', '/webhook-test/');

    const payload = {
      event: 'user.signup',
      timestamp: new Date().toISOString(),
      user: this.sanitize(user)
    };

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(2500)
      });
      console.log(`[AuthService] n8n user-signup webhook delivered: ${webhookUrl}`);
    } catch {
      try {
        await fetch(testUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(2500)
        });
        console.log(`[AuthService] n8n test webhook delivered: ${testUrl}`);
      } catch {
        // Safe to ignore if n8n is offline
      }
    }
  }

  signup({ name, email, password, role = 'candidate', specialty, clinicalLicenseNumber, organization, title, phone }) {
    if (!name || !name.trim()) {
      throw new Error('Full Name is required.');
    }
    if (!email || !email.includes('@')) {
      throw new Error('A valid email address is required.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (this.users.has(normalizedEmail)) {
      throw new Error('An account with this email already exists.');
    }

    const newUser = {
      id: `usr-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      role: role === 'employer' ? 'employer' : 'candidate',
      specialty: specialty?.trim() || (role === 'candidate' ? 'General Healthcare' : undefined),
      clinicalLicenseNumber: clinicalLicenseNumber?.trim() || undefined,
      organization: organization?.trim() || (role === 'employer' ? 'Healthcare Provider' : undefined),
      title: title?.trim() || undefined,
      phone: phone?.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    this.users.set(normalizedEmail, newUser);
    this.saveUsers();

    // Trigger n8n async onboarding webhook
    this.notifyN8nSignup(newUser).catch(() => {});

    const token = this.generateToken(newUser);
    return {
      success: true,
      message: 'Account created successfully!',
      user: this.sanitize(newUser),
      token
    };
  }

  login({ email, password }) {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = this.users.get(normalizedEmail);

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const hashed = hashPassword(password);
    if (user.passwordHash !== hashed) {
      throw new Error('Invalid email or password.');
    }

    const token = this.generateToken(user);
    return {
      success: true,
      message: 'Welcome back!',
      user: this.sanitize(user),
      token
    };
  }

  getUserFromToken(token) {
    if (!token) return null;
    const session = this.tokens.get(token);
    if (!session || session.expiresAt < Date.now()) {
      return null;
    }
    const user = this.users.get(session.email);
    return this.sanitize(user);
  }

  logout(token) {
    if (token) {
      this.tokens.delete(token);
    }
    return { success: true, message: 'Logged out successfully.' };
  }
}

export const authService = new AuthService();
