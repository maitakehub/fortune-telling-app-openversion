import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NumerologyReading, FortuneReading } from '../types';
import { updateFortune, FortunePeriod, FortuneUpdate, FortuneAspect } from '../utils/fortune';
import { getReadings } from '../utils/storage';

interface Props {
  onSave?: (reading: FortuneReading) => void;
  onFeedback?: (type: 'POSITIVE' | 'NEGATIVE') => void;
}

const periodOptions: { value: FortunePeriod; label: string }[] = [
  { value: 'daily', label: '今日の運勢' },
  { value: 'weekly', label: '今週の運勢' },
  { value: 'monthly', label: '今月の運勢' },
  { value: 'yearly', label: '今年の運勢' }
];

const aspectNames: Record<FortuneAspect, string> = {
  general: '総合運',
  love: '恋愛運',
  work: '仕事運',
  health: '健康運',
  money: '金運'
};

export function FortuneUpdater({ onSave, onFeedback }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState<FortunePeriod>('daily');
  const [selectedReading, setSelectedReading] = useState<NumerologyReading | null>(null);
  const [result, setResult] = useState<FortuneUpdate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // 保存された数秘術の結果を取得
  const savedReadings = getReadings().filter(
    (reading): reading is NumerologyReading => reading.type === 'numerology'
  );

  // 運勢を更新
  const handleUpdate = useCallback(async () => {
    if (!selectedReading) {
      setError('数秘術の結果を選択してください');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await updateFortune(selectedReading, selectedPeriod);
      setResult(result);
      setShowFeedback(true);
    } catch (error) {
      if (error instanceof Error && error.message === 'まだ更新の必要はありません') {
        setError('この期間の運勢はまだ更新の必要がありません');
      } else {
        setError('運勢の更新中にエラーが発生しました');
        console.error('運勢更新エラー:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedReading, selectedPeriod]);

  // 結果を保存
  const handleSave = useCallback(() => {
    if (result && onSave) {
      onSave({
        type: 'fortune',
        reading: Object.entries(result.aspects)
          .map(([key, value]) => `${aspectNames[key as FortuneAspect]}: ${value}`)
          .join('\n\n'),
        timestamp: result.timestamp,
        period: result.period,
        aspects: result.aspects,
        luckyItems: result.luckyItems
      } as FortuneReading);
    }
  }, [result, onSave]);

  return (
    <div className="space-y-6" role="main" aria-label="運勢更新">
      <div className="space-y-4" role="form" aria-label="運勢更新フォーム">
        <div className="space-y-2">
          <label htmlFor="period" className="block text-sm font-medium">
            期間
          </label>
          <select
            id="period"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as FortunePeriod)}
            className="w-full p-2 border rounded"
            aria-required="true"
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="reading" className="block text-sm font-medium">
            数秘術の結果
          </label>
          <select
            id="reading"
            value={selectedReading?.timestamp || ''}
            onChange={(e) => {
              const reading = savedReadings.find((r) => r.timestamp === e.target.value);
              setSelectedReading(reading || null);
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
          onClick={handleUpdate}
          disabled={isLoading}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          aria-busy={isLoading}
        >
          {isLoading ? '更新中...' : '運勢を更新する'}
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
            <h3 className="text-lg font-medium">運勢</h3>
            
            {Object.entries(result.aspects).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <h4 className="font-medium">{aspectNames[key as FortuneAspect]}</h4>
                <p className="text-gray-600">{value}</p>
              </div>
            ))}

            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h4 className="font-medium">ラッキーアイテム</h4>
              <ul className="mt-2 space-y-1 text-gray-600">
                <li>カラー: {result.luckyItems.color}</li>
                <li>ナンバー: {result.luckyItems.number}</li>
                <li>方角: {result.luckyItems.direction}</li>
              </ul>
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