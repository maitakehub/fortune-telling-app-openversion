import { validateEmail, validatePassword } from '../validation';

describe('validateEmail', () => {
  test('正しいメールアドレスを検証', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co.jp')).toBe(true);
  });

  test('不正なメールアドレスを検証', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('test@example')).toBe(false);
  });
});

describe('validatePassword', () => {
  test('正しいパスワードを検証', () => {
    expect(validatePassword('Password123')).toBe(true);
    expect(validatePassword('abcd1234')).toBe(true);
  });

  test('不正なパスワードを検証', () => {
    expect(validatePassword('pass')).toBe(false); // 8文字未満
    expect(validatePassword('password')).toBe(false); // 数字なし
    expect(validatePassword('12345678')).toBe(false); // 英字なし
  });
}); 