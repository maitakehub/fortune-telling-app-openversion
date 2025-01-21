import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { createLogger } from '../utils/logger';

const logger = createLogger('CreateTestUser');

async function createTestUser() {
  try {
    // MongoDBに接続
    await mongoose.connect('mongodb://localhost:27017/fortune-telling');
    logger.info('Connected to MongoDB');

    // テストユーザーのパスワードをハッシュ化
    const password = 'Test123456';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 既存のテストユーザーを削除
    await User.deleteOne({ email: 'test@example.com' });

    // テストユーザーを作成
    const testUser = new User({
      email: 'test@example.com',
      password: hashedPassword,
      role: 'user',
      isSubscribed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await testUser.save();
    logger.info('Test user created successfully');

  } catch (error) {
    logger.error('Failed to create test user:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

createTestUser().catch(console.error); 