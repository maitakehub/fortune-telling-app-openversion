export enum ErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SERVER_ERROR = 'SERVER_ERROR',
  INVALID_TOKEN = 'INVALID_TOKEN'
}

export interface ApiError {
  type: ErrorType;
  message: string;
  details?: any;
} 