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
import { useLoading } from '../contexts/LoadingContext';

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
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshSession: () => Promise<void>;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  setError: (error: string | null) => void;
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
  refreshSession: async () => {},
  setUser: () => {},
  setIsAuthenticated: () => {},
  setError: () => {}
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
  const { setLoading: setGlobalLoading } = useLoading();
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

  // 認証状態の初期化
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('AuthContext - Initializing auth state');
        const token = localStorage.getItem(TOKEN_KEY);
        
        if (!token) {
          console.log('AuthContext - No token found, setting unauthenticated state');
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // デバッグモードのトークンの場合
        if (token === 'debug_mode_token') {
          console.log('AuthContext - Debug mode detected');
          const debugUser: User = {
            id: 'debug_user',
            email: 'debug@example.com',
            role: UserRole.USER,
            subscriptionPlan: 'test',
            isSubscribed: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          setUser(debugUser);
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }

        const currentUser = await getCurrentUserFromToken(token);
        console.log('AuthContext - User from token:', currentUser);
        
        if (currentUser) {
          console.log('AuthContext - Setting authenticated state');
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          console.log('AuthContext - Invalid token, clearing auth state');
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem(TOKEN_KEY);
        }
      } catch (error) {
        console.error('AuthContext - Auth initialization failed:', error);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (token: string) => {
    console.log('AuthContext - Login attempt with token:', token);
    setGlobalLoading(true);
    try {
      // デバッグモードのトークンの場合
      if (token === 'debug_mode_token') {
        console.log('AuthContext - Debug mode login');
        const debugUser: User = {
          id: 'debug_user',
          email: 'debug@example.com',
          role: UserRole.USER,
          subscriptionPlan: 'test',
          isSubscribed: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setUser(debugUser);
        setIsAuthenticated(true);
        localStorage.setItem(TOKEN_KEY, token);
        setError(null);
        console.log('AuthContext - Debug mode login successful');
        return;
      }

      // 通常のログイン処理
      console.log('AuthContext - Normal login flow');
      const currentUser = await getCurrentUserFromToken(token);
      console.log('AuthContext - User from token:', currentUser);
      
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        localStorage.setItem(TOKEN_KEY, token);
        setError(null);
        console.log('AuthContext - Login successful');
      } else {
        throw new Error('Invalid token');
      }
    } catch (error) {
      console.error('AuthContext - Login failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem(TOKEN_KEY);
      setError(error instanceof Error ? error.message : '認証に失敗しました。');
      throw error;
    } finally {
      setGlobalLoading(false);
    }
  };

  const logout = async () => {
    setGlobalLoading(true);
    try {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (error) {
      console.error('Logout failed:', error);
      setError(error instanceof Error ? error.message : 'ログアウトに失敗しました');
      throw error;
    } finally {
      setGlobalLoading(false);
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
        isAuthenticated,
        loading,
        error,
        login,
        logout,
        signup,
        resetPassword,
        updateProfile,
        refreshSession,
        setUser,
        setIsAuthenticated,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
