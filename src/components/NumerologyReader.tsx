import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { NumerologyParams, NumerologyReading } from '../types';
import { generateNumerologyReading } from '../utils/numerology';
import LoadingSpinner from './LoadingSpinner';

// アニメーション設定
const animations = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

interface Props {
  onSave?: (reading: NumerologyReading) => void;
  onFeedback?: (type: 'POSITIVE' | 'NEGATIVE') => void;
}

// 入力フォームコンポーネント
const InputForm = React.memo(({ onSubmit, isLoading }: {
  onSubmit: (params: NumerologyParams) => void;
  isLoading: boolean;
}) => {
  const [birthDate, setBirthDate] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ birthDate, name: name || undefined });
  }, [birthDate, name, onSubmit]);

  return (
    <motion.form
      role="form"
      aria-label="数秘術解析フォーム"
      onSubmit={handleSubmit}
      className="space-y-4 sm:space-y-6"
      {...animations}
    >
      <div role="group" aria-labelledby="birthdate-label">
        <label id="birthdate-label" className="block text-sm sm:text-base font-medium text-purple-200 mb-1 sm:mb-2">
          生年月日
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
          aria-required="true"
          className="mt-1 block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-purple-900/50 border border-purple-700/50 text-purple-100 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div role="group" aria-labelledby="name-label">
        <label id="name-label" className="block text-sm sm:text-base font-medium text-purple-200 mb-1 sm:mb-2">
          名前（オプション）
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="漢字、ひらがな、カタカナ、英字"
          className="mt-1 block w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-purple-900/50 border border-purple-700/50 text-purple-100 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        aria-busy={isLoading}
        className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm sm:text-base hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
      >
        {isLoading ? '解析中...' : '解析する'}
      </button>
    </motion.form>
  );
});

// 結果表示コンポーネント
const ReadingResult = React.memo(({ reading, onSave, onFeedback }: {
  reading: NumerologyReading;
  onSave?: (reading: NumerologyReading) => void;
  onFeedback?: (type: 'POSITIVE' | 'NEGATIVE') => void;
}) => {
  return (
    <motion.div
      role="article"
      aria-label="数秘術解析結果"
      className="space-y-4 sm:space-y-6"
      {...animations}
    >
      <div className="bg-purple-900/30 p-4 sm:p-6 rounded-lg border border-purple-700/50">
        <h2 className="text-lg sm:text-xl font-bold text-purple-100 mb-3 sm:mb-4">解析結果</h2>
        <p className="whitespace-pre-wrap text-sm sm:text-base text-purple-200">{reading.reading}</p>
        
        <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
          <p className="text-sm sm:text-base text-purple-100">
            <span className="font-medium">運命数: </span>
            {reading.destinyNumber}
          </p>
          {reading.nameNumber && (
            <p className="text-sm sm:text-base text-purple-100">
              <span className="font-medium">表現数: </span>
              {reading.nameNumber}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {onSave && (
          <button
            onClick={() => onSave(reading)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg text-sm sm:text-base hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            結果を保存
          </button>
        )}

        {onFeedback && (
          <div role="group" aria-label="フィードバック" className="w-full sm:w-auto flex gap-2 sm:gap-4">
            <button
              onClick={() => onFeedback('POSITIVE')}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg text-sm sm:text-base hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="良い結果でした"
            >
              👍 良い
            </button>
            <button
              onClick={() => onFeedback('NEGATIVE')}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-lg text-sm sm:text-base hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="改善が必要です"
            >
              👎 改善が必要
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
});

// メインコンポーネント
export function NumerologyReader({ onSave, onFeedback }: Props) {
  const navigate = useNavigate();
  const [reading, setReading] = useState<NumerologyReading | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async (params: NumerologyParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await generateNumerologyReading(params);
      setReading(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* ローディング画面 */}
      <AnimatePresence>
        {isLoading && (
          <LoadingSpinner message="数秘術で運命を読み解いています..." />
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-100 text-center flex-grow">数秘術で運命を読み解く</h1>
        <button
          onClick={() => navigate('/fortune')}
          className="px-4 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          占い選択に戻る
        </button>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            role="alert"
            className="bg-red-500/10 border border-red-500/50 text-red-400 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base"
            {...animations}
          >
            {error}
          </motion.div>
        )}

        {!reading ? (
          <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
        ) : (
          <ReadingResult
            reading={reading}
            onSave={onSave}
            onFeedback={onFeedback}
          />
        )}
      </AnimatePresence>
    </div>
  );
} 