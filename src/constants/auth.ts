export const AUTH_CONSTANTS = {
  TOKEN_KEY: 'authToken',
  ERROR_MESSAGES: {
    INVALID_CREDENTIALS: 'メールアドレスまたはパスワードが正しくありません。',
    RATE_LIMIT_EXCEEDED: 'ログイン試行回数が多すぎます。しばらく時間をおいて再度お試しください。',
    SESSION_EXPIRED: 'セッションが期限切れです。再度ログインしてください。',
    SERVER_ERROR: 'サーバーエラーが発生しました。しばらく時間をおいて再度お試しください。',
    INVALID_TOKEN: 'トークンが無効です。再度ログインしてください。',
    STORAGE_ERROR: 'ブラウザのストレージにアクセスできません。プライベートモードを無効にするか、別のブラウザをお試しください。',
    REFRESH_TOKEN_MISSING: 'リフレッシュトークンが見つかりません。再度ログインしてください。',
    REFRESH_TOKEN_INVALID: 'リフレッシュトークンが無効です。再度ログインしてください。',
    UNAUTHORIZED: '権限がありません。'
  },
  SESSION: {
    TIMEOUT: 30 * 60 * 1000, // 30分
    REFRESH_THRESHOLD: 5 * 60 * 1000, // 5分前にリフレッシュ
    WARNING_THRESHOLD: 5 * 60 * 1000, // 5分前に警告
    ACTIVITY_THRESHOLD: 5 * 60 * 1000 // 5分以内のアクティビティでセッション延長
  }
}; 