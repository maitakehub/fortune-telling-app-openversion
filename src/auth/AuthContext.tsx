import React, { createContext, useEffect, useState, useCallback } from 'react';
import { User, UserRole, AuthState } from '../types/user';
import {
  loginRequest,
  signupRequest,
  logoutRequest,
  getCurrentUserFromToken,
  validateSession,
  refreshSession
} from './AuthService';

// セッション管理の定数
const SESSION_CHECK_INTERVAL = 30 * 60 * 1000; // 30分
const WARNING_BEFORE_EXPIRY = 5 * 60 * 1000; // 5分前に警告
const ACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5分以内のアクティビティでセッション延長

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  checkPermission: (requiredRole: UserRole) => boolean;
  isAdmin: () => boolean;
  isTestUser: () => boolean;
  extendSession: () => Promise<void>;
  dismissSessionWarning: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null,
  sessionWarning: false,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
  checkPermission: () => false,
  isAdmin: () => false,
  isTestUser: () => false,
  extendSession: async () => {},
  dismissSessionWarning: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: localStorage.getItem('authToken'),
    loading: true,
    error: null,
    sessionWarning: false,
  });

  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [warningTimeout, setWarningTimeout] = useState<NodeJS.Timeout | null>(null);
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);

  // アクティビティの監視
  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now());
    };

    // ユーザーのアクティビティを監視
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, []);

  // セッションの延長
  const extendSession = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const newToken = await refreshSession(token);
        if (newToken) {
          localStorage.setItem('authToken', newToken);
          setState(prev => ({
            ...prev,
            token: newToken,
            sessionWarning: false
          }));
          
          // 警告タイマーをクリア
          if (warningTimeout) {
            clearTimeout(warningTimeout);
            setWarningTimeout(null);
          }
          if (sessionTimeout) {
            clearTimeout(sessionTimeout);
            setSessionTimeout(null);
          }
        }
      }
    } catch (error) {
      console.error('Session extension failed:', error);
    }
  };

  // 警告を非表示
  const dismissSessionWarning = () => {
    setState(prev => ({ ...prev, sessionWarning: false }));
  };

  // セッションチェックのメイン処理
  const checkSession = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const isValid = await validateSession(token);
      if (!isValid) {
        // セッション切れの5分前に警告を表示
        const warningTimer = setTimeout(() => {
          setState(prev => ({ ...prev, sessionWarning: true }));
        }, SESSION_CHECK_INTERVAL - WARNING_BEFORE_EXPIRY);

        // セッション切れでログアウト
        const sessionTimer = setTimeout(() => {
          logout();
        }, SESSION_CHECK_INTERVAL);

        setWarningTimeout(warningTimer);
        setSessionTimeout(sessionTimer);
      } else {
        // アクティブなユーザーの場合、セッションを自動延長
        const timeSinceLastActivity = Date.now() - lastActivity;
        if (timeSinceLastActivity < ACTIVITY_THRESHOLD) {
          await extendSession();
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
    }
  }, [lastActivity]);

  // 定期的なセッションチェック
  useEffect(() => {
    const interval = setInterval(checkSession, SESSION_CHECK_INTERVAL);
    return () => {
      clearInterval(interval);
      if (warningTimeout) clearTimeout(warningTimeout);
      if (sessionTimeout) clearTimeout(sessionTimeout);
    };
  }, [checkSession]);

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const { token, user } = await loginRequest(email, password);
      localStorage.setItem('authToken', token);
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        user,
        token,
        error: null,
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : '認証に失敗しました。');
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      setError(null);
      const { token, user } = await signupRequest(email, password);
      localStorage.setItem('authToken', token);
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        user,
        token,
        error: null,
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : '新規登録に失敗しました。');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
      setState({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      // セッションの有効性を確認
      const isValid = await validateSession(token);
      if (!isValid) {
        throw new Error('セッションが無効です。');
      }

      const user = await getCurrentUserFromToken(token);
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        user,
        token,
        loading: false,
        error: null,
      }));
    } catch (error) {
      localStorage.removeItem('authToken');
      setState({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: error instanceof Error ? error.message : 'セッションの更新に失敗しました。',
      });
    }
  };

  const checkPermission = (requiredRole: UserRole): boolean => {
    if (!state.user) return false;

    const roleHierarchy = {
      [UserRole.ADMIN]: 3,
      [UserRole.TEST_USER]: 2,
      [UserRole.USER]: 1,
      [UserRole.GUEST]: 0,
    };

    return roleHierarchy[state.user.role] >= roleHierarchy[requiredRole];
  };

  const isAdmin = (): boolean => {
    return state.user?.role === UserRole.ADMIN;
  };

  const isTestUser = (): boolean => {
    return state.user?.role === UserRole.TEST_USER;
  };

  // 初期化時にユーザー情報を取得
  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
        refreshUser,
        checkPermission,
        isAdmin,
        isTestUser,
        extendSession,
        dismissSessionWarning,
      }}
    >
      {!state.loading && (
        <>
          {children}
          {state.sessionWarning && (
            <div className="fixed bottom-4 right-4 max-w-sm bg-yellow-900/90 p-4 rounded-lg shadow-lg border border-yellow-700">
              <p className="text-yellow-100 mb-3">
                まもなくセッションが切れます。続けて利用する場合は延長してください。
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={dismissSessionWarning}
                  className="px-3 py-1 text-yellow-200 hover:text-yellow-100"
                >
                  閉じる
                </button>
                <button
                  onClick={extendSession}
                  className="px-3 py-1 bg-yellow-700 text-yellow-100 rounded hover:bg-yellow-600"
                >
                  セッションを延長
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </AuthContext.Provider>
  );
}
