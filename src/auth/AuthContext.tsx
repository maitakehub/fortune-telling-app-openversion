import React, { createContext, useEffect, useState, useCallback, useContext, useRef } from 'react';
import { User, UserRole, AuthState } from '../types/user';
import {
  loginRequest,
  signupRequest,
  logoutRequest,
  getCurrentUserFromToken,
  validateSession,
  refreshSession as refreshSessionRequest
} from './AuthService';

// セッション管理の定数
const SESSION_CHECK_INTERVAL = 30 * 60 * 1000; // 30分
const WARNING_BEFORE_EXPIRY = 5 * 60 * 1000; // 5分前に警告
const ACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5分以内のアクティビティでセッション延長
const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  login: async () => {},
  logout: async () => {},
  signup: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
  refreshSession: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetActivityTimer = useCallback(() => {
    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
    }
    lastActivityRef.current = Date.now();
    activityTimerRef.current = setTimeout(async () => {
      try {
        await refreshSession();
      } catch (err) {
        console.error('Session refresh failed:', err);
        await logout();
      }
    }, SESSION_CHECK_INTERVAL);
  }, []);

  useEffect(() => {
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivityRef.current >= ACTIVITY_THRESHOLD) {
        resetActivityTimer();
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      if (activityTimerRef.current) {
        clearTimeout(activityTimerRef.current);
      }
    };
  }, [resetActivityTimer]);

  // セッションチェックの定期実行
  useEffect(() => {
    let sessionCheckInterval: NodeJS.Timeout;

    const checkSession = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
          setUser(null);
          return;
        }

        const isValid = await validateSession(token);
        if (!isValid) {
          const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
          if (refreshToken) {
            try {
              const newToken = await refreshSessionRequest(refreshToken);
              localStorage.setItem(TOKEN_KEY, newToken);
              const currentUser = await getCurrentUserFromToken(newToken);
              setUser(currentUser);
            } catch (err) {
              console.error('Session refresh failed:', err);
              await logout();
            }
          } else {
            await logout();
          }
        }
      } catch (err) {
        console.error('Session check failed:', err);
        setError('セッションの確認に失敗しました');
      }
    };

    sessionCheckInterval = setInterval(checkSession, SESSION_CHECK_INTERVAL);
    return () => clearInterval(sessionCheckInterval);
  }, []);

  // セッションの初期化
  useEffect(() => {
    const initSession = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          const currentUser = await getCurrentUserFromToken(token);
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Session initialization failed:', err);
        setError(err instanceof Error ? err.message : '認証エラーが発生しました');
        await logout();
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { token, refreshToken, user: loginUser } = await loginRequest(email, password);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      setUser(loginUser);
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : 'ログインに失敗しました');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        await logoutRequest(token);
      }
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
      setError(err instanceof Error ? err.message : 'ログアウトに失敗しました');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { token, refreshToken, user: newUser } = await signupRequest(email, password);
      
      // トークンを保存
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      
      // ユーザー情報を設定
      setUser(newUser);
      setIsAuthenticated(true);
      
      // アクティビティタイマーをリセット
      resetActivityTimer();
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'サインアップに失敗しました');
      setLoading(false);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      // TODO: パスワードリセット処理
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'パスワードリセットに失敗しました');
      setLoading(false);
      throw err;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      // TODO: プロフィール更新処理
      setUser(prev => prev ? { ...prev, ...data } : null);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'プロフィールの更新に失敗しました');
      setLoading(false);
      throw err;
    }
  };

  const refreshSession = async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: セッション更新処理
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'セッションの更新に失敗しました');
      setLoading(false);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        logout,
        signup,
        resetPassword,
        updateProfile,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
