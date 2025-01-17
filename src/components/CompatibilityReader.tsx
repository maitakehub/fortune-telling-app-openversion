import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NumerologyReading, FortuneReading } from '../types';
import { analyzeCompatibility, CompatibilityType, CompatibilityResult } from '../utils/compatibility';
import { getReadings } from '../utils/storage';

interface Props {
  onSave?: (reading: FortuneReading) => void;
  onFeedback?: (type: 'POSITIVE' | 'NEGATIVE') => void;
}

const typeOptions: { value: CompatibilityType; label: string }[] = [
  { value: 'love', label: '恋愛' },
  { value: 'work', label: '仕事' },
  { value: 'friendship', label: '友情' }
];

export function CompatibilityReader({ onSave, onFeedback }: Props) {
  const [selectedType, setSelectedType] = useState<CompatibilityType>('love');
  const [selectedReading1, setSelectedReading1] = useState<NumerologyReading | null>(null);
  const [selectedReading2, setSelectedReading2] = useState<NumerologyReading | null>(null);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // 保存された数秘術の結果を取得
  const savedReadings = getReadings().filter(
    (reading): reading is NumerologyReading => reading.type === 'numerology'
  );

  // 相性診断を実行
  const handleAnalyze = useCallback(async () => {
    if (!selectedReading1 || !selectedReading2) {
      setError('2つの数秘術の結果を選択してください');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeCompatibility(selectedReading1, selectedReading2, selectedType);
      setResult(result);
      setShowFeedback(true);
    } catch (error) {
      setError('相性診断の実行中にエラーが発生しました');
      console.error('相性診断エラー:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedReading1, selectedReading2, selectedType]);

  // 結果を保存
  const handleSave = useCallback(() => {
    if (result && onSave) {
      onSave({
        type: 'compatibility',
        reading: result.reading,
        timestamp: result.timestamp,
        compatibilityType: result.type,
        score: result.score
      } as FortuneReading);
    }
  }, [result, onSave]);

  return (
    <div className="space-y-6" role="main" aria-label="相性診断">
      <div className="space-y-4" role="form" aria-label="相性診断フォーム">
        <div className="space-y-2">
          <label htmlFor="type" className="block text-sm font-medium">
            診断タイプ
          </label>
          <select
            id="type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as CompatibilityType)}
            className="w-full p-2 border rounded"
            aria-required="true"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="reading1" className="block text-sm font-medium">
            1人目の数秘術結果
          </label>
          <select
            id="reading1"
            value={selectedReading1?.timestamp || ''}
            onChange={(e) => {
              const reading = savedReadings.find((r) => r.timestamp === e.target.value);
              setSelectedReading1(reading || null);
            }}
            className="w-full p-2 border rounded"
            aria-required="true"
          >
            <option value="">選択してください</option>
            {savedReadings.map((reading) => (
              <option key={reading.timestamp} value={reading.timestamp}>
                {new Date(reading.timestamp).toLocaleString()} - 運命数: {reading.destinyNumber}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="reading2" className="block text-sm font-medium">
            2人目の数秘術結果
          </label>
          <select
            id="reading2"
            value={selectedReading2?.timestamp || ''}
            onChange={(e) => {
              const reading = savedReadings.find((r) => r.timestamp === e.target.value);
              setSelectedReading2(reading || null);
            }}
            className="w-full p-2 border rounded"
            aria-required="true"
          >
            <option value="">選択してください</option>
            {savedReadings.map((reading) => (
              <option key={reading.timestamp} value={reading.timestamp}>
                {new Date(reading.timestamp).toLocaleString()} - 運命数: {reading.destinyNumber}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          aria-busy={isLoading}
        >
          {isLoading ? '診断中...' : '相性を診断する'}
        </button>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-2 text-red-600 bg-red-50 rounded"
              role="alert"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4 p-4 bg-white rounded shadow"
          >
            <h3 className="text-lg font-medium">診断結果</h3>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-center">
                相性スコア: {result.score}点
              </p>
              <div className="whitespace-pre-wrap">{result.reading}</div>
            </div>

            {onSave && (
              <button
                onClick={handleSave}
                className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
              >
                結果を保存
              </button>
            )}

            {showFeedback && onFeedback && (
              <div className="space-y-2">
                <p className="text-sm text-center">この結果は参考になりましたか？</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      onFeedback('POSITIVE');
                      setShowFeedback(false);
                    }}
                    className="py-1 px-3 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    aria-label="はい、参考になりました"
                  >
                    👍 はい
                  </button>
                  <button
                    onClick={() => {
                      onFeedback('NEGATIVE');
                      setShowFeedback(false);
                    }}
                    className="py-1 px-3 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                    aria-label="いいえ、参考になりませんでした"
                  >
                    👎 いいえ
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 