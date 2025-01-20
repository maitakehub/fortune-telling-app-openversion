export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  DUPLICATE = 'DUPLICATE',
  NETWORK = 'NETWORK',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

export class AppError extends Error {
  constructor(
    message: string,
    public type: ErrorType = ErrorType.UNKNOWN,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }

  static isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, ErrorType.VALIDATION, 400);
    this.name = 'ValidationError';
  }
}

export class AuthError extends AppError {
  constructor(message: string, type: ErrorType = ErrorType.AUTHENTICATION) {
    super(message, type, 401);
    this.name = 'AuthError';
  }
}

export class DuplicateError extends AppError {
  constructor(message: string) {
    super(message, ErrorType.DUPLICATE, 409);
    this.name = 'DuplicateError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string) {
    super(message, ErrorType.NETWORK, 503);
    this.name = 'NetworkError';
  }
}

export class ServerError extends AppError {
  constructor(message: string) {
    super(message, ErrorType.SERVER, 500);
    this.name = 'ServerError';
  }
}

export class ApiError extends Error {
  constructor(
    public type: ErrorType,
    message: string,
    public statusCode: number,
    public details?: string[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
} 