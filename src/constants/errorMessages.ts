export const ErrorMessages = {
  REQUIRED_FIELDS: '必須項目を入力してください',
  INVALID_EMAIL: 'メールアドレスの形式が正しくありません',
  INVALID_PASSWORD: 'パスワードは8文字以上で、英字と数字を含める必要があります',
  PASSWORD_MISMATCH: 'パスワードが一致しません',
  DUPLICATE_EMAIL: 'このメールアドレスは既に登録されています',
  UNKNOWN_ERROR: '予期せぬエラーが発生しました',
  NETWORK_ERROR: 'ネットワークエラーが発生しました',
  SERVER_ERROR: 'サーバーエラーが発生しました',
  UNAUTHORIZED: '認証に失敗しました',
  SESSION_EXPIRED: 'セッションの有効期限が切れました',
} as const;

export type ErrorMessageType = typeof ErrorMessages[keyof typeof ErrorMessages]; 