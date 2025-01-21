import { Router } from 'express';
import { validateSignupInput, validateLoginInput, validateRefreshToken } from '../middleware/validation';
import { AuthController } from '../controllers/AuthController';
import { createLogger } from '../utils/logger';
import { ErrorType } from '../types/errors';
import { AppError, AuthError } from '../types/errors';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const router = Router();
const authController = AuthController.getInstance();
const logger = createLogger('AuthRoutes');

// サインアップ
router.post('/signup', validateSignupInput, async (req, res) => {
  try {
    await authController.signup(req, res);
  } catch (error) {
    logger.error('Signup route error:', error);
    if (error instanceof AppError || error instanceof AuthError) {
      res.status(error.statusCode || 400).json({
        message: error.message,
        type: error.type
      });
      return;
    }
    res.status(500).json({
      message: 'サーバーエラーが発生しました。',
      type: ErrorType.SERVER
    });
  }
});

// ログイン
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt for:', req.body.email);
    const { email, password } = req.body;

    // ユーザーの存在確認
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ 
        message: 'メールアドレスまたはパスワードが正しくありません。' 
      });
    }

    console.log('User found:', user.email);
    console.log('Stored password hash:', user.password);
    console.log('Provided password:', password);

    // パスワードが存在することを確認
    if (!user.password || !password) {
      console.log('Password missing');
      return res.status(401).json({ 
        message: 'メールアドレスまたはパスワードが正しくありません。' 
      });
    }

    // パスワードの検証
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password validation result:', isValidPassword);

    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ 
        message: 'メールアドレスまたはパスワードが正しくありません。' 
      });
    }

    // JWTトークンの生成
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('Login successful for:', email);
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});

// ログアウト
router.post('/logout', async (req, res) => {
  try {
    await authController.logout(req, res);
  } catch (error) {
    logger.error('Logout route error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode || 400).json({
        message: error.message,
        type: error.type
      });
      return;
    }
    res.status(500).json({
      message: 'サーバーエラーが発生しました。',
      type: ErrorType.SERVER
    });
  }
});

// トークンのリフレッシュ
router.post('/refresh-token', validateRefreshToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await authController.refreshToken(refreshToken);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Token refresh route error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode || 400).json({
        message: error.message,
        type: error.type
      });
      return;
    }
    res.status(500).json({
      message: 'サーバーエラーが発生しました。',
      type: ErrorType.SERVER
    });
  }
});

export default router;
