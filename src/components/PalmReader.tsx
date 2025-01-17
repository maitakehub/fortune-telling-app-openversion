import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generatePalmReading } from '../utils/palm';
import { useNavigate } from 'react-router-dom';

interface PalmReaderProps {
  onSave?: (reading: any) => void;
  onFeedback?: (feedback: string) => void;
}

export default function PalmReader({ onSave, onFeedback }: PalmReaderProps) {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [reading, setReading] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 画像ファイルの検証
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください');
      return;
    }

    try {
      setError('');
      setIsLoading(true);

      // 画像のプレビュー用URL生成
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);

      // AI解釈の生成
      const result = await generatePalmReading(file);
      setReading(result);

    } catch (err) {
      setError('手相の解析中にエラーが発生しました。もう一度お試しください。');
      console.error('Palm reading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 結果の保存
  const handleSave = () => {
    if (reading && onSave) {
      onSave({
        type: 'palm',
        reading,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-100 text-center flex-grow">手相から運命を読み解く</h1>
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

      <div className="space-y-6">
        {/* 画像アップロード */}
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '解析中...' : '手のひらの写真をアップロード'}
          </button>
          <p className="mt-2 text-sm text-purple-300 text-center">
            鮮明な手のひらの写真をアップロードしてください
          </p>
        </div>

        {/* 画像プレビュー */}
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <h3 className="text-xl text-purple-100 mb-4">アップロードされた画像</h3>
            <div className="relative aspect-square max-w-md mx-auto">
              <img
                src={selectedImage}
                alt="手のひらの写真"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </motion.div>
        )}

        {/* 解釈の表示 */}
        {reading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-purple-900/30 border border-purple-700/50 rounded-lg"
          >
            <h3 className="text-xl text-purple-100 mb-4">手相からのメッセージ</h3>
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
    </div>
  );
} 