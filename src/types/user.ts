export enum UserRole {
  GUEST = 'guest',
  USER = 'user',
  TEST_USER = 'test_user',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isSubscribed: boolean;
  subscriptionPlan?: 'basic' | 'premium' | 'test';
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  personalInfo?: {
    name: string;
    birthDate: string;
    birthTime?: string;
    zodiacSign?: string;
  };
  lastLoginDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  sessionWarning: boolean;
} 