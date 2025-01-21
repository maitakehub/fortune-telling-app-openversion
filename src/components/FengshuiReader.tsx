import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, History, Upload, Compass } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import {
  ROOM_POSITIONS,
  DIRECTIONS,
  type RoomPosition,
  type Direction,
  generateRoomFengshuiInterpretation,
  generateFloorPlanFengshuiInterpretation,
} from '../utils/fengshuiAI';

type ReadingMode = 'room' | 'floorplan';

interface Reading {
  type: ReadingMode;
  interpretation: string;
  timestamp: Date;
}

const FengshuiReader: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<ReadingMode>('room');
  const [selectedRoom, setSelectedRoom] = useState<RoomPosition>('リビング');
  const [selectedDirection, setSelectedDirection] = useState<Direction>('北');
  const [mainDirection, setMainDirection] = useState<Direction>('北');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [reading, setReading] = useState<Reading | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB制限
        setError('画像サイズは10MB以下にしてください。');
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'floorplan' && !image) {
        throw new Error('間取り図をアップロードしてください。');
      }

      let interpretation: string;
      if (mode === 'room') {
        interpretation = await generateRoomFengshuiInterpretation({
          position: selectedRoom,
          direction: selectedDirection,
          imageUrl: imagePreview || undefined,
        });
      } else {
        if (!imagePreview) {
          throw new Error('間取り図をアップロードしてください。');
        }
        interpretation = await generateFloorPlanFengshuiInterpretation({
          imageUrl: imagePreview,
          mainDirection: mainDirection,
        });
      }

      setReading({
        type: mode,
        interpretation,
        timestamp: new Date(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  }, [mode, selectedRoom, selectedDirection, mainDirection, image, imagePreview]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 text-purple-100">
      <nav className="p-4 bg-purple-900/50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate('/fortune')}
            className="flex items-center space-x-2 text-purple-200 hover:text-purple-100"
          >
            <Home size={24} />
            <span>ホーム</span>
          </button>
          <button
            onClick={() => navigate('/history')}
            className="flex items-center space-x-2 text-purple-200 hover:text-purple-100"
          >
            <History size={24} />
            <span>履歴</span>
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-100 text-center flex-grow">風水占い</h1>
            <button
              onClick={() => navigate('/fortune')}
              className="px-4 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              占い選択に戻る
            </button>
          </div>

          <div className="mb-8">
            <div className="flex space-x-4">
              <button
                onClick={() => setMode('room')}
                className={`flex-1 py-3 px-4 rounded-lg ${
                  mode === 'room'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-800/50 text-purple-200 hover:bg-purple-700/50'
                }`}
              >
                部屋別診断
              </button>
              <button
                onClick={() => setMode('floorplan')}
                className={`flex-1 py-3 px-4 rounded-lg ${
                  mode === 'floorplan'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-800/50 text-purple-200 hover:bg-purple-700/50'
                }`}
              >
                間取り診断
              </button>
            </div>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="p-6 bg-purple-900/30 border border-purple-700/50 rounded-lg">
              {mode === 'room' ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      部屋の種類
                    </label>
                    <select
                      value={selectedRoom}
                      onChange={(e) => setSelectedRoom(e.target.value as RoomPosition)}
                      className="w-full p-2 bg-purple-800/50 border border-purple-700/50 rounded-lg text-purple-100"
                    >
                      {ROOM_POSITIONS.map((position) => (
                        <option key={position} value={position}>
                          {position}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      部屋の方角
                    </label>
                    <select
                      value={selectedDirection}
                      onChange={(e) => setSelectedDirection(e.target.value as Direction)}
                      className="w-full p-2 bg-purple-800/50 border border-purple-700/50 rounded-lg text-purple-100"
                    >
                      {DIRECTIONS.map((direction) => (
                        <option key={direction} value={direction}>
                          {direction}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    間取りの主要な方角
                  </label>
                  <select
                    value={mainDirection}
                    onChange={(e) => setMainDirection(e.target.value as Direction)}
                    className="w-full p-2 bg-purple-800/50 border border-purple-700/50 rounded-lg text-purple-100"
                  >
                    {DIRECTIONS.map((direction) => (
                      <option key={direction} value={direction}>
                        {direction}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  {mode === 'room' ? '部屋の写真（任意）' : '間取り図'}
                  <span className="text-purple-400 ml-2">
                    {mode === 'floorplan' && '（必須）'}
                  </span>
                </label>
                {!imagePreview ? (
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-purple-700/50 border-dashed rounded-lg cursor-pointer bg-purple-800/30 hover:bg-purple-800/50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-purple-500" />
                        <p className="mb-2 text-sm text-purple-400">
                          クリックして画像をアップロード
                        </p>
                        <p className="text-xs text-purple-500">
                          PNG, JPG, JPEG (最大 10MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="relative mt-4">
                    <img
                      src={imagePreview}
                      alt="プレビュー"
                      className="max-w-full h-auto rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview('');
                      }}
                      className="absolute top-2 right-2 p-2 bg-purple-900/80 rounded-full hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg bg-purple-600 text-white font-medium ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-500'
                }`}
              >
                {isLoading ? '解析中...' : '風水を診断する'}
              </button>
            </div>
          </motion.form>

          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              >
                <LoadingSpinner message={mode === 'room' ? '部屋の気の流れを読み解いています...' : '間取り図から運気を分析しています...'} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {reading && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 p-6 bg-purple-900/30 border border-purple-700/50 rounded-lg"
              >
                <h2 className="text-xl font-semibold mb-4">風水診断結果</h2>
                <div className="prose prose-purple prose-invert max-w-none">
                  {reading.interpretation.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-purple-200">
                      {paragraph}
                    </p>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      setReading(null);
                      setImage(null);
                      setImagePreview('');
                    }}
                    className="px-4 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    新しい診断を始める
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default FengshuiReader; 