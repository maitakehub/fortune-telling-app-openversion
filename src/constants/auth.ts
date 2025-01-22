export const AUTH_CONSTANTS = {
  TOKEN_KEY: 'token',
  ERROR_MESSAGES: {
    INVALID_CREDENTIALS: '無効な認証情報です',
    RATE_LIMIT_EXCEEDED: 'アクセス制限を超えました',
    SESSION_EXPIRED: 'セッションが期限切れです',
    SERVER_ERROR: 'サーバーエラーが発生しました',
    INVALID_TOKEN: '無効なトークンです',
    STORAGE_ERROR: 'ストレージエラーが発生しました',
    REFRESH_TOKEN_MISSING: 'リフレッシュトークンがありません',
    REFRESH_TOKEN_INVALID: '無効なリフレッシュトークンです',
    UNAUTHORIZED: '認証が必要です'
  },
  SESSION: {
    DURATION: 3600000, // 1時間
    WARNING_TIME: 300000, // 5分前
    REFRESH_THRESHOLD: 600000, // 10分前
    ACTIVITY_THRESHOLD: 1800000 // 30分
  }
}; 