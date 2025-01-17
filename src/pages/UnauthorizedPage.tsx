import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-purple-200 hover:text-purple-100 mb-8"
        >
          <ArrowLeft className="mr-2" size={20} />
          戻る
        </button>

        <div className="max-w-2xl mx-auto text-center">
          <Lock className="mx-auto mb-6 text-purple-300" size={64} />
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-200 to-amber-200 mb-4">
            アクセス権限がありません
          </h1>
          <p className="text-purple-200 text-lg mb-8">
            このページにアクセスするために必要な権限がありません。
          </p>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              ホームに戻る
            </button>
            <button
              onClick={() => navigate('/subscription')}
              className="block w-full px-6 py-2 bg-purple-800/50 text-purple-100 rounded-lg hover:bg-purple-800 transition-colors"
            >
              サブスクリプションプランを見る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 