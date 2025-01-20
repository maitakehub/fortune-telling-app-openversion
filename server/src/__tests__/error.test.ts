import { describe, test, expect } from '@jest/globals';
import { AppError, ValidationError, AuthenticationError, NotFoundError, DatabaseError, DuplicateError, ErrorType } from '../types/errors';
import { ErrorMessages } from '../constants/errorMessages';

describe('エラークラステスト', () => {
  describe('AppError', () => {
    test('基本的なエラー情報が正しく設定されること', () => {
      const options = {
        statusCode: 400,
        message: ErrorMessages.VALIDATION_ERROR,
        type: ErrorType.VALIDATION_ERROR
      };

      const error = new AppError(options);
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(options.statusCode);
      expect(error.message).toBe(options.message);
      expect(error.type).toBe(options.type);
      expect(error.name).toBe('AppError');
    });

    test('エラー詳細が設定できること', () => {
      const options = {
        statusCode: 400,
        message: ErrorMessages.VALIDATION_ERROR,
        type: ErrorType.VALIDATION_ERROR,
        details: ['エラー詳細1', 'エラー詳細2']
      };

      const error = new AppError(options);
      expect(error.details).toEqual(options.details);
    });

    test('スタックトレースが生成されること', () => {
      const options = {
        statusCode: 500,
        message: ErrorMessages.SERVER_ERROR,
        type: ErrorType.SERVER_ERROR
      };

      const error = new AppError(options);
      expect(error.stack).toBeDefined();
    });
  });

  describe('ValidationError', () => {
    test('デフォルトメッセージが設定されること', () => {
      const error = new ValidationError();
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe(ErrorMessages.VALIDATION_ERROR);
      expect(error.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(error.name).toBe('ValidationError');
    });

    test('カスタムメッセージと詳細が設定できること', () => {
      const customMessage = 'カスタムバリデーションエラー';
      const details = ['詳細1', '詳細2'];
      const error = new ValidationError(customMessage, details);
      
      expect(error.message).toBe(customMessage);
      expect(error.details).toEqual(details);
    });
  });

  describe('AuthenticationError', () => {
    test('デフォルトメッセージが設定されること', () => {
      const error = new AuthenticationError();
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe(ErrorMessages.UNAUTHORIZED);
      expect(error.type).toBe(ErrorType.AUTHENTICATION_ERROR);
      expect(error.name).toBe('AuthenticationError');
    });

    test('カスタムメッセージが設定できること', () => {
      const customMessage = 'カスタム認証エラー';
      const error = new AuthenticationError(customMessage);
      expect(error.message).toBe(customMessage);
    });
  });

  describe('NotFoundError', () => {
    test('デフォルトメッセージが設定されること', () => {
      const error = new NotFoundError();
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe(ErrorMessages.NOT_FOUND);
      expect(error.type).toBe(ErrorType.NOT_FOUND_ERROR);
      expect(error.name).toBe('NotFoundError');
    });

    test('カスタムメッセージが設定できること', () => {
      const customMessage = 'カスタム404エラー';
      const error = new NotFoundError(customMessage);
      expect(error.message).toBe(customMessage);
    });
  });

  describe('DatabaseError', () => {
    test('デフォルトメッセージが設定されること', () => {
      const error = new DatabaseError();
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe(ErrorMessages.DATABASE_ERROR);
      expect(error.type).toBe(ErrorType.SERVER_ERROR);
      expect(error.name).toBe('DatabaseError');
    });

    test('カスタムメッセージが設定できること', () => {
      const customMessage = 'カスタムデータベースエラー';
      const error = new DatabaseError(customMessage);
      expect(error.message).toBe(customMessage);
    });
  });

  describe('DuplicateError', () => {
    test('デフォルトメッセージが設定されること', () => {
      const error = new DuplicateError();
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe(ErrorMessages.DUPLICATE_EMAIL);
      expect(error.type).toBe(ErrorType.CONFLICT_ERROR);
      expect(error.name).toBe('DuplicateError');
    });

    test('カスタムメッセージが設定できること', () => {
      const customMessage = 'カスタム重複エラー';
      const error = new DuplicateError(customMessage);
      expect(error.message).toBe(customMessage);
    });
  });
}); 