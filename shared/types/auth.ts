/**
 * Healthcare Job Portal - Shared Auth TypeScript Interfaces
 */

export type UserRole = 'candidate' | 'employer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clinicalLicenseNumber?: string;
  specialty?: string;
  organization?: string;
  title?: string;
  phone?: string;
  bio?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: 'candidate' | 'employer';
  clinicalLicenseNumber?: string;
  specialty?: string;
  organization?: string;
  title?: string;
  phone?: string;
}
