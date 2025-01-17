import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sparkles, ArrowRight, Star, Compass, ScrollText, Users, Award, LogIn, UserPlus, Check, CreditCard } from 'lucide-react';

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
      'タロット占いの無制限利用',
      '動物占いの無制限利用',
      '夢占いの無制限利用',
      '手相占いの無制限利用',
      '数秘術の無制限利用',
      '星占いの無制限利用',
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
      'タロット占いの基本機能',
      '動物占いの基本機能',
      '夢占いの基本機能',
      '手相占いの基本機能',
      '数秘術の基本機能',
      '星占いの基本機能',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900">
      {/* Header with Auth Buttons */}
      <div className="w-full max-w-7xl mx-auto flex justify-end p-4">
        <div className="flex gap-2 sm:gap-4">
          <Link to="/login" className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-purple-900/50 text-purple-200 hover:bg-purple-800/50 transition-colors text-sm sm:text-base">
            <LogIn size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span>ログイン</span>
          </Link>
          <Link to="/signup" className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors text-sm sm:text-base">
            <UserPlus size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span>新規登録</span>
          </Link>
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

        {/* Divination Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto mb-8 sm:mb-16 px-2 sm:px-4">
          <div
            onClick={() => navigate('/fortune/astrology')}
            className="group cursor-pointer bg-purple-900/30 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-purple-800/30 hover:bg-purple-800/40 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <Moon size={24} className="sm:w-8 sm:h-8 text-purple-300" />
              <ArrowRight size={20} className="sm:w-6 sm:h-6 text-purple-400 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all duration-300" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-purple-100 mb-2">星占い</h2>
            <p className="text-sm sm:text-base text-purple-300">
              最新のAI技術と占星術の専門家による、あなただけの運命診断。
            </p>
          </div>

          <div
            onClick={() => navigate('/fortune/tarot')}
            className="group cursor-pointer bg-purple-900/30 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-purple-800/30 hover:bg-purple-800/40 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <Sparkles size={24} className="sm:w-8 sm:h-8 text-purple-300" />
              <ArrowRight size={20} className="sm:w-6 sm:h-6 text-purple-400 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all duration-300" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-purple-100 mb-2">タロット占い</h2>
            <p className="text-sm sm:text-base text-purple-300">
              伝統的なタロット占いとAIの予測を組み合わせた、高精度な運命診断。
            </p>
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
                  onClick={() => navigate('/subscription')}
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

          <div className="text-center mt-8 sm:mt-16">
            <button
              onClick={() => navigate('/login')}
              className="px-6 sm:px-8 py-2 sm:py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm sm:text-base"
            >
              今すぐ始める
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}