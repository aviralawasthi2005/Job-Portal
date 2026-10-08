import { writable } from 'svelte/store';
import type { Job, TrackedApplication } from './types';

// Load initial from localStorage safely
function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

// Save to localStorage safely
function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to persist ${key} to localStorage:`, e);
  }
}

// 1. Saved Jobs Store
const initialSaved = loadFromStorage<Job[]>('pulse_saved_jobs', []);
export const savedJobs = writable<Job[]>(initialSaved);

savedJobs.subscribe((jobs) => {
  saveToStorage('pulse_saved_jobs', jobs);
});

export function toggleSaveJob(job: Job): boolean {
  let isNowSaved = false;
  savedJobs.update((list) => {
    const exists = list.some((j) => j.guid === job.guid);
    if (exists) {
      isNowSaved = false;
      return list.filter((j) => j.guid !== job.guid);
    } else {
      isNowSaved = true;
      return [job, ...list];
    }
  });
  return isNowSaved;
}

// 2. Tracked Applications Store
const initialApplications = loadFromStorage<TrackedApplication[]>('pulse_tracked_applications', [
  {
    id: 'app-seed-01',
    jobGuid: 'hc-tele-fnp-01',
    jobTitle: 'Telehealth Family Nurse Practitioner (FNP)',
    companyName: 'CareHealth Telemedicine',
    location: 'Remote (US)',
    clinicalLicense: 'RN-994821',
    status: 'under_review',
    appliedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
]);

export const trackedApplications = writable<TrackedApplication[]>(initialApplications);

trackedApplications.subscribe((apps) => {
  saveToStorage('pulse_tracked_applications', apps);
});

export function addTrackedApplication(app: Omit<TrackedApplication, 'id' | 'appliedAt' | 'status'>): void {
  const newApp: TrackedApplication = {
    ...app,
    id: `app-${Date.now()}`,
    status: 'applied',
    appliedAt: new Date().toISOString()
  };
  trackedApplications.update((list) => [newApp, ...list]);
}

// 3. User Authentication Store
export interface AuthUserState {
  id: string;
  name: string;
  email: string;
  role: 'candidate' | 'employer' | 'admin';
  clinicalLicenseNumber?: string;
  specialty?: string;
  organization?: string;
  title?: string;
  phone?: string;
  createdAt: string;
}

const initialUser = loadFromStorage<AuthUserState | null>('pulse_current_user', null);
const initialToken = loadFromStorage<string | null>('pulse_auth_token', null);

export const currentUser = writable<AuthUserState | null>(initialUser);
export const authToken = writable<string | null>(initialToken);

currentUser.subscribe((user) => {
  saveToStorage('pulse_current_user', user);
});

authToken.subscribe((token) => {
  saveToStorage('pulse_auth_token', token);
});

export function setAuthenticatedUser(user: AuthUserState, token: string): void {
  currentUser.set(user);
  authToken.set(token);
}

export function logoutUser(): void {
  currentUser.set(null);
  authToken.set(null);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pulse_current_user');
    localStorage.removeItem('pulse_auth_token');
  }
}

export function quickDemoLogin(role: 'clinician' | 'employer'): AuthUserState {
  let demoUser: AuthUserState;
  if (role === 'clinician') {
    demoUser = {
      id: 'usr-clinician-demo',
      name: 'Dr. Sarah Jenkins, MD',
      email: 'doctor@pulsehealth.org',
      role: 'candidate',
      specialty: 'Physicians & Surgeons',
      clinicalLicenseNumber: 'MD-883921-CA',
      title: 'Board-Certified Internist',
      createdAt: new Date().toISOString()
    };
  } else {
    demoUser = {
      id: 'usr-employer-demo',
      name: 'Marcus Vance',
      email: 'recruiter@carehealth.com',
      role: 'employer',
      organization: 'CareHealth Telemedicine Network',
      title: 'Director of Clinical Talent Acquisition',
      createdAt: new Date().toISOString()
    };
  }

  const demoToken = `pulse_demo_tk_${Date.now()}`;
  setAuthenticatedUser(demoUser, demoToken);
  return demoUser;
}
