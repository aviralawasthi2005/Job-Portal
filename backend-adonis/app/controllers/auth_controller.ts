import type { Request, Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { N8nDispatcherService } from '../services/n8n_dispatcher_service.js';
import type { User, UserRole } from '../../../shared/types/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data folder
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {}
}

function hashPassword(password: string, salt = 'pulse_health_secure_salt_2026'): string {
  return crypto.scryptSync(password, salt, 32).toString('hex');
}

interface StoredUser extends User {
  passwordHash: string;
}

const DEMO_USERS: StoredUser[] = [
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

const usersMap = new Map<string, StoredUser>();
const tokensMap = new Map<string, { userId: string; email: string; expiresAt: number }>();

// Load seed & persisted users
for (const u of DEMO_USERS) {
  usersMap.set(u.email.toLowerCase(), u);
}
if (fs.existsSync(USERS_FILE)) {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    const list: StoredUser[] = JSON.parse(raw);
    for (const u of list) {
      usersMap.set(u.email.toLowerCase(), u);
    }
  } catch (e) {
    console.warn('[Adonis AuthController] Could not load persisted users:', e);
  }
}

function persistUsers(): void {
  try {
    const arr = Array.from(usersMap.values());
    fs.writeFileSync(USERS_FILE, JSON.stringify(arr, null, 2), 'utf8');
  } catch (e) {
    console.warn('[Adonis AuthController] Could not save users:', e);
  }
}

function sanitizeUser(u: StoredUser | undefined): User | null {
  if (!u) return null;
  const { passwordHash, ...safe } = u;
  return safe;
}

export class AuthController {
  /**
   * POST /api/v1/auth/signup
   */
  public static async signup(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role, specialty, clinicalLicenseNumber, organization, title, phone } = req.body || {};

      if (!name || !name.trim()) {
        res.status(400).json({ success: false, message: 'Full Name is required.' });
        return;
      }
      if (!email || !email.includes('@')) {
        res.status(400).json({ success: false, message: 'A valid email address is required.' });
        return;
      }
      if (!password || password.length < 6) {
        res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (usersMap.has(normalizedEmail)) {
        res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        return;
      }

      const userRole: UserRole = role === 'employer' ? 'employer' : 'candidate';
      const newUser: StoredUser = {
        id: `usr-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: hashPassword(password),
        role: userRole,
        specialty: specialty?.trim() || (userRole === 'candidate' ? 'General Healthcare' : undefined),
        clinicalLicenseNumber: clinicalLicenseNumber?.trim() || undefined,
        organization: organization?.trim() || (userRole === 'employer' ? 'Healthcare Provider' : undefined),
        title: title?.trim() || undefined,
        phone: phone?.trim() || undefined,
        createdAt: new Date().toISOString()
      };

      usersMap.set(normalizedEmail, newUser);
      persistUsers();

      // Dispatch to n8n user signup automation
      N8nDispatcherService.dispatchUserSignup(sanitizeUser(newUser)).catch(() => {});

      const token = `pulse_tk_${crypto.randomBytes(24).toString('hex')}`;
      tokensMap.set(token, {
        userId: newUser.id,
        email: normalizedEmail,
        expiresAt: Date.now() + 7 * 24 * 3600 * 1000
      });

      res.status(201).json({
        success: true,
        message: 'Account registered successfully!',
        user: sanitizeUser(newUser),
        token
      });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message || 'Signup failed' });
    }
  }

  /**
   * POST /api/v1/auth/login
   */
  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body || {};

      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required.' });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      const user = usersMap.get(normalizedEmail);

      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const hashed = hashPassword(password);
      if (user.passwordHash !== hashed) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const token = `pulse_tk_${crypto.randomBytes(24).toString('hex')}`;
      tokensMap.set(token, {
        userId: user.id,
        email: normalizedEmail,
        expiresAt: Date.now() + 7 * 24 * 3600 * 1000
      });

      res.status(200).json({
        success: true,
        message: 'Welcome back!',
        user: sanitizeUser(user),
        token
      });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message || 'Login failed' });
    }
  }

  /**
   * GET /api/v1/auth/me
   */
  public static async me(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

      if (!token) {
        res.status(401).json({ success: false, message: 'No authorization token provided' });
        return;
      }

      const session = tokensMap.get(token);
      if (!session || session.expiresAt < Date.now()) {
        res.status(401).json({ success: false, message: 'Session expired or invalid' });
        return;
      }

      const user = usersMap.get(session.email);
      res.status(200).json({
        success: true,
        user: sanitizeUser(user)
      });
    } catch (e: any) {
      res.status(500).json({ success: false, message: 'Profile retrieval error' });
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  public static async logout(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (token) {
      tokensMap.delete(token);
    }
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  }
}
