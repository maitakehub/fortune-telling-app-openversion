import { jwtDecode } from 'jwt-decode';
import { AUTH_CONSTANTS } from '../constants/auth';
import { ErrorType, AuthError, ApiError } from '../types/errors';
import { User, UserRole } from '../types/user';

interface LoginSignupResponse {
  message: string;
  token: string;
  refreshToken: string;
  user: User;
}

interface DecodedToken {
  userId: string;
  email: string;
  role: UserRole;
  isSubscribed: boolean;
  subscriptionPlan?: string;
  iat: number;
  exp: number;
}

interface SessionInfo {
  token: string;
  refreshToken: string;
  expiresAt: number;
  lastActivity: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30分
const SESSION_KEY = 'session_info';
const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5分前にリフレッシュ

// セッション情報を保存
export function saveSessionInfo(token: string, refreshToken: string): void {
  const sessionInfo: SessionInfo = {
    token,
    refreshToken,
    expiresAt: Date.now() + AUTH_CONSTANTS.SESSION_DURATION,
    lastActivity: Date.now()
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionInfo));
}

// セッション情報を取得
export function getSessionInfo(): SessionInfo | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to parse session info:', error);
    clearSession();
    return null;
  }
}

// セッションの有効性をチェック
function isSessionValid(): boolean {
  const sessionInfo = getSessionInfo();
  if (!sessionInfo) return false;

  const now = Date.now();
  const isExpired = now >= sessionInfo.expiresAt;
  const isInactive = now - sessionInfo.lastActivity > SESSION_TIMEOUT;

  return !isExpired && !isInactive;
}

// リフレッシュが必要かチェック
function needsRefresh(): boolean {
  const sessionInfo = getSessionInfo();
  if (!sessionInfo) return false;

  const now = Date.now();
  return sessionInfo.expiresAt - now <= REFRESH_THRESHOLD;
}

// セッションの最終アクティビティを更新
function updateLastActivity(): void {
  const sessionInfo = getSessionInfo();
  if (sessionInfo) {
    sessionInfo.lastActivity = Date.now();
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionInfo));
    } catch (error) {
      console.error('Failed to update last activity:', error);
    }
  }
}

// セッションをクリア
export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

async function handleApiError(response: Response): Promise<never> {
  let errorData: ApiError;
  try {
    errorData = await response.json();
  } catch {
    errorData = {
      type: ErrorType.SERVER_ERROR,
      message: AUTH_CONSTANTS.ERROR_MESSAGES.SERVER_ERROR
    };
  }

  throw new AuthError(
    errorData.type || ErrorType.SERVER_ERROR,
    errorData.message || AUTH_CONSTANTS.ERROR_MESSAGES.SERVER_ERROR,
    errorData.details
  );
}

export async function loginRequest(email: string, password: string) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include'
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'ログインに失敗しました');
  }

  const data = await response.json();
  
  if (!data.token) {
    throw new Error('認証トークンが受信できませんでした');
  }

  return data;
}

export async function signupRequest(email: string, password: string): Promise<{ token: string; refreshToken: string; user: User }> {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new AuthError(
      errorData.type || ErrorType.SERVER_ERROR,
      errorData.message || AUTH_CONSTANTS.ERROR_MESSAGES.SERVER_ERROR
    );
  }

  const data = await response.json();
  
  // セッション情報を保存
  saveSessionInfo(data.token, data.refreshToken);
  
  return {
    token: data.token,
    refreshToken: data.refreshToken,
    user: {
      id: data.user.id,
      email: data.user.email,
      role: data.user.role,
      isSubscribed: data.user.isSubscribed,
      createdAt: data.user.createdAt,
      updatedAt: data.user.updatedAt
    }
  };
}

export async function refreshTokenRequest(): Promise<{ token: string; refreshToken: string }> {
  const sessionInfo = getSessionInfo();
  if (!sessionInfo?.refreshToken) {
    throw new AuthError(
      ErrorType.REFRESH_TOKEN_MISSING,
      AUTH_CONSTANTS.ERROR_MESSAGES.REFRESH_TOKEN_MISSING
    );
  }

  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: sessionInfo.refreshToken }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  const data = await response.json();
  saveSessionInfo(data.token, data.refreshToken);
  return {
    token: data.token,
    refreshToken: data.refreshToken,
  };
}

export async function logoutRequest(token: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new AuthError(
      errorData.type || ErrorType.SERVER_ERROR,
      errorData.message || AUTH_CONSTANTS.ERROR_MESSAGES.SERVER_ERROR
    );
  }
}

export function getCurrentUserFromToken(token: string): User | null {
  try {
    if (!isSessionValid()) {
      clearSession();
      throw new AuthError(
        ErrorType.SESSION_EXPIRED,
        AUTH_CONSTANTS.ERROR_MESSAGES.SESSION_EXPIRED
      );
    }

    const decoded = jwtDecode<DecodedToken>(token);
    updateLastActivity();
    
    if (needsRefresh()) {
      refreshTokenRequest().catch(console.error);
    }
    
    return {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      isSubscribed: decoded.isSubscribed,
      subscriptionPlan: decoded.subscriptionPlan as 'basic' | 'premium' | 'test' | undefined,
      createdAt: new Date(decoded.iat * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    return null;
  }
}

// セッションの有効性を確認
export async function validateSession(token: string): Promise<boolean> {
  try {
    if (!isSessionValid()) {
      clearSession();
      return false;
    }

    const response = await fetch(`${API_URL}/api/auth/validate`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      updateLastActivity();
      return true;
    }

    clearSession();
    return false;
  } catch {
    clearSession();
    return false;
  }
}

// パスワードリセットメールの送信
export async function requestPasswordReset(email: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/password-reset/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }
}

// リセットトークンの検証
export async function validateResetToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/auth/password-reset/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// パスワードの更新
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/password-reset/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }
}

export const refreshSession = async (token: string): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('セッションの更新に失敗しました。');
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Session refresh error:', error);
    throw error;
  }
};
