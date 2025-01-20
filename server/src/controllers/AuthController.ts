import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { RateLimiter } from '../utils/RateLimiter';
import { SessionManager } from '../services/SessionManager';
import { ErrorType } from '../types/errors';
import { ErrorMessages } from '../constants/errorMessages';
import { AppError, ValidationError, AuthError } from '../types/errors';
import { generateToken, generateRefreshToken } from '../utils/auth';
import bcrypt from 'bcrypt';
import { createLogger } from '../utils/logger';
import { getErrorMessage } from '../constants/errorMessages';

const logger = createLogger('AuthController');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

interface SignupData {
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

export class AuthController {
  private static instance: AuthController;
  private rateLimiter: RateLimiter;
  private sessionManager: SessionManager;

  private constructor() {
    this.rateLimiter = RateLimiter.getInstance();
    this.sessionManager = SessionManager.getInstance();
  }

  public static getInstance(): AuthController {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController();
    }
    return AuthController.instance;
  }

  private validatePassword(password: string): boolean {
    return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
  }

  public async signup(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as SignupData;
      logger.info('Starting signup process for email:', email);

      // レート制限のチェック
      if (!(await this.rateLimiter.isAllowed(email, 'signup'))) {
        logger.warn('Rate limit exceeded for signup:', email);
        throw new ValidationError(getErrorMessage(ErrorType.VALIDATION));
      }

      // 既存ユーザーのチェック
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        logger.warn('Signup attempt with existing email:', email);
        throw new ValidationError(getErrorMessage(ErrorType.DUPLICATE));
      }

      // パスワードのハッシュ化
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // ユーザーの作成
      const user = new User({
        email,
        password: hashedPassword
      });

      await user.save();

      // トークンの生成
      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role
      });

      const refreshToken = await generateRefreshToken(user._id.toString());
      await this.sessionManager.createSession(user._id.toString(), refreshToken);

      // レート制限のカウントを増やす
      await this.rateLimiter.increment(email, 'signup');

      logger.info('Signup successful for user:', user._id);
      res.status(201).json({
        message: 'ユーザー登録が完了しました。',
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        },
        token,
        refreshToken
      });

    } catch (error) {
      logger.error('Signup error:', error);

      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          message: error.message,
          type: error.type,
          details: error.details
        });
        return;
      }

      res.status(500).json({
        message: getErrorMessage(ErrorType.SERVER),
        type: ErrorType.SERVER
      });
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as LoginData;
      logger.info('Starting login process for email:', email);

      // レート制限のチェック
      if (!(await this.rateLimiter.isAllowed(email, 'login'))) {
        logger.warn('Rate limit exceeded for login:', email);
        throw new ValidationError(getErrorMessage(ErrorType.VALIDATION));
      }

      // ユーザーの検索
      const user = await User.findOne({ email });
      if (!user) {
        logger.warn('Invalid login attempt - user not found:', email);
        throw new AuthError(getErrorMessage(ErrorType.AUTHENTICATION));
      }

      // パスワードの検証
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        logger.warn('Invalid login attempt - wrong password:', email);
        throw new AuthError(getErrorMessage(ErrorType.AUTHENTICATION));
      }

      // レート制限のカウントを増やす
      await this.rateLimiter.increment(email, 'login');

      // トークンの生成
      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role
      });

      const refreshToken = await generateRefreshToken(user._id.toString());
      await this.sessionManager.createSession(user._id.toString(), refreshToken);

      logger.info('Login successful for user:', user._id);
      res.status(200).json({
        message: 'ログインに成功しました。',
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        },
        token,
        refreshToken
      });

    } catch (error) {
      logger.error('Login error:', error);

      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          message: error.message,
          type: error.type,
          details: error.details
        });
        return;
      }

      res.status(500).json({
        message: getErrorMessage(ErrorType.SERVER),
        type: ErrorType.SERVER
      });
    }
  }

  public async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AuthError(getErrorMessage(ErrorType.AUTHENTICATION));
      }

      await this.sessionManager.removeSession(userId);
      logger.info('Logout successful for user:', userId);

      res.status(200).json({
        message: 'ログアウトしました。'
      });

    } catch (error) {
      logger.error('Logout error:', error);

      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          message: error.message,
          type: error.type,
          details: error.details
        });
        return;
      }

      res.status(500).json({
        message: getErrorMessage(ErrorType.SERVER),
        type: ErrorType.SERVER
      });
    }
  }

  public async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new AuthError(getErrorMessage(ErrorType.AUTHENTICATION));
      }

      const userId = await this.sessionManager.validateSession(refreshToken);
      if (!userId) {
        throw new AuthError(getErrorMessage(ErrorType.AUTHENTICATION));
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new AuthError(getErrorMessage(ErrorType.AUTHENTICATION));
      }

      const newToken = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role
      });

      const newRefreshToken = await generateRefreshToken(user._id.toString());
      await this.sessionManager.updateSession(userId, newRefreshToken);

      logger.info('Token refresh successful for user:', userId);
      res.status(200).json({
        token: newToken,
        refreshToken: newRefreshToken
      });

    } catch (error) {
      logger.error('Token refresh error:', error);

      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          message: error.message,
          type: error.type,
          details: error.details
        });
        return;
      }

      res.status(500).json({
        message: getErrorMessage(ErrorType.SERVER),
        type: ErrorType.SERVER
      });
    }
  }
}
