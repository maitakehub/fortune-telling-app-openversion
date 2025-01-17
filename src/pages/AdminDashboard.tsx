import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CreditCard, Activity, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { User, UserRole } from '../types/user';

interface UserStats {
  total: number;
  active: number;
  premium: number;
  basic: number;
  test: number;
}

interface AdminStats {
  users: UserStats;
  revenue: {
    total: number;
    monthly: number;
    annual: number;
  };
  activity: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    users: {
      total: 0,
      active: 0,
      premium: 0,
      basic: 0,
      test: 0
    },
    revenue: {
      total: 0,
      monthly: 0,
      annual: 0
    },
    activity: {
      daily: 0,
      weekly: 0,
      monthly: 0
    }
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: 実際のAPIエンドポイントから統計データを取得
    const fetchStats = async () => {
      try {
        // const response = await fetch('/api/admin/stats');
        // const data = await response.json();
        // setStats(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-200 to-amber-200">
            管理者ダッシュボード
          </h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <span className="text-sm sm:text-base text-purple-200">
              {user?.email} (管理者)
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-800/50 text-purple-100 text-sm sm:text-base rounded-lg hover:bg-purple-800 transition-colors"
            >
              <LogOut size={16} className="sm:w-5 sm:h-5" />
              ログアウト
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-12">
          <div className="bg-purple-900/30 border border-purple-700/50 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-medium text-purple-200">ユーザー統計</h3>
              <Users className="text-purple-400 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <p className="text-purple-200 text-sm sm:text-base">
                総ユーザー数: <span className="text-xl sm:text-2xl font-bold">{stats.users.total}</span>
              </p>
              <p className="text-purple-200 text-sm sm:text-base">
                アクティブユーザー: {stats.users.active}
              </p>
              <p className="text-purple-200 text-sm sm:text-base">
                プレミアム: {stats.users.premium}
              </p>
              <p className="text-purple-200 text-sm sm:text-base">
                ベーシック: {stats.users.basic}
              </p>
              <p className="text-purple-200 text-sm sm:text-base">
                テストユーザー: {stats.users.test}
              </p>
            </div>
          </div>

          <div className="bg-purple-900/30 border border-purple-700/50 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-medium text-purple-200">収益</h3>
              <CreditCard className="text-purple-400 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <p className="text-purple-200 text-sm sm:text-base">
                総収益: <span className="text-xl sm:text-2xl font-bold">¥{stats.revenue.total.toLocaleString()}</span>
              </p>
              <p className="text-purple-200 text-sm sm:text-base">
                月間収益: ¥{stats.revenue.monthly.toLocaleString()}
              </p>
              <p className="text-purple-200 text-sm sm:text-base">
                年間収益: ¥{stats.revenue.annual.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-purple-900/30 border border-purple-700/50 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-medium text-purple-200">アクティビティ</h3>
              <Activity className="text-purple-400 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <p className="text-purple-200 text-sm sm:text-base">
                本日のアクセス: {stats.activity.daily}
              </p>
              <p className="text-purple-200 text-sm sm:text-base">
                週間アクセス: {stats.activity.weekly}
              </p>
              <p className="text-purple-200 text-sm sm:text-base">
                月間アクセス: {stats.activity.monthly}
              </p>
            </div>
          </div>

          <div className="bg-purple-900/30 border border-purple-700/50 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-medium text-purple-200">システム設定</h3>
              <Settings className="text-purple-400 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="space-y-2 sm:space-y-4">
              <button
                onClick={() => navigate('/admin/users')}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-800/50 text-purple-100 text-sm sm:text-base rounded-lg hover:bg-purple-800 transition-colors"
              >
                ユーザー管理
              </button>
              <button
                onClick={() => navigate('/admin/settings')}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-800/50 text-purple-100 text-sm sm:text-base rounded-lg hover:bg-purple-800 transition-colors"
              >
                システム設定
              </button>
            </div>
          </div>
        </div>

        <div className="bg-purple-900/30 border border-purple-700/50 rounded-xl p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-purple-100 mb-3 sm:mb-4">
            最近のアクティビティ
          </h2>
          {loading ? (
            <p className="text-sm sm:text-base text-purple-200">読み込み中...</p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {/* TODO: アクティビティログの表示 */}
              <p className="text-sm sm:text-base text-purple-200">アクティビティログはまだ実装されていません。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 