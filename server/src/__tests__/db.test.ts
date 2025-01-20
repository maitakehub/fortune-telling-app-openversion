import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';
import mongoose from 'mongoose';
import { connectDB, testConnection, cleanupTestDB } from '../db';

describe('データベース接続テスト', () => {
  afterAll(async () => {
    await mongoose.connection.close();
    console.log('Test database connection closed');
  });

  describe('接続管理', () => {
    it('データベースに接続できること', async () => {
      const connection = await connectDB();
      expect(connection.connection.readyState).toBe(1);
      expect(mongoose.connection.readyState).toBe(1);
    });

    it('接続テストが成功すること', async () => {
      const isConnected = await testConnection();
      expect(isConnected).toBe(true);
    });

    it('無効な接続文字列でエラーになること', async () => {
      const originalUri = process.env.TEST_MONGODB_URI;
      process.env.TEST_MONGODB_URI = 'mongodb://invalid:27017/test';

      let error;
      try {
        await connectDB();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      process.env.TEST_MONGODB_URI = originalUri;
    });
  });

  describe('データベース操作', () => {
    beforeAll(async () => {
      await connectDB();
      console.log('Test database connected');
    });

    it('コレクションを作成できること', async () => {
      const testCollection = mongoose.connection.collection('test_collection');
      await testCollection.insertOne({ test: 'data' });

      const count = await testCollection.countDocuments();
      expect(count).toBe(1);
    });

    it('データベースのクリーンアップが機能すること', async () => {
      // テストデータを作成
      const testCollection = mongoose.connection.collection('test_collection');
      await testCollection.insertOne({ test: 'data' });

      // クリーンアップを実行
      await cleanupTestDB();

      // コレクションが空になっていることを確認
      const count = await testCollection.countDocuments();
      expect(count).toBe(0);
    });

    it('複数のコレクションを操作できること', async () => {
      const collection1 = mongoose.connection.collection('test_collection1');
      const collection2 = mongoose.connection.collection('test_collection2');

      await collection1.insertOne({ test: 'data1' });
      await collection2.insertOne({ test: 'data2' });

      const count1 = await collection1.countDocuments();
      const count2 = await collection2.countDocuments();

      expect(count1).toBe(1);
      expect(count2).toBe(1);

      // クリーンアップ
      await cleanupTestDB();

      const cleanCount1 = await collection1.countDocuments();
      const cleanCount2 = await collection2.countDocuments();

      expect(cleanCount1).toBe(0);
      expect(cleanCount2).toBe(0);
    });
  });
}); 