import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../index';
import { User } from '../models/User';
import { describe, it, beforeAll, afterAll, beforeEach, expect } from '@jest/globals';
import { connectDB, cleanupTestDB } from '../db';

describe('認証テスト', () => {
  beforeAll(async () => {
    await connectDB();
    console.log('Test database connected');
  });

  afterAll(async () => {
    await mongoose.connection.close();
    console.log('Test database connection closed');
  });

  beforeEach(async () => {
    await cleanupTestDB();
    console.log('Test database cleaned');
  });

  describe('新規登録', () => {
    it('有効なデータで登録が成功すること', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('既存のメールアドレスで登録を試みると失敗すること', async () => {
      // 最初のユーザーを作成
      await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });

      // 同じメールアドレスで再度登録を試みる
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password456',
          name: 'Another User'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('無効なメールアドレスで登録を試みると失敗すること', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('ログイン', () => {
    beforeEach(async () => {
      // テストユーザーを作成
      await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });
    });

    it('有効な認証情報でログインが成功すること', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('無効なパスワードでログインを試みると失敗すること', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('存在しないメールアドレスでログインを試みると失敗すること', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 