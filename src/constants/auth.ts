export const AUTH_CONSTANTS = {
  TOKEN_KEY: 'authToken',
  ERROR_MESSAGES: {
    INVALID_CREDENTIALS: 'メールアドレスまたはパスワードが正しくありません。',
    RATE_LIMIT_EXCEEDED: 'ログイン試行回数が多すぎます。しばらく時間をおいて再度お試しください。',
    SESSION_EXPIRED: 'セッションが期限切れです。再度ログインしてください。',
    SERVER_ERROR: 'サーバーエラーが発生しました。しばらく時間をおいて再度お試しください。',
    INVALID_TOKEN: 'トークンが無効です。再度ログインしてください。'
  }
}; 