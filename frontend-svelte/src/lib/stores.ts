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
