import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { requestPasswordReset, validateResetToken, resetPassword } from '../auth/AuthService';
import { toast } from 'react-toastify';

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

export const PasswordReset: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [formState, setFormState] = useState<FormState>({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      if (token) {
        try {
          const isValid = await validateResetToken(token);
          setTokenValid(isValid);
        } catch (err) {
          console.error('Token validation failed:', err);
          setTokenValid(false);
        }
      }
    };

    if (token) {
      checkToken();
    }
  }, [token]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!token && !formState.email) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!token && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (token) {
      if (!formState.newPassword) {
        newErrors.newPassword = '新しいパスワードを入力してください';
      } else if (formState.newPassword.length < 8) {
        newErrors.newPassword = 'パスワードは8文字以上である必要があります';
      }

      if (!formState.confirmPassword) {
        newErrors.confirmPassword = 'パスワードを確認してください';
      } else if (formState.newPassword !== formState.confirmPassword) {
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
    try {
      if (token) {
        // パスワードのリセット
        await resetPassword(token, formState.newPassword);
        toast.success('パスワードが正常に更新されました');
        navigate('/login');
      } else {
        // リセットリンクの送信
        await requestPasswordReset(formState.email);
        toast.success('パスワードリセットのリンクをメールで送信しました');
      }
    } catch (err) {
      console.error('Password reset failed:', err);
      setErrors({
        general: err instanceof Error ? err.message : 'パスワードのリセットに失敗しました'
      });
      toast.error('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    // 入力時にエラーをクリア
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  if (token && !tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              無効なリンク
            </h2>
            <p className="text-gray-600 mb-6">
              このパスワードリセットリンクは無効であるか、期限が切れています。
            </p>
            <button
              onClick={() => navigate('/password-reset')}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              新しいリセットリンクを要求
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {token ? 'パスワードの再設定' : 'パスワードリセット'}
          </h2>
          <p className="text-gray-600 mt-2">
            {token
              ? '新しいパスワードを入力してください'
              : 'パスワードリセットのリンクをメールで送信します'}
          </p>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!token && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formState.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          )}

          {token && (
            <>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  新しいパスワード
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formState.newPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  パスワードの確認
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formState.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {loading
              ? (token ? 'パスワードを更新中...' : 'リンクを送信中...')
              : (token ? 'パスワードを更新' : 'リセットリンクを送信')}
          </button>
        </form>
      </div>
    </div>
  );
}; 