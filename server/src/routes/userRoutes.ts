import express from 'express';
import { User } from '../models/User';
import { authenticateToken } from '../middleware/auth';
import { AppError, ErrorType, ValidationError, NotFoundError, DatabaseError } from '../types/errors';
import { ErrorMessages } from '../constants/errorMessages';
import bcrypt from 'bcryptjs';

const router = express.Router();

// 画像バリデーション用の定数
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Base64画像のバリデーション関数
const validateImage = (base64Image: string): { isValid: boolean; error?: string } => {
  if (!base64Image.startsWith('data:image/')) {
    return { isValid: false, error: '無効な画像形式です' };
  }

  const sizeInBytes = Buffer.from(base64Image.split(',')[1], 'base64').length;
  const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

  if (sizeInBytes > maxSizeInBytes) {
    return { isValid: false, error: '画像サイズが大きすぎます（最大5MB）' };
  }

  return { isValid: true };
};

// 全ユーザー削除（開発用）
router.get('/db/reset', async (req, res) => {
  try {
    await User.deleteMany({}); // 全ユーザーを削除

    // 管理者ユーザーを作成
    const admin = new User({
      email: 'admin@fortune-telling.com',
      password: 'Admin123!',  // パスワードは平文で設定（モデルのpre('save')ミドルウェアでハッシュ化される）
      name: '管理者',
      role: 'admin',
      isSubscribed: true,
      subscriptionType: 'premium',
      subscriptionEndDate: new Date('2025-12-31')
    });

    await admin.save();
    
    res.json({
      message: 'Database reset successful',
      adminCredentials: {
        email: 'admin@fortune-telling.com',
        password: 'Admin123!'
      }
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DBの全ユーザー情報を取得（管理者用）
router.get('/db/all', async (req, res) => {
  try {
    const users = await User.find({});
    res.json({
      total: users.length,
      users: users.map(user => ({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ユーザーを削除（管理者用）
router.delete('/db/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 全ユーザー情報を取得（管理者用）
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // パスワードは除外
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ユーザー情報の取得
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id, { password: 0 });
    if (!user) {
      throw new AppError({
        statusCode: 404,
        message: ErrorMessages.NOT_FOUND,
        type: ErrorType.NOT_FOUND_ERROR
      });
    }
    res.json(user);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new DatabaseError(ErrorMessages.SERVER_ERROR);
  }
});

// ユーザー情報の更新
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { name, birthDate, gender, profileImage } = req.body;

    // 入力値の検証
    if (!name || !birthDate || !gender) {
      throw new ValidationError(ErrorMessages.VALIDATION_ERROR, ['必須項目が入力されていません']);
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new AppError({
        statusCode: 404,
        message: ErrorMessages.NOT_FOUND,
        type: ErrorType.NOT_FOUND_ERROR
      });
    }

    // 画像のバリデーション
    if (profileImage) {
      const imageValidation = validateImage(profileImage);
      if (!imageValidation.isValid) {
        throw new ValidationError(ErrorMessages.VALIDATION_ERROR, [imageValidation.error || '画像が無効です']);
      }
    }

    // 日付のバリデーション
    const formattedBirthDate = birthDate ? new Date(birthDate) : undefined;
    if (formattedBirthDate && isNaN(formattedBirthDate.getTime())) {
      throw new ValidationError(ErrorMessages.VALIDATION_ERROR, ['無効な日付形式です']);
    }

    // ユーザー情報の更新
    Object.assign(user, {
      name,
      birthDate: formattedBirthDate,
      gender,
      profileImage,
      updatedAt: new Date()
    });

    await user.save();
    res.json({
      message: 'ユーザー情報を更新しました',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        birthDate: user.birthDate,
        gender: user.gender,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new DatabaseError(ErrorMessages.SERVER_ERROR);
  }
});

// テストユーザーの一括削除（管理者用）- GET版
router.get('/db/cleanup', async (req, res) => {
  try {
    // test@example.comやtest_で始まるメールアドレスのユーザーを削除
    const result = await User.deleteMany({
      email: {
        $regex: '^test',
      }
    });
    
    res.json({
      message: 'Test users cleaned up successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error cleaning up test users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// サブスクリプション状態の取得
router.get('/subscription/status', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new AppError({
        statusCode: 404,
        message: ErrorMessages.NOT_FOUND,
        type: ErrorType.NOT_FOUND_ERROR
      });
    }

    res.json({
      isSubscribed: user.isSubscribed,
      plan: user.subscriptionPlan,
      endDate: user.subscriptionEndDate
    });
  } catch (error) {
    next(error);
  }
});

export default router; 