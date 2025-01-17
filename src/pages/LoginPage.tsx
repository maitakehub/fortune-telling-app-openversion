import React, { useState } from 'react';
import { useAuth } from '@/auth/useAuth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthError, ErrorType } from '@/types/errors';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // ログイン前のページ情報を取得
  const from = location.state?.from?.pathname || '/fortune';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      // ログイン前のページに戻る
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof AuthError) {
        if (err.type === ErrorType.INVALID_CREDENTIALS) {
          setError('メールアドレスまたはパスワードが正しくありません。');
        } else {
          setError(err.message);
        }
      } else {
        setError('ログインに失敗しました。しばらく時間をおいて再度お試しください。');
      }
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 px-4 py-8">
      <div className="w-full max-w-sm sm:max-w-md space-y-4">
        <form onSubmit={handleLogin} className="bg-purple-950/50 backdrop-blur-sm p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-xl border border-purple-800/30 space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-200 to-amber-200 mb-2 sm:mb-4">ログイン</h2>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 sm:p-4">
              <p className="text-red-400 text-center text-sm sm:text-base">{error}</p>
            </div>
          )}
          <div>
            <label className="text-purple-200 block mb-1 sm:mb-2 text-sm sm:text-base">メールアドレス</label>
            <input
              type="email"
              className="w-full p-2 sm:p-3 rounded-lg bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="text-purple-200 block mb-1 sm:mb-2 text-sm sm:text-base">パスワード</label>
            <input
              type="password"
              className="w-full p-2 sm:p-3 rounded-lg bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm sm:text-base"
          >
            ログイン
          </button>
          <div className="text-center mt-2 sm:mt-4">
            <Link
              to="/password-reset"
              className="text-purple-200 hover:text-purple-100 transition-colors text-xs sm:text-sm"
            >
              パスワードをお忘れですか？
            </Link>
          </div>
        </form>
        <div className="text-center">
          <p className="text-purple-200 text-sm sm:text-base">
            アカウントをお持ちでない方は{' '}
            <Link to="/signup" className="text-amber-200 hover:text-amber-300 transition-colors ml-1">
              新規登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
