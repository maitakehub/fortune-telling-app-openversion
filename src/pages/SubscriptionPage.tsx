import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { toast } from 'react-toastify';

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState(location.state?.plan || 'basic');

  const plans = [
    {
      id: 'basic',
      name: 'ベーシック',
      price: '1,000',
      features: ['基本的な占い機能', '月3回まで詳細な占い']
    },
    {
      id: 'premium',
      name: 'プレミアム',
      price: '3,000',
      features: ['すべての占い機能', '無制限の詳細な占い', '優先サポート']
    }
  ];

  // テストプランユーザーの場合は、デモメッセージを表示して戻る
  if (user?.plan === 'test') {
    return (
      <div className="min-h-screen bg-purple-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-purple-800/30 backdrop-blur-sm rounded-xl p-8 text-center">
            <h1 className="text-3xl font-bold text-purple-100 mb-4">テストプラン</h1>
            <p className="text-purple-200 mb-6">
              現在、テストプランをご利用中です。<br />
              テストプランでは、基本的な占い機能をお試しいただけます。
            </p>
            <div className="space-y-4">
              <div className="bg-purple-700/30 rounded-lg p-4">
                <h2 className="text-xl font-bold text-purple-100 mb-2">テストプランの特徴</h2>
                <ul className="text-purple-200 space-y-2">
                  <li>• 基本的な占い機能の利用</li>
                  <li>• 1回限りの詳細な占い</li>
                  <li>• 履歴の保存</li>
                </ul>
              </div>
              <div className="bg-purple-700/30 rounded-lg p-4">
                <h2 className="text-xl font-bold text-purple-100 mb-2">制限事項</h2>
                <ul className="text-purple-200 space-y-2">
                  <li>• 一部の高度な占い機能は利用できません</li>
                  <li>• 詳細な占いは1回限りです</li>
                  <li>• サポート機能は基本的なものに限られます</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => navigate('/fortune')}
              className="mt-8 px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
            >
              占いに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // デモモードでは即座に成功
    setIsProcessing(true);
    setTimeout(() => {
      setSuccess(true);
      toast.success('サブスクリプションの登録が完了しました（デモ）');
      setTimeout(() => {
        navigate('/fortune');
      }, 2000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-purple-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-100 mb-8 text-center">サブスクリプション</h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-purple-800/30 backdrop-blur-sm rounded-xl p-6 border-2 transition-all ${
                selectedPlan === plan.id
                  ? 'border-purple-400 shadow-lg scale-105'
                  : 'border-purple-700 hover:border-purple-500'
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <h3 className="text-xl font-bold text-purple-100 mb-2">{plan.name}</h3>
              <p className="text-2xl font-bold text-purple-200 mb-4">¥{plan.price}<span className="text-sm">/月</span></p>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="text-purple-300 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {success ? (
          <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold text-green-400 mb-2">
              サブスクリプションの登録が完了しました！
            </h3>
            <p className="text-green-300">
              自動的に占いページに移動します...
            </p>
          </div>
        ) : (
          <div className="bg-purple-800/30 backdrop-blur-sm rounded-xl p-6 text-center">
            <p className="text-purple-200 mb-6">
              デモモードでは、実際の支払い処理は行われません。<br />
              「登録する」ボタンをクリックすると、デモ用の成功メッセージが表示されます。
            </p>
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => navigate('/fortune')}
                className="px-6 py-2 bg-purple-700/50 text-purple-200 rounded-lg hover:bg-purple-600/50 transition-colors"
              >
                戻る
              </button>
              <button
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="px-8 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? '処理中...' : '登録する（デモ）'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
