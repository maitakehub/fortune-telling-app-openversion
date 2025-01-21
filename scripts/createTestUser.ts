import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

interface TestUser {
  email: string;
  password: string;
  role: 'user' | 'admin';
}

const testUsers: TestUser[] = [
  {
    email: 'test@example.com',
    password: 'password123',
    role: 'user'
  },
  {
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  }
];

async function createTestUsers() {
  let connection: typeof mongoose | null = null;
  
  try {
    console.log('MongoDB接続を試みています...');
    
    connection = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fortune-telling', {
      serverSelectionTimeoutMS: 30000, // タイムアウトを30秒に延長
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      waitQueueTimeoutMS: 30000,
    });
    
    console.log('MongoDB接続成功！');
    
    // User modelの定義
    const userSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, enum: ['user', 'admin'], default: 'user' }
    });

    // パスワードの暗号化
    userSchema.pre('save', async function(next) {
      if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
      }
      next();
    });

    const User = connection.model('User', userSchema);
    
    // 既存のユーザーを削除
    console.log('既存のユーザーを削除中...');
    await User.deleteMany({});
    console.log('既存のユーザーを削除しました');
    
    // テストユーザーを作成
    for (const userData of testUsers) {
      console.log(`${userData.email} を作成中...`);
      const user = new User(userData);
      await user.save();
      console.log(`ユーザーを作成しました：`);
      console.log('Email:', userData.email);
      console.log('Password:', userData.password); // オリジナルのパスワード
      console.log('Role:', userData.role);
      console.log('-------------------');
    }
    
    console.log('\nこれらの認証情報でログインできます。');
    
  } catch (error) {
    console.error('エラー:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.disconnect();
      console.log('MongoDB切断完了');
    }
  }
}

createTestUsers(); 