import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../types/errors';
import { ErrorType } from '../types/errors';
import { validateEmail, validatePassword } from '../utils/validation';
import { createLogger } from '../utils/logger';

const logger = createLogger('ValidationMiddleware');

// メールアドレスの正規表現
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// パスワードの正規表現（8文字以上、英数字を含む）
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

export const validateSignupInput = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      throw new ValidationError('必須項目が入力されていません。');
    }

    if (!validateEmail(email)) {
      throw new ValidationError('メールアドレスの形式が正しくありません。');
    }

    if (!validatePassword(password)) {
      throw new ValidationError('パスワードは8文字以上で、英字と数字を含む必要があります。');
    }

    if (password !== confirmPassword) {
      throw new ValidationError('パスワードが一致しません。');
    }

    next();
  } catch (error) {
    logger.error('Signup validation error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        message: error.message,
        type: error.type
      });
      return;
    }
    res.status(400).json({
      message: '入力内容が正しくありません。',
      type: ErrorType.VALIDATION
    });
  }
};

export const validateLoginInput = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('メールアドレスとパスワードを入力してください。');
    }

    if (!validateEmail(email)) {
      throw new ValidationError('メールアドレスの形式が正しくありません。');
    }

    next();
  } catch (error) {
    logger.error('Login validation error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        message: error.message,
        type: error.type
      });
      return;
    }
    res.status(400).json({
      message: '入力内容が正しくありません。',
      type: ErrorType.VALIDATION
    });
  }
};

export const validateRefreshToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError('リフレッシュトークンが必要です。');
    }

    next();
  } catch (error) {
    logger.error('Refresh token validation error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        message: error.message,
        type: error.type
      });
      return;
    }
    res.status(400).json({
      message: '入力内容が正しくありません。',
      type: ErrorType.VALIDATION
    });
  }
}; 