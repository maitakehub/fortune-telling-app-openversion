import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { toast } from 'react-toastify';
import { generateTestUserToken } from '../utils/testAuth';

interface TestUserAuthModalProps {
  onClose: () => void;
}

export default function TestUserAuthModal({ onClose }: TestUserAuthModalProps) {
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validatePassword = (pass: string): boolean => {
    // 8桁の数字とアルファベットの組み合わせを要求
    const hasNumber = /\d/.test(pass);
    const hasLetter = /[a-zA-Z]/.test(pass);
    const isEightChars = pass.length === 8;
    return hasNumber && hasLetter && isEightChars;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validatePassword(password)) {
      setError('パスワードは8桁の数字とアルファベットの組み合わせである必要があります');
      return;
    }

    setIsProcessing(true);
    try {
      const token = await generateTestUserToken(password);
      if (!token) {
        throw new Error('認証に失敗しました');
      }

      // テストユーザーとしてログイン
      await login('test@example.com', token);
      toast.success('テストユーザーとしてログインしました');
      navigate('/fortune');
      onClose();
    } catch (err) {
      console.error('Test user authentication failed:', err);
      setError('認証に失敗しました。正しいパスワードを入力してください。');
      toast.error('認証に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            テストユーザー認証
          </h3>
          <p className="text-gray-600 text-sm">
            テストユーザー用のパスワードを入力してください
          </p>
          <p className="text-gray-500 text-xs mt-1">
            ※8桁の数字とアルファベットの組み合わせ
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 text-gray-900"
              placeholder="パスワードを入力"
              maxLength={8}
            />
          </div>
          {error && (
            <div className="mb-4 text-red-500 text-sm text-center">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isProcessing}
            className={`w-full py-2 rounded-lg font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isProcessing ? '認証中...' : '認証する'}
          </button>
        </form>
      </div>
    </div>
  );
} 