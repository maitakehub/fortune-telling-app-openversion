import { describe, test, expect } from '@jest/globals';
import { generateToken, verifyToken, hashPassword, comparePassword } from '../utils/auth';
import { ErrorMessages } from '../constants/errorMessages';
import { TokenPayload } from '../types/auth';
import { ErrorType } from '../types/errors';

describe('Auth Utils', () => {
  const mockPayload: TokenPayload = {
    userId: '123',
    email: 'test@example.com',
    role: 'user',
    isSubscribed: false
  };

  test('generateToken should create a valid JWT token', () => {
    const token = generateToken(mockPayload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  test('verifyToken should correctly decode a valid token', () => {
    const token = generateToken(mockPayload);
    const decoded = verifyToken(token);
    expect(decoded).toMatchObject(mockPayload);
  });

  test('verifyToken should throw error for invalid token', () => {
    expect(() => verifyToken('invalid-token')).toThrow();
  });

  test('verifyToken should throw error for expired token', async () => {
    const token = generateToken(mockPayload, '1ms');
    await new Promise(resolve => setTimeout(resolve, 2));
    expect(() => verifyToken(token)).toThrow();
  });

  describe('パスワード管理', () => {
    it('パスワードが正しくハッシュ化されること', async () => {
      const password = 'testPassword123';
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/); // bcryptハッシュのパターン
    });

    it('パスワードの比較が正しく機能すること', async () => {
      const password = 'testPassword123';
      const hashedPassword = await hashPassword(password);

      const isValid = await comparePassword(password, hashedPassword);
      expect(isValid).toBe(true);

      const isInvalid = await comparePassword('wrongPassword', hashedPassword);
      expect(isInvalid).toBe(false);
    });

    it('異なるパスワードで異なるハッシュが生成されること', async () => {
      const password1 = 'testPassword123';
      const password2 = 'testPassword456';

      const hash1 = await hashPassword(password1);
      const hash2 = await hashPassword(password2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('トークン管理', () => {
    it('無効なトークンでエラーが発生すること', () => {
      const invalidToken = 'invalid.token.string';

      expect(() => {
        verifyToken(invalidToken);
      }).toThrow(ErrorMessages.TOKEN_INVALID);
    });

    it('改ざんされたトークンでエラーが発生すること', () => {
      const token = generateToken(mockPayload);
      const [header, payload, signature] = token.split('.');
      const tamperedToken = `${header}.${payload}modified.${signature}`;

      expect(() => {
        verifyToken(tamperedToken);
      }).toThrow(ErrorMessages.TOKEN_INVALID);
    });
  });
}); 