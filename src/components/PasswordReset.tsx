import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { requestPasswordReset, validateResetToken, resetPassword } from '../auth/AuthService';

interface FormState {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

export function PasswordReset() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormState>({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!token && !formData.email) {
      newErrors.email = 'メールアドレスを入力してください';
    }
    if (token) {
      if (!formData.newPassword) {
        newErrors.newPassword = '新しいパスワードを入力してください';
      } else if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'パスワードは8文字以上である必要があります';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'パスワードが一致しません';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage('');
    setErrors({});

    try {
      if (!token) {
        // パスワードリセットメールの送信
        await requestPasswordReset(formData.email);
        setMessage('パスワードリセットの手順をメールで送信しました');
      } else {
        // トークンの検証とパスワードの更新
        const isValid = await validateResetToken(token);
        if (!isValid) {
          setErrors({ general: '無効または期限切れのトークンです' });
          return;
        }
        await resetPassword(token, formData.newPassword);
        setMessage('パスワードが正常に更新されました');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'エラーが発生しました'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm sm:max-w-md w-full space-y-6 sm:space-y-8">
        <div>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            {token ? 'パスワードの再設定' : 'パスワードリセット'}
          </h2>
        </div>
        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="rounded-md bg-red-50 p-3 sm:p-4">
              <div className="text-sm text-red-700">{errors.general}</div>
            </div>
          )}
          {message && (
            <div className="rounded-md bg-green-50 p-3 sm:p-4">
              <div className="text-sm text-green-700">{message}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            {!token && (
              <div>
                <label htmlFor="email" className="sr-only">メールアドレス</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 sm:py-3 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-sm sm:text-base`}
                  placeholder="メールアドレス"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <p className="mt-2 text-xs sm:text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            )}
            {token && (
              <>
                <div>
                  <label htmlFor="newPassword" className="sr-only">新しいパスワード</label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className={`appearance-none rounded-md relative block w-full px-3 py-2 sm:py-3 border ${
                      errors.newPassword ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-sm sm:text-base mb-3 sm:mb-4`}
                    placeholder="新しいパスワード"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                  {errors.newPassword && (
                    <p className="mt-2 text-xs sm:text-sm text-red-600">{errors.newPassword}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="sr-only">パスワードの確認</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className={`appearance-none rounded-md relative block w-full px-3 py-2 sm:py-3 border ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-sm sm:text-base`}
                    placeholder="パスワードの確認"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-2 text-xs sm:text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 sm:py-3 px-4 sm:px-6 border border-transparent text-sm sm:text-base font-medium rounded-md text-white ${
                loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {loading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : null}
              {token ? 'パスワードを更新' : 'リセットメールを送信'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 