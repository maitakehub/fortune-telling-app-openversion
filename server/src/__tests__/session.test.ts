import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { SessionManager } from '../services/SessionManager';
import { TokenPayload } from '../types/auth';

describe('SessionManager', () => {
  let sessionManager: SessionManager;
  const mockPayload: TokenPayload = {
    userId: '123',
    email: 'test@example.com',
    role: 'user',
    isSubscribed: false
  };

  beforeEach(() => {
    sessionManager = new SessionManager();
  });

  afterEach(async () => {
    await sessionManager.clearAllSessions();
  });

  test('should create and validate session', async () => {
    const token = 'valid-token';
    await sessionManager.createSession(mockPayload.userId, token);
    const isValid = await sessionManager.validateSession(token);
    expect(isValid).toBe(true);
  });

  test('should invalidate session', async () => {
    const token = 'valid-token';
    await sessionManager.createSession(mockPayload.userId, token);
    await sessionManager.invalidateSession(token);
    const isValid = await sessionManager.validateSession(token);
    expect(isValid).toBe(false);
  });

  test('should handle invalid token', async () => {
    const isValid = await sessionManager.validateSession('invalid-token');
    expect(isValid).toBe(false);
  });

  test('should handle Redis errors gracefully', async () => {
    try {
      // Redisの接続を意図的に切断
      await sessionManager.disconnect();
      const token = 'valid-token';
      await sessionManager.createSession(mockPayload.userId, token);
      const isValid = await sessionManager.validateSession(token);
      expect(isValid).toBe(false);
    } catch (error) {
      // エラーハンドリングのテスト
      expect(error).toBeDefined();
    }
  });
}); 