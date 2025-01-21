import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

interface HistoryItem {
  id: string;
  date: string;
  type: string;
  question: string;
  result: string;
}

// デモ用の履歴データ
const DEMO_HISTORY: HistoryItem[] = [
  {
    id: '1',
    date: new Date().toISOString(),
    type: '星占い',
    question: '今日の運勢は？',
    result: '今日はラッキーな一日になりそうです。新しいことに挑戦するのに適した日です。'
  },
  {
    id: '2',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    type: 'タロット',
    question: '恋愛運について',
    result: '「恋人」のカードが出ました。素晴らしい出会いが期待できます。'
  }
];

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // デモデータを表示
    setHistoryData(DEMO_HISTORY);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-purple-200">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-purple-100">占い履歴</h1>
        <button
          onClick={() => navigate('/fortune')}
          className="px-4 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          占い選択に戻る
        </button>
      </div>
      
      {error && (
        <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {historyData.length > 0 ? (
        <div className="space-y-6">
          {historyData.map((item) => (
            <div key={item.id} className="bg-purple-900/30 backdrop-blur-sm border border-purple-800/30 rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-purple-300">
                    {new Date(item.date).toLocaleDateString('ja-JP')}
                  </p>
                  <p className="text-lg font-medium text-purple-100">{item.type}</p>
                </div>
              </div>
              <p className="text-purple-200 mb-4">質問: {item.question}</p>
              <p className="text-purple-200">結果: {item.result}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-purple-300 text-center">履歴がありません</p>
      )}
    </div>
  );
};

export default HistoryPage; 