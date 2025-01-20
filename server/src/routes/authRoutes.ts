import { Router } from 'express';
import { validateSignupInput, validateLoginInput, validateRefreshToken } from '../middleware/validation';
import { AuthController } from '../controllers/AuthController';
import { createLogger } from '../utils/logger';
import { ErrorType } from '../types/errors';
import { AppError, AuthError } from '../types/errors';

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
router.post('/login', validateLoginInput, async (req, res) => {
  try {
    await authController.login(req, res);
  } catch (error) {
    logger.error('Login route error:', error);
    if (error instanceof AppError || error instanceof AuthError) {
      res.status(error.statusCode || 401).json({
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
