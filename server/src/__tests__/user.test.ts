import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { User } from '../models/User';
import { AppError, ErrorType } from '../types/errors';

describe('User Model', () => {
  const mockUser = {
    email: 'test@example.com',
    password: 'Password123',
    role: 'user',
    isSubscribed: false
  };

  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('should create a new user successfully', async () => {
    const user = new User(mockUser);
    const savedUser = await user.save();
    
    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(mockUser.email);
    expect(savedUser.role).toBe(mockUser.role);
    expect(savedUser.isSubscribed).toBe(mockUser.isSubscribed);
    expect(savedUser.password).not.toBe(mockUser.password); // パスワードがハッシュ化されていることを確認
  });

  test('should fail to create user with invalid email', async () => {
    const invalidUser = { ...mockUser, email: 'invalid-email' };
    const user = new User(invalidUser);

    try {
      await user.save();
      fail('Should have thrown validation error');
    } catch (error: unknown) {
      if (error instanceof Error) {
        expect(error.name).toBe('ValidationError');
      }
    }
  });

  test('should fail to create user with short password', async () => {
    const invalidUser = { ...mockUser, password: 'short' };
    const user = new User(invalidUser);

    try {
      await user.save();
      fail('Should have thrown validation error');
    } catch (error: unknown) {
      if (error instanceof Error) {
        expect(error.name).toBe('ValidationError');
      }
    }
  });

  test('should not allow duplicate emails', async () => {
    const user1 = new User(mockUser);
    await user1.save();

    const user2 = new User(mockUser);
    try {
      await user2.save();
      fail('Should have thrown duplicate key error');
    } catch (error: unknown) {
      if (error instanceof Error) {
        expect(error.name).toBe('MongoServerError');
        expect((error as any).code).toBe(11000);
      }
    }
  });

  test('should update user successfully', async () => {
    const user = new User(mockUser);
    const savedUser = await user.save();

    const updatedData = {
      email: 'updated@example.com',
      isSubscribed: true
    };

    const updatedUser = await User.findByIdAndUpdate(
      savedUser._id,
      updatedData,
      { new: true }
    );

    expect(updatedUser).toBeDefined();
    expect(updatedUser?.email).toBe(updatedData.email);
    expect(updatedUser?.isSubscribed).toBe(updatedData.isSubscribed);
  });

  test('should delete user successfully', async () => {
    const user = new User(mockUser);
    const savedUser = await user.save();

    await User.findByIdAndDelete(savedUser._id);
    const deletedUser = await User.findById(savedUser._id);

    expect(deletedUser).toBeNull();
  });

  test('should handle non-existent user', async () => {
    try {
      await User.findById('nonexistentid');
    } catch (error: unknown) {
      if (error instanceof AppError) {
        expect(error.type).toBe(ErrorType.NOT_FOUND_ERROR);
      }
    }
  });
}); 