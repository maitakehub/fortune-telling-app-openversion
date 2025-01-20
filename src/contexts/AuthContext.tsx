import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AppError, ErrorType } from '../types/errors';
import { ErrorMessages } from '../constants/errorMessages';
import { User } from '../types/user';
import { AuthError } from '../types/errors';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  signup: (email: string, password: string, confirmPassword: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  const signup = useCallback(async (email: string, password: string, confirmPassword: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new AppError(
          errorData.message || ErrorMessages.UNKNOWN_ERROR,
          ErrorType.AUTHENTICATION,
          response.status
        );
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(ErrorMessages.NETWORK_ERROR, ErrorType.NETWORK);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new AppError(
          errorData.message || ErrorMessages.UNKNOWN_ERROR,
          ErrorType.AUTHENTICATION,
          response.status
        );
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(ErrorMessages.NETWORK_ERROR, ErrorType.NETWORK);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new AppError(ErrorMessages.UNKNOWN_ERROR, ErrorType.AUTHENTICATION);
      }

      setUser(null);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(ErrorMessages.NETWORK_ERROR, ErrorType.NETWORK);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    // Implementation of refreshToken method
  }, []);

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    refreshToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider; 