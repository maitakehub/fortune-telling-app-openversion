export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE = 'DUPLICATE',
  NETWORK = 'NETWORK',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

export interface ErrorDetails {
  message: string;
  type: ErrorType;
  statusCode: number;
  details?: string[];
}

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly details?: string[];

  constructor(details: ErrorDetails) {
    super(details.message);
    this.type = details.type;
    this.statusCode = details.statusCode;
    this.details = details.details;
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: string[]) {
    super({
      message,
      type: ErrorType.VALIDATION,
      statusCode: 400,
      details
    });
    this.name = 'ValidationError';
  }
}

export class AuthError extends AppError {
  constructor(message: string, details?: string[]) {
    super({
      message,
      type: ErrorType.AUTHENTICATION,
      statusCode: 401,
      details
    });
    this.name = 'AuthError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string) {
    super({
      message,
      type: ErrorType.AUTHORIZATION,
      statusCode: 403
    });
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super({
      message,
      type: ErrorType.NOT_FOUND,
      statusCode: 404
    });
    this.name = 'NotFoundError';
  }
}

export class DuplicateError extends AppError {
  constructor(message: string) {
    super({
      message,
      type: ErrorType.DUPLICATE,
      statusCode: 409
    });
    this.name = 'DuplicateError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string) {
    super({
      message,
      type: ErrorType.NETWORK,
      statusCode: 503
    });
    this.name = 'NetworkError';
  }
}

export class ServerError extends AppError {
  constructor(message: string) {
    super({
      message,
      type: ErrorType.SERVER,
      statusCode: 500
    });
    this.name = 'ServerError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, details?: string[]) {
    super({
      message,
      type: ErrorType.AUTHENTICATION,
      statusCode: 401,
      details
    });
    this.name = 'AuthenticationError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: string[]) {
    super({
      message,
      type: ErrorType.SERVER,
      statusCode: 500,
      details
    });
    this.name = 'DatabaseError';
  }
}

export interface ApiError {
  message: string;
  type: ErrorType;
  statusCode: number;
  details?: string[];
} 