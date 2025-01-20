import { AppError, ErrorType } from '../types/errors';
import { ErrorMessages } from '../constants/errorMessages';

export class AuthService {
  private static instance: AuthService;
  private readonly API_BASE_URL = '/api/auth';

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async signup(email: string, password: string): Promise<any> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/signup`, {
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

      return await response.json();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(ErrorMessages.NETWORK_ERROR, ErrorType.NETWORK);
    }
  }

  public async login(email: string, password: string): Promise<any> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/login`, {
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

      return await response.json();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(ErrorMessages.NETWORK_ERROR, ErrorType.NETWORK);
    }
  }

  public async logout(): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/logout`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new AppError(ErrorMessages.UNKNOWN_ERROR, ErrorType.AUTHENTICATION);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(ErrorMessages.NETWORK_ERROR, ErrorType.NETWORK);
    }
  }
} 