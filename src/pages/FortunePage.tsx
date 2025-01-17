import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const fortuneTypes = [
  {
    id: 'astrology',
    name: '星占い',
    description: '星々の配置からあなたの運勢を読み解き、人生の指針を示します。',
    path: '/fortune/astrology'
  },
  {
    id: 'tarot',
    name: 'タロット占い',
    description: '神秘的なタロットカードを使って、あなたの運命を読み解きます。',
    path: '/fortune/tarot'
  },
  {
    id: 'numerology',
    name: '数秘術',
    description: '生年月日から導き出される数字で、あなたの運命のパターンを解き明かします。',
    path: '/fortune/numerology'
  },
  {
    id: 'palm',
    name: '手相占い',
    description: 'あなたの手のひらに刻まれた運命の筋を読み解きます。',
    path: '/fortune/palm'
  },
  {
    id: 'dream',
    name: '夢占い',
    description: '不思議な夢の中に隠された、あなたへのメッセージを解読します。',
    path: '/fortune/dream'
  },
  {
    id: 'animal',
    name: '動物占い',
    description: 'あなたの心に宿る守護動物を見つけ、その意味を解き明かします。',
    path: '/fortune/animal'
  },
  {
    id: 'fourpillars',
    name: '四柱推命',
    description: '生年月日時から導き出される四つの柱で、あなたの運命を占います。',
    path: '/fortune/fourpillars'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function FortunePage() {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-pink-200">
            神秘の占い
          </h1>

          {/* 設定メニュー */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-purple-200 hover:text-purple-100 transition-colors rounded-lg hover:bg-purple-800/30"
              aria-label="設定メニュー"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-2 w-48 bg-purple-800/90 backdrop-blur-sm border border-purple-700/50 rounded-lg shadow-xl z-50">
                <button
                  onClick={() => {
                    setShowSettings(false);
                    navigate('/history');
                  }}
                  className="w-full px-4 py-2 text-left text-purple-200 hover:bg-purple-700/50 rounded-t-lg flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  履歴
                </button>
                <button
                  onClick={() => {
                    setShowSettings(false);
                    navigate('/personal-info');
                  }}
                  className="w-full px-4 py-2 text-left text-purple-200 hover:bg-purple-700/50 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  プロフィール
                </button>
                <button
                  onClick={() => {
                    setShowSettings(false);
                    navigate('/');
                  }}
                  className="w-full px-4 py-2 text-left text-purple-200 hover:bg-purple-700/50 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  トップページに戻る
                </button>
                <button
                  onClick={() => {
                    setShowSettings(false);
                    handleLogout();
                  }}
                  className="w-full px-4 py-2 text-left text-red-300 hover:bg-purple-700/50 rounded-b-lg flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  ログアウト
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 占い選択グリッド */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {fortuneTypes.map((fortune) => (
            <motion.div
              key={fortune.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(fortune.path)}
              className="bg-purple-800/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:bg-purple-700/30 hover:border-purple-400/40 group"
            >
              <h3 className="text-xl font-semibold text-purple-200 mb-2 group-hover:text-purple-100">
                {fortune.name}
              </h3>
              <p className="text-purple-300 text-sm leading-relaxed group-hover:text-purple-200">
                {fortune.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
} 