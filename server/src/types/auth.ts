export type UserRole = 'user' | 'admin' | 'premium' | 'test';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  isSubscribed?: boolean;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    isSubscribed: boolean;
  };
}

export interface SignupResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    role: UserRole;
    isSubscribed: boolean;
  };
} 