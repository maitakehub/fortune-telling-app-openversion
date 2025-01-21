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
      '全ての占い機能が制限付で利用可能',
      '全ての解説機能が利用可能',
      '24時間サポート',
      'テストユーザー専用機能',
      '※テストユーザー専用のプランです'
    ],
    recommended: false
  }
];

export default function HomePage() {
  const [showTestUserModal, setShowTestUserModal] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handlePlanSelect = (plan: string) => {
    if (isAuthenticated) {
      navigate('/subscription', { state: { selectedPlan: plan } });
      return;
    }

    // テストプランの場合のみモーダルを表示
    if (plan === 'test') {
      setShowTestUserModal(true);
      return;
    }

    // その他のプランの場合はログインページに遷移
    navigate('/login', { 
      state: { 
        redirectTo: '/subscription',
        selectedPlan: plan 
      } 
    });
  };

  return (
    <>
      {/* Hero Section */}
      <div className="text-center py-20">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-purple-200 to-amber-200">
          神秘の占い
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-purple-200">
          あなたの運命の導きを、最新のテクノロジーと伝統的な占術で解き明かします
        </p>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-purple-900/30 backdrop-blur-sm p-6 rounded-xl border border-purple-800/30"
            >
              <feature.icon className="w-12 h-12 text-purple-300 mb-4" />
              <p className="text-lg text-purple-100">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-16">
        <h2 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-purple-200 to-amber-200">
          料金プラン
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`bg-purple-900/30 backdrop-blur-sm p-8 rounded-xl border ${
                plan.recommended ? 'border-amber-400/50' : 'border-purple-800/30'
              } relative`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-amber-400 text-purple-900 px-4 py-1 rounded-full text-sm font-bold">
                  おすすめ
                </div>
              )}
              <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
              <div className="text-3xl font-bold mb-6">
                ¥{plan.price}
                <span className="text-lg font-normal text-purple-300">/月</span>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handlePlanSelect(plan.id)}
                className={`w-full py-3 px-6 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
                  plan.recommended
                    ? 'bg-amber-400 hover:bg-amber-500 text-purple-900'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                プランを選択
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Test User Modal */}
      {showTestUserModal && (
        <TestUserAuthModal
          onClose={() => setShowTestUserModal(false)}
          onSuccess={() => navigate('/fortune')}
        />
      )}
    </>
  );
}