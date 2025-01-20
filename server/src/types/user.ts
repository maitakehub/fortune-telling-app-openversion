export type UserRole = 'user' | 'admin' | 'test';

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  isSubscribed: boolean;
  subscriptionPlan?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  id: string;
  email: string;
  role: UserRole;
  isSubscribed: boolean;
  subscriptionPlan?: string;
  createdAt: Date;
  updatedAt: Date;
} 