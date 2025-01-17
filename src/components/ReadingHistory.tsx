import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FortuneReading, NumerologyReading } from '../types';
import { getReadings, deleteReading } from '../utils/storage';

// アニメーション設定
const animations = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

interface Props {
  onSelect?: (reading: FortuneReading) => void;
}

// 日付をフォーマット
function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 占いの種類を日本語に変換
function getFortuneTypeName(type: FortuneReading['type']): string {
  const typeNames: Record<FortuneReading['type'], string> = {
    numerology: '数秘術',
    tarot: 'タロット',
    palmistry: '手相',
    dream: '夢占い',
    compatibility: '相性診断',
    fortune: '運勢'
  };
  return typeNames[type];
}

export function ReadingHistory({ onSelect }: Props) {
  const [readings, setReadings] = useState<FortuneReading[]>([]);
  const [selectedType, setSelectedType] = useState<FortuneReading['type'] | 'all'>('all');
  const [isDeleting, setIsDeleting] = useState(false);

  // 履歴を読み込み
  const loadReadings = useCallback(() => {
    const stored = getReadings();
    setReadings(stored);
  }, []);

  // 初回読み込み
  useEffect(() => {
    loadReadings();
  }, [loadReadings]);

  // 結果を削除
  const handleDelete = useCallback(async (timestamp: string) => {
    if (!window.confirm('この結果を削除してもよろしいですか？')) return;
    
    setIsDeleting(true);
    try {
      deleteReading(timestamp);
      loadReadings();
    } catch (error) {
      console.error('削除に失敗しました:', error);
      alert('削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  }, [loadReadings]);

  // 表示する結果をフィルタリング
  const filteredReadings = selectedType === 'all'
    ? readings
    : readings.filter(reading => reading.type === selectedType);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">履歴</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          占いの種類でフィルタ
        </label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as typeof selectedType)}
          className="block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="all">すべて</option>
          <option value="numerology">数秘術</option>
          <option value="tarot">タロット</option>
          <option value="palmistry">手相</option>
          <option value="dream">夢占い</option>
        </select>
      </div>

      <AnimatePresence mode="wait">
        {filteredReadings.length === 0 ? (
          <motion.p
            className="text-gray-500 text-center py-8"
            {...animations}
          >
            履歴がありません
          </motion.p>
        ) : (
          <motion.div
            className="space-y-4"
            {...animations}
          >
            {filteredReadings.map((reading) => (
              <motion.div
                key={reading.timestamp}
                className="bg-white p-6 rounded-lg shadow-lg"
                layout
                {...animations}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block px-2 py-1 text-sm bg-indigo-100 text-indigo-800 rounded">
                      {getFortuneTypeName(reading.type)}
                    </span>
                    <time className="block text-sm text-gray-500 mt-1">
                      {formatDate(reading.timestamp)}
                    </time>
                  </div>
                  <div className="space-x-2">
                    {onSelect && (
                      <button
                        onClick={() => onSelect(reading)}
                        className="text-blue-600 hover:text-blue-800"
                        disabled={isDeleting}
                      >
                        詳細
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(reading.timestamp)}
                      className="text-red-600 hover:text-red-800"
                      disabled={isDeleting}
                    >
                      削除
                    </button>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <p className="line-clamp-3">{reading.reading}</p>
                </div>

                {'destinyNumber' in reading && (
                  <div className="mt-4 text-sm text-gray-600">
                    <p>運命数: {(reading as NumerologyReading).destinyNumber}</p>
                    {(reading as NumerologyReading).nameNumber && (
                      <p>表現数: {(reading as NumerologyReading).nameNumber}</p>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 