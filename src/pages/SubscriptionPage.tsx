import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../subscriptions/useSubscription';
import { Lock, Check, CreditCard, ArrowLeft } from 'lucide-react';

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
    ]
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
    ]
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
    ]
  }
];

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { isSubscribed, plan, subscribe, refreshStatus } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showPayment, setShowPayment] = useState(false);

  const handlePlanSelect = async (planId: string) => {
    setSelectedPlan(planId);
    
    if (planId === 'test') {
      setIsProcessing(true);
      try {
        await subscribe(planId);
        await refreshStatus();
        navigate('/fortune/fourpillars');
      } catch (err) {
        setError('テストプランの登録に失敗しました。');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // プレミアムプランとベーシックプランの場合は支払い画面へ
    if (planId === 'premium') {
      setShowPayment(true);
      // プレミアムプラン用の支払い画面を表示
      return;
    }

    if (planId === 'basic') {
      setShowPayment(true);
      // ベーシックプラン用の支払い画面を表示
      return;
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      await subscribe(selectedPlan);
      await refreshStatus();
      
      // プランごとに異なる遷移先を設定
      switch (selectedPlan) {
        case 'premium':
          navigate('/fortune/fourpillars');
          break;
        case 'basic':
          navigate('/fortune');
          break;
        default:
          navigate(-1);
      }
    } catch (err) {
      setError('サブスクリプションの登録に失敗しました。');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-purple-200 hover:text-purple-100 mb-8"
        >
          <ArrowLeft className="mr-2" size={20} />
          戻る
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-purple-200 to-amber-200 mb-4">
              プレミアム機能を解放
            </h1>
            <p className="text-purple-200 text-lg">
              より詳細な占い結果と高度な機能をご利用いただけます
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}

          {!showPayment ? (
            <div className="grid md:grid-cols-3 gap-8">
              {SUBSCRIPTION_PLANS.map((planOption) => (
                <div
                  key={planOption.id}
                  className={`p-6 rounded-xl border ${
                    selectedPlan === planOption.id
                      ? 'border-purple-400 bg-purple-900/50'
                      : planOption.id === 'test'
                      ? 'border-green-400/50 bg-purple-900/30'
                      : 'border-purple-700/50 bg-purple-900/30'
                  }`}
                >
                  <h3 className="text-2xl font-bold text-purple-100 mb-2">
                    {planOption.name}
                  </h3>
                  <p className="text-3xl font-bold text-purple-100 mb-6">
                    ¥{planOption.price}
                    <span className="text-sm font-normal text-purple-300">/月</span>
                  </p>
                  <ul className="space-y-3 mb-6">
                    {planOption.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-purple-200">
                        <Check className="mr-2 text-purple-400" size={20} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handlePlanSelect(planOption.id)}
                    className={`w-full py-2 px-4 rounded-lg font-medium ${
                      selectedPlan === planOption.id
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : planOption.id === 'test'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-purple-800/50 text-purple-100 hover:bg-purple-800'
                    } transition-colors`}
                    disabled={isProcessing}
                  >
                    {isProcessing && selectedPlan === planOption.id ? (
                      '処理中...'
                    ) : planOption.id === 'test' ? (
                      'テストプランを利用'
                    ) : (
                      'このプランを選択'
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-md mx-auto p-6 bg-purple-900/30 border border-purple-700/50 rounded-xl">
              <h2 className="text-2xl font-bold text-purple-100 mb-6">
                お支払い情報
              </h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-purple-200 mb-2">
                    カード番号
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-purple-800/50 border border-purple-700/50 rounded-lg text-purple-100"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-purple-200 mb-2">
                      有効期限
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-purple-800/50 border border-purple-700/50 rounded-lg text-purple-100"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-purple-200 mb-2">
                      セキュリティコード
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-purple-800/50 border border-purple-700/50 rounded-lg text-purple-100"
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  '処理中...'
                ) : (
                  <span className="flex items-center justify-center">
                    <CreditCard className="mr-2" size={20} />
                    支払いを確定する
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowPayment(false)}
                className="w-full mt-4 py-2 px-4 bg-transparent text-purple-200 hover:text-purple-100"
              >
                プラン選択に戻る
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
