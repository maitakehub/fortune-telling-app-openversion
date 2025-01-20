import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';
import path from 'path';
import { beforeAll, beforeEach, afterAll } from '@jest/globals';

// テスト用の環境変数を読み込む
dotenv.config({ path: path.join(__dirname, '../.env.test') });

let mongoServer: MongoMemoryServer;

// テスト実行前の共通処理
beforeAll(async () => {
  try {
    // MongoMemoryServerの起動
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.TEST_MONGODB_URI = mongoUri;

    // データベース接続
    await mongoose.connect(mongoUri);
    console.log('Connected to in-memory MongoDB');
    console.log('MongoDB URI:', mongoUri);
    console.log('Connection state:', mongoose.connection.readyState);

  } catch (error) {
    console.error('Failed to connect to in-memory MongoDB:', error);
    throw error;
  }
});

// 各テストの前の処理
beforeEach(async () => {
  try {
    // 全コレクションをクリア
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
    console.log('All collections cleared');

  } catch (error) {
    console.error('Failed to clear collections:', error);
    throw error;
  }
});

// テスト実行後の共通処理
afterAll(async () => {
  try {
    // データベース接続を閉じる
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Database connection closed');
    }

    // MongoMemoryServerを停止
    if (mongoServer) {
      await mongoServer.stop();
      console.log('MongoMemoryServer stopped');
    }

  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  }
}); 