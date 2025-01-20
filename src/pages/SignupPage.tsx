import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { AuthError, ErrorType } from '../types/errors';

export default function SignupPage() {
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (password !== confirmPassword) {
        setError('パスワードが一致しません。');
        return;
      }

      await signup(email, password, confirmPassword);
      navigate('/personal-info');
    } catch (err) {
      console.error('Signup error:', err);
      if (err instanceof AuthError) {
        switch (err.type) {
          case ErrorType.VALIDATION:
            setError('入力内容が正しくありません。メールアドレスとパスワードを確認してください。');
            break;
          case ErrorType.DUPLICATE:
            setError('このメールアドレスは既に登録されています。別のメールアドレスを使用するか、ログインしてください。');
            break;
          case ErrorType.NETWORK:
            setError('ネットワークエラーが発生しました。インターネット接続を確認してください。');
            break;
          default:
            setError('新規登録に失敗しました。しばらく時間をおいて再度お試しください。');
        }
      } else {
        setError('予期せぬエラーが発生しました。しばらく時間をおいて再度お試しください。');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSignup}
          className="bg-purple-950/50 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-800/30 p-8 space-y-6"
          data-testid="signup-form"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-200 to-amber-200">
              新規登録
            </h2>
            <p className="mt-2 text-purple-200">
              アカウントを作成して、占いの世界へようこそ
            </p>
          </div>

          {error && (
            <div
              className="bg-red-500/10 border border-red-500/50 rounded-lg p-4"
              data-testid="error-message"
            >
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="text-purple-200 block mb-1 font-medium">
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                data-testid="email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-white/90 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="example@email.com"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="text-purple-200 block mb-1 font-medium">
                パスワード
              </label>
              <input
                type="password"
                id="password"
                data-testid="password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white/90 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="8文字以上の英数字"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="text-purple-200 block mb-1 font-medium">
                パスワード（確認）
              </label>
              <input
                type="password"
                id="confirmPassword"
                data-testid="confirm-password-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white/90 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="パスワードを再入力"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            data-testid="signup-button"
            className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-100"
          >
            新規登録
          </button>

          <p className="text-center text-purple-300 mt-4">
            すでにアカウントをお持ちの方は{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 underline">
              ログイン
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

