import { jwtDecode } from 'jwt-decode';
import { AUTH_CONSTANTS } from '../constants/auth';
import { ErrorType, AuthError, ApiError } from '../types/errors';
import { User, UserRole } from '../types/user';

interface LoginSignupResponse {
  message: string;
  token: string;
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
  lastActivity: number;
  expiresAt: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30分
const SESSION_KEY = 'session_info';

// セッション情報を保存
function saveSessionInfo(token: string): void {
  const decoded = jwtDecode<DecodedToken>(token);
  const sessionInfo: SessionInfo = {
    token,
    lastActivity: Date.now(),
    expiresAt: decoded.exp * 1000,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionInfo));
}

// セッション情報を取得
function getSessionInfo(): SessionInfo | null {
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
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

// セッションの最終アクティビティを更新
function updateLastActivity(): void {
  const sessionInfo = getSessionInfo();
  if (sessionInfo) {
    sessionInfo.lastActivity = Date.now();
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionInfo));
  }
}

// セッションをクリア
function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(AUTH_CONSTANTS.TOKEN_KEY);
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

export async function loginRequest(email: string, password: string): Promise<{ token: string; user: User }> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  const data: LoginSignupResponse = await response.json();
  saveSessionInfo(data.token);
  return {
    token: data.token,
    user: data.user,
  };
}

export async function signupRequest(email: string, password: string): Promise<{ token: string; user: User }> {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  const data: LoginSignupResponse = await response.json();
  saveSessionInfo(data.token);
  return {
    token: data.token,
    user: data.user,
  };
}

export async function logoutRequest() {
  clearSession();
  
  // バックエンドにもログアウトを通知
  const sessionInfo = getSessionInfo();
  if (sessionInfo?.token) {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionInfo.token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Logout notification failed:', error);
    }
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
