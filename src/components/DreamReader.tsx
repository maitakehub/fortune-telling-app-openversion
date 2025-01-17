import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateDreamReading } from '../utils/dream';
import { useNavigate } from 'react-router-dom';

interface DreamReaderProps {
  onSave?: (reading: any) => void;
  onFeedback?: (feedback: string) => void;
}

export default function DreamReader({ onSave, onFeedback }: DreamReaderProps) {
  const navigate = useNavigate();
  const [dreamContent, setDreamContent] = useState('');
  const [reading, setReading] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!dreamContent.trim()) {
      setError('夢の内容を入力してください');
      return;
    }

    try {
      setError('');
      setIsLoading(true);

      // AI解釈の生成
      const result = await generateDreamReading(dreamContent);
      setReading(result);

    } catch (err) {
      setError('夢の解析中にエラーが発生しました。もう一度お試しください。');
      console.error('Dream reading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 結果の保存
  const handleSave = () => {
    if (reading && onSave) {
      onSave({
        type: 'dream',
        content: dreamContent,
        reading,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-100 text-center flex-grow">夢の中のメッセージを解読</h1>
        <button
          onClick={() => navigate('/fortune')}
          className="px-4 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          占い選択に戻る
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-center">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 夢の内容入力 */}
        <div>
          <label className="block text-purple-200 mb-2">
            夢の内容
            <span className="text-purple-400 text-sm ml-2">
              できるだけ詳しく記述してください
            </span>
          </label>
          <textarea
            value={dreamContent}
            onChange={(e) => setDreamContent(e.target.value)}
            placeholder="例：大きな白い鳥が空を飛んでいて、私もその鳥と一緒に飛んでいる夢を見ました..."
            className="w-full h-40 px-4 py-2 bg-purple-900/50 border border-purple-700/50 rounded-lg text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
        </div>

        {/* 解析ボタン */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '解析中...' : '夢を解析する'}
        </button>
      </form>

      {/* 解釈の表示 */}
      {reading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 bg-purple-900/30 border border-purple-700/50 rounded-lg"
        >
          <h3 className="text-xl text-purple-100 mb-4">夢からのメッセージ</h3>
          <div className="prose prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-purple-100">{reading}</pre>
          </div>
          {onSave && (
            <button
              onClick={handleSave}
              className="mt-4 w-full py-2 bg-indigo-600/50 text-white rounded-lg hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              結果を保存
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
} 