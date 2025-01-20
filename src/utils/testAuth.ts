import { FortuneError } from '../types';

const TEST_USER_SALT = import.meta.env.VITE_TEST_USER_SALT || 'default-salt';
const TEST_USER_ITERATIONS = 1000;
const TEST_USER_KEYLEN = 64;
const TEST_USER_DIGEST = 'sha512';

/**
 * 文字列をUint8Arrayに変換
 */
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * ArrayBufferを16進数文字列に変換
 */
function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * テストユーザーのトークンを生成する
 * @param password テストユーザーのパスワード
 * @returns 生成されたトークン、または認証失敗時はnull
 */
export async function generateTestUserToken(password: string): Promise<string | null> {
  try {
    // パスワードとソルトを結合してハッシュ化
    const data = stringToUint8Array(password + TEST_USER_SALT);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hash = arrayBufferToHex(hashBuffer);

    // 現在の時刻を含めたトークンの生成
    const timestamp = Date.now();
    const tokenData = stringToUint8Array(`${hash}${timestamp}${TEST_USER_SALT}`);
    const tokenBuffer = await crypto.subtle.digest('SHA-256', tokenData);
    const token = arrayBufferToHex(tokenBuffer);

    return token;
  } catch (err) {
    console.error('Token generation failed:', err);
    return null;
  }
}

/**
 * テストユーザーのトークンを検証する
 * @param token 検証するトークン
 * @returns 検証結果
 */
export async function validateTestUserToken(token: string): Promise<boolean> {
  try {
    // トークンの形式を検証
    if (!/^[a-f0-9]{64}$/.test(token)) {
      return false;
    }

    // トークンの有効期限を検証（24時間）
    const timestamp = parseInt(token.substring(0, 13), 16);
    const now = Date.now();
    if (now - timestamp > 24 * 60 * 60 * 1000) {
      return false;
    }

    return true;
  } catch (err) {
    console.error('Token validation failed:', err);
    return false;
  }
}

/**
 * テストユーザーのパスワードを検証する
 * @param password 検証するパスワード
 * @returns 検証結果
 */
export function validateTestUserPassword(password: string): boolean {
  // 8桁の数字とアルファベットの組み合わせを要求
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  const isEightChars = password.length === 8;
  return hasNumber && hasLetter && isEightChars;
} 