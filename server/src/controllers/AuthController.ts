import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { RateLimiter } from '../utils/RateLimiter';
import { SessionManager } from '../utils/SessionManager';
import { ErrorType } from '../types/errors';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const loginLimiter = new RateLimiter(5, 60 * 1000); // 1分間に5回まで
const sessionManager = new SessionManager();

export class AuthController {
  static async signup(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          type: ErrorType.INVALID_CREDENTIALS,
          message: 'メールアドレスとパスワードは必須です。'
        });
      }

      // パスワードの強度チェック
      if (!AuthController.validatePassword(password)) {
        return res.status(400).json({
          type: ErrorType.INVALID_CREDENTIALS,
          message: 'パスワードは8文字以上で、大文字、小文字、数字を含める必要があります。'
        });
      }

      // 既存ユーザーチェック
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          type: ErrorType.INVALID_CREDENTIALS,
          message: 'このメールアドレスは既に登録されています。'
        });
      }

      // 新規ユーザー作成
      const newUser = new User({ email, password });
      await newUser.save();

      // トークン発行
      const token = AuthController.generateToken(newUser);
      await sessionManager.createSession(newUser._id.toString(), token);

      res.status(201).json({
        message: 'ユーザーが正常に作成されました',
        token,
        user: {
          email: newUser.email,
          isSubscribed: newUser.isSubscribed,
        },
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        type: ErrorType.SERVER_ERROR,
        message: 'サーバーエラーが発生しました。'
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      // レート制限チェック
      if (!loginLimiter.tryRequest(req.ip)) {
        return res.status(429).json({
          type: ErrorType.RATE_LIMIT_EXCEEDED,
          message: 'ログイン試行回数が多すぎます。しばらく時間をおいて再度お試しください。'
        });
      }

      if (!email || !password) {
        return res.status(400).json({
          type: ErrorType.INVALID_CREDENTIALS,
          message: 'メールアドレスとパスワードは必須です。'
        });
      }

      // ユーザー検索
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          type: ErrorType.INVALID_CREDENTIALS,
          message: 'メールアドレスまたはパスワードが正しくありません。'
        });
      }

      // パスワード検証
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          type: ErrorType.INVALID_CREDENTIALS,
          message: 'メールアドレスまたはパスワードが正しくありません。'
        });
      }

      // 既存のセッションを無効化
      await sessionManager.invalidateUserSessions(user._id.toString());

      // 新しいトークンを発行
      const token = AuthController.generateToken(user);
      await sessionManager.createSession(user._id.toString(), token);

      res.json({
        message: 'ログインに成功しました',
        token,
        user: {
          email: user.email,
          isSubscribed: user.isSubscribed,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        type: ErrorType.SERVER_ERROR,
        message: 'サーバーエラーが発生しました。'
      });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        await sessionManager.invalidateSession(token);
      }
      res.json({ message: 'ログアウトに成功しました' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        type: ErrorType.SERVER_ERROR,
        message: 'サーバーエラーが発生しました。'
      });
    }
  }

  static async validateSession(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({
          type: ErrorType.INVALID_TOKEN,
          message: 'トークンが提供されていません。'
        });
      }

      const isValid = await sessionManager.validateSession(token);
      if (!isValid) {
        return res.status(401).json({
          type: ErrorType.SESSION_EXPIRED,
          message: 'セッションが無効または期限切れです。'
        });
      }

      res.json({ valid: true });
    } catch (error) {
      console.error('Session validation error:', error);
      res.status(500).json({
        type: ErrorType.SERVER_ERROR,
        message: 'サーバーエラーが発生しました。'
      });
    }
  }

  private static generateToken(user: any): string {
    return jwt.sign(
      {
        userId: user._id,
        email: user.email,
        isSubscribed: user.isSubscribed
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  private static validatePassword(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers;
  }
}
