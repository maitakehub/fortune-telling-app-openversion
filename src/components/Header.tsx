import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { LogOut } from 'lucide-react';

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // ログインページとサインアップページではヘッダーのログインボタンを表示しない
  const hideAuthButtons = ['/login', '/signup'].includes(location.pathname);

  return (
    <header className="bg-purple-900/50 backdrop-blur-sm border-b border-purple-800/30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-white">
            Fortune Teller
          </Link>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="bg-transparent hover:bg-purple-800/30 text-white font-bold py-2 px-4 rounded-lg border border-purple-400 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                ログアウト
              </button>
            ) : !hideAuthButtons && (
              <div className="flex items-center gap-2">
                <Link
                  to="/signup"
                  className="bg-transparent hover:bg-purple-800/30 text-white font-bold py-2 px-4 rounded-lg border border-purple-400 transition-colors"
                >
                  新規登録
                </Link>
                <Link
                  to="/login"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  ログイン
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 