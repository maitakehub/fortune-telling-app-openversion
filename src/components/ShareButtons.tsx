import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FortuneReading } from '../types';
import { shareReading, copyToClipboard, SharePlatform } from '../utils/share';

interface Props {
  reading: FortuneReading;
  url?: string;
  hashtags?: string[];
}

const platforms: { value: SharePlatform; label: string; icon: string }[] = [
  { value: 'twitter', label: 'Twitter', icon: '🐦' },
  { value: 'line', label: 'LINE', icon: '💬' },
  { value: 'facebook', label: 'Facebook', icon: '👍' }
];

export function ShareButtons({ reading, url, hashtags }: Props) {
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // シェアを実行
  const handleShare = useCallback((platform: SharePlatform) => {
    try {
      shareReading(reading, { platform, url, hashtags });
    } catch (error) {
      setError('シェアに失敗しました');
      console.error('シェアエラー:', error);
    }
  }, [reading, url, hashtags]);

  // クリップボードにコピー
  const handleCopy = useCallback(async () => {
    try {
      await copyToClipboard(reading);
      setShowCopyMessage(true);
      setTimeout(() => setShowCopyMessage(false), 2000);
    } catch (error) {
      setError('コピーに失敗しました');
      console.error('コピーエラー:', error);
    }
  }, [reading]);

  return (
    <div className="space-y-4">
      <div className="flex justify-center space-x-4">
        {platforms.map((platform) => (
          <button
            key={platform.value}
            onClick={() => handleShare(platform.value)}
            className="p-2 bg-white rounded shadow hover:bg-gray-50 transition-colors"
            aria-label={`${platform.label}でシェア`}
          >
            <span className="text-2xl" role="img" aria-hidden="true">
              {platform.icon}
            </span>
            <span className="sr-only">{platform.label}</span>
          </button>
        ))}
        <button
          onClick={handleCopy}
          className="p-2 bg-white rounded shadow hover:bg-gray-50 transition-colors"
          aria-label="テキストをコピー"
        >
          <span className="text-2xl" role="img" aria-hidden="true">
            📋
          </span>
          <span className="sr-only">コピー</span>
        </button>
      </div>

      <AnimatePresence>
        {showCopyMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center text-green-600"
            role="status"
            aria-live="polite"
          >
            テキストをコピーしました！
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center text-red-600"
            role="alert"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 