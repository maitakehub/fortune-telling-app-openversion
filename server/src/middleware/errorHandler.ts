import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../utils/logger';
import { ErrorType, AppError } from '../types/errors';

const logger = createLogger('ErrorHandler');

interface ErrorResponse {
  status: string;
  message: string;
  code?: string;
  details?: string[];
  timestamp: string;
  requestId?: string;
}

// エラーログの構造化
function logError(err: Error | AppError, req: Request) {
  const errorInfo = {
    type: err instanceof AppError ? err.type : 'UNKNOWN_ERROR',
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
  };

  if (err instanceof AppError && err.statusCode >= 500) {
    logger.error(`${err.message}`, { ...errorInfo, stack: err.stack });
  } else {
    logger.warn(`${err.message}`, errorInfo);
  }
}

// エラーレスポンスの生成
function createErrorResponse(err: Error | AppError, req: Request): ErrorResponse {
  const timestamp = new Date().toISOString();
  const requestId = req.headers['x-request-id'] as string;

  if (err instanceof AppError) {
    return {
      status: 'error',
      message: err.message,
      code: err.type,
      details: err.details,
      timestamp,
      requestId,
    };
  }

  return {
    status: 'error',
    message: 'サーバーエラーが発生しました',
    code: ErrorType.INTERNAL_ERROR,
    timestamp,
    requestId,
  };
}

// エラーハンドリングミドルウェア
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logError(err, req);

  const errorResponse = createErrorResponse(err, req);
  const statusCode = err instanceof AppError ? err.statusCode : 500;

  res.status(statusCode).json(errorResponse);
};

// エラー種別の定数
export const ErrorTypes = {
  VALIDATION_ERROR: 'ValidationError',
  AUTHENTICATION_ERROR: 'AuthenticationError',
  AUTHORIZATION_ERROR: 'AuthorizationError',
  NOT_FOUND_ERROR: 'NotFoundError',
  CONFLICT_ERROR: 'ConflictError'
} as const; 