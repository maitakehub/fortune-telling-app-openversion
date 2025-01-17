import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface HistoryItem {
  id: string;
  date: string;
  type: string;
  question: string;
  result: string;
}

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('/api/fortune/history', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (Array.isArray(response.data)) {
          setHistoryData(response.data);
        } else {
          setError('履歴データの形式が不正です');
          console.error('Invalid history data format:', response.data);
        }
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { data?: { message?: string } } };
          if (axiosError.response?.status === 401) {
            navigate('/login');
          } else {
            setError(axiosError.response?.data?.message || '履歴の取得に失敗しました');
          }
        } else {
          setError('履歴の取得に失敗しました');
        }
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    
    // 30秒ごとに履歴を更新
    const intervalId = setInterval(fetchHistory, 30000);
    return () => clearInterval(intervalId);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 p-8 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">占い履歴</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {historyData.length > 0 ? (
          <ul data-testid="history-list" className="space-y-6">
            {historyData.map((item) => (
              <li key={item.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      {new Date(item.date).toLocaleDateString('ja-JP')}
                    </p>
                    <p className="text-lg font-medium text-gray-800">{item.type}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">質問: {item.question}</p>
                <p className="text-gray-700">結果: {item.result}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 text-center">履歴がありません</p>
        )}

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => navigate('/fortune')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            占いに戻る
          </button>
          
          <button
            data-testid="logout-button"
            onClick={handleLogout}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage; 