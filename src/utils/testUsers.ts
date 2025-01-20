// テストユーザー用の8桁パスワードリスト
export const TEST_USER_PASSWORDS = [
  '12345678',
  '23456789',
  '34567890',
  '45678901',
  '56789012',
  '67890123',
  '78901234',
  '89012345',
  '90123456',
  '01234567',
  '13579246',
  '24680135',
  '98765432',
  '87654321',
  '76543210',
  '65432109',
  '54321098',
  '43210987',
  '32109876',
  '21098765'
];

export function validateTestUserPassword(password: string): boolean {
  return TEST_USER_PASSWORDS.includes(password);
} 