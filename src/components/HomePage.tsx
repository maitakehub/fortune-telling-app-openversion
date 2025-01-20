import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Compass, ScrollText, Users, Award, LogIn, UserPlus, Check, CreditCard, X } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import TestUserAuthModal from './TestUserAuthModal';

const features = [
  { icon: Star, text: '占星術の専門家による監修' },
  { icon: Users, text: '95%以上の利用者満足度' },
  { icon: Compass, text: '風水と四柱推命との統合分析' },
  { icon: Award, text: '独自のAIアルゴリズム' },
];

const SUBSCRIPTION_PLANS = [
  {
    id: 'premium',
    name: 'プレミアムプラン',
    price: '9,800',
    features: [
      '四柱推命機能の無制限利用',
      '動物占いの無制限利用',
      '夢占いの無制限利用',
      '手相占いの無制限利用',
      '数秘術の無制限利用',
      '詳細な運勢解説',
      '24時間サポート',
      'プレミアム限定コンテンツ',
      '月1回の個別オンラインコンサルティング'
    ],
    recommended: true
  },
  {
    id: 'basic',
    name: 'ベーシックプラン',
    price: '4,980',
    features: [
      '四柱推命機能の利用',
      '動物占いの基本機能',
      '夢占いの基本機能',
      '手相占いの基本機能',
      '数秘術の基本機能',
      '基本的な運勢解説',
      'メールサポート'
    ],
    recommended: false
  },
  {
    id: 'test',
    name: 'テストプラン',
    price: '0',
    features: [
      '全ての占い機能が無制限で利用可能',
      '全ての解説機能が利用可能',
      '24時間サポート',
      'テストユーザー専用機能',
      '※テストユーザー専用のプランです'
    ],
    recommended: false,
    isTest: true
  }
];

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showTestAuthModal, setShowTestAuthModal] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SUBSCRIPTION_SUCCESS') {
        setShowSubscriptionModal(false);
        navigate('/fortune');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SUBSCRIPTION_COMPLETE') {
        setShowSubscriptionModal(false);
        navigate('/fortune');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  const handlePlanSelect = (plan: string) => {
    if (plan === 'test') {
      setShowTestAuthModal(true);
      return;
    }

    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    setSelectedPlan(plan);
    setShowSubscriptionModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900">
      {/* Header with Auth Buttons */}
      <div className="w-full max-w-7xl mx-auto flex justify-end p-4">
        <div className="flex gap-2 sm:gap-4">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-purple-900/50 text-purple-200 hover:bg-purple-800/50 transition-colors text-sm sm:text-base">
                <LogIn size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span>ログイン</span>
              </Link>
              <Link to="/signup" className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors text-sm sm:text-base">
                <UserPlus size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span>新規登録</span>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-purple-900/50 text-purple-200">
              <span>{user?.email}</span>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="text-center mb-8 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-200 to-amber-200 mb-4 sm:mb-6">
            神秘の占い
          </h1>
          <p className="text-lg sm:text-xl text-purple-200 px-4">
            あなたの運命の導きを、最新のテクノロジーと伝統的な占術で解き明かします
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-6 sm:mt-8 px-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 bg-purple-900/30 px-3 sm:px-4 py-2 rounded-full">
                <feature.icon size={14} className="sm:w-4 sm:h-4 text-purple-300" />
                <span className="text-purple-200 text-xs sm:text-sm">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="max-w-6xl mx-auto px-2 sm:px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-purple-100 mb-6 sm:mb-8">料金プラン</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-6 sm:p-8 rounded-xl border ${
                  plan.recommended
                    ? 'border-purple-400 bg-purple-900/50'
                    : plan.isTest
                    ? 'border-green-400/50 bg-purple-900/30'
                    : 'border-purple-700/50 bg-purple-900/30'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-medium bg-purple-600 text-white">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      おすすめ
                    </span>
                  </div>
                )}
                <h3 className="text-xl sm:text-2xl font-bold text-purple-100 mb-2">
                  {plan.name}
                </h3>
                <p className="text-3xl sm:text-4xl font-bold text-purple-100 mb-4 sm:mb-6">
                  ¥{plan.price}
                  <span className="text-xs sm:text-sm font-normal text-purple-300">/月</span>
                </p>
                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm sm:text-base text-purple-200">
                      <Check className="mr-2 text-purple-400 w-4 h-4 sm:w-5 sm:h-5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium flex items-center justify-center text-sm sm:text-base ${
                    plan.recommended
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : plan.isTest
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-purple-800/50 text-purple-100 hover:bg-purple-800'
                  } transition-colors`}
                >
                  <CreditCard className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  {plan.isTest ? 'テストプランを利用' : 'プランを選択'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-purple-900 rounded-xl p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="absolute top-4 right-4 text-purple-200 hover:text-white"
            >
              <X size={24} />
            </button>
            <div className="text-center">
              <h3 className="text-xl font-bold text-purple-100 mb-4">
                ログインが必要です
              </h3>
              <p className="text-purple-200 mb-6">
                プランを選択するには、ログインまたは新規登録が必要です。
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  to="/login"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  ログイン
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  新規登録
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowSubscriptionModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
            <iframe
              src={`/subscription?plan=${selectedPlan}`}
              className="w-full h-[600px] border-none"
              title="Subscription"
            />
          </div>
        </div>
      )}

      {/* Test User Auth Modal */}
      {showTestAuthModal && (
        <TestUserAuthModal onClose={() => setShowTestAuthModal(false)} />
      )}
    </div>
  );
}