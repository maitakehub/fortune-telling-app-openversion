/**
 * メールアドレスのバリデーション
 */
export const validateEmail = (email: string): boolean => {
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return EMAIL_REGEX.test(email);
};

/**
 * パスワードのバリデーション
 * - 8文字以上
 * - 英字と数字を含む
 */
export const validatePassword = (password: string): boolean => {
  const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return PASSWORD_REGEX.test(password);
}; 