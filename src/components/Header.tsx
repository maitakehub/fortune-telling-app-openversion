import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import { UserRole } from '@/types/user';
import { Settings, Star, MessageCircle, Bot, Menu, X } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems = [
    {
      label: 'パーソナルチャット',
      path: '/chat',
      icon: <MessageCircle className="w-5 h-5" aria-hidden="true" />,
      requiresAuth: true,
    },
    {
      label: '占いチャット',
      path: '/fortune/chat',
      icon: <Bot className="w-5 h-5" aria-hidden="true" />,
      requiresAuth: true,
    },
    {
      label: '星占いチャット',
      path: '/fortune/astrology-chat',
      icon: <Star className="w-5 h-5" aria-hidden="true" />,
      requiresAuth: true,
    },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-purple-900/50 backdrop-blur-sm border-b border-purple-800/50">
      <nav className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8" aria-label="メインナビゲーション">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              to="/"
              className="flex items-center px-2 lg:px-0"
              data-testid="logo-link"
              aria-label="ホームページへ"
            >
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-pink-200">
                Fortune Teller
              </span>
            </Link>
          </div>

          {/* デスクトップメニュー */}
          <div className="hidden sm:flex sm:items-center sm:ml-6 space-x-4">
            {user && (
              <>
                <Link
                  to="/fortune"
                  className="text-purple-200 hover:text-purple-100 px-3 py-2 rounded-md text-sm font-medium"
                  data-testid="fortune-link"
                >
                  占い
                </Link>
                <Link
                  to="/chat"
                  className="text-purple-200 hover:text-purple-100 px-3 py-2 rounded-md text-sm font-medium"
                  data-testid="chat-link"
                >
                  チャット
                </Link>
                <Link
                  to="/profile"
                  className="text-purple-200 hover:text-purple-100 px-3 py-2 rounded-md text-sm font-medium"
                  data-testid="profile-link"
                >
                  プロフィール
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-purple-200 hover:text-purple-100 px-3 py-2 rounded-md text-sm font-medium"
                  data-testid="logout-button"
                  aria-label="ログアウト"
                >
                  ログアウト
                </button>
              </>
            )}
            {!user && (
              <>
                <Link
                  to="/login"
                  className="text-purple-200 hover:text-purple-100 px-3 py-2 rounded-md text-sm font-medium"
                  data-testid="login-link"
                >
                  ログイン
                </Link>
                <Link
                  to="/signup"
                  className="text-purple-200 hover:text-purple-100 px-3 py-2 rounded-md text-sm font-medium"
                  data-testid="signup-link"
                >
                  新規登録
                </Link>
              </>
            )}
          </div>

          {/* モバイルメニューボタン */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-purple-200 hover:text-purple-100 p-2"
              data-testid="mobile-menu-button"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label="メニューを開く"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        <div
          className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'}`}
          id="mobile-menu"
          role="navigation"
          aria-label="モバイルナビゲーション"
        >
          <div className="pt-2 pb-3 space-y-1">
            {user && (
              <>
                <Link
                  to="/fortune"
                  className="text-purple-200 hover:text-purple-100 block px-3 py-2 rounded-md text-base font-medium"
                  data-testid="mobile-fortune-link"
                >
                  占い
                </Link>
                <Link
                  to="/chat"
                  className="text-purple-200 hover:text-purple-100 block px-3 py-2 rounded-md text-base font-medium"
                  data-testid="mobile-chat-link"
                >
                  チャット
                </Link>
                <Link
                  to="/profile"
                  className="text-purple-200 hover:text-purple-100 block px-3 py-2 rounded-md text-base font-medium"
                  data-testid="mobile-profile-link"
                >
                  プロフィール
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-purple-200 hover:text-purple-100 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
                  data-testid="mobile-logout-button"
                  aria-label="ログアウト"
                >
                  ログアウト
                </button>
              </>
            )}
            {!user && (
              <>
                <Link
                  to="/login"
                  className="text-purple-200 hover:text-purple-100 block px-3 py-2 rounded-md text-base font-medium"
                  data-testid="mobile-login-link"
                >
                  ログイン
                </Link>
                <Link
                  to="/signup"
                  className="text-purple-200 hover:text-purple-100 block px-3 py-2 rounded-md text-base font-medium"
                  data-testid="mobile-signup-link"
                >
                  新規登録
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
} 