import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import { UserRole } from '@/types/user';
import { Settings } from 'lucide-react';

export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-purple-900/30 border-b border-purple-700/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-200 to-amber-200"
          >
            Fortune Telling App
          </Link>

          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {user?.role === UserRole.ADMIN && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-4 py-2 bg-purple-800/50 text-purple-100 rounded-lg hover:bg-purple-800 transition-colors"
                  >
                    <Settings size={20} />
                    管理画面
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-purple-800/50 text-purple-100 rounded-lg hover:bg-purple-800 transition-colors"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-purple-200 hover:text-purple-100 transition-colors"
                >
                  ログイン
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-purple-800/50 text-purple-100 rounded-lg hover:bg-purple-800 transition-colors"
                >
                  新規登録
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
} 