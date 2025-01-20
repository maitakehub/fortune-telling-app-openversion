import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { processPayment } from '../utils/payment';
import { toast } from 'react-toastify';

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const location = useLocation();
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

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    securityCode: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePaymentDetails = () => {
    if (!paymentDetails.cardNumber || paymentDetails.cardNumber.length < 16) {
      setError('カード番号が無効です');
      return false;
    }
    if (!paymentDetails.expiryDate || !/^\d{2}\/\d{2}$/.test(paymentDetails.expiryDate)) {
      setError('有効期限が無効です');
      return false;
    }
    if (!paymentDetails.securityCode || paymentDetails.securityCode.length < 3) {
      setError('セキュリティコードが無効です');
      return false;
    }
    return true;
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validatePaymentDetails()) {
      return;
    }

    setIsProcessing(true);

    try {
      const result = await processPayment({
        ...paymentDetails,
        plan: selectedPlan
      });

      if (result.success) {
        setSuccess(true);
        toast.success('サブスクリプションの登録が完了しました');
        setTimeout(() => {
          navigate('/fortune');
        }, 3000);
      } else {
        setError(result.error || '支払い処理に失敗しました');
        toast.error(result.error || '支払い処理に失敗しました');
      }
    } catch (err) {
      const errorMessage = '支払い処理中にエラーが発生しました';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-purple-900 py-8 px-4" data-testid="subscription-page">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-100 mb-8 text-center">サブスクリプション</h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-purple-800/50 rounded-xl p-6 border-2 transition-all ${
                selectedPlan === plan.id
                  ? 'border-purple-400 shadow-lg scale-105'
                  : 'border-purple-700 hover:border-purple-500'
              }`}
              onClick={() => setSelectedPlan(plan.id)}
              data-testid={`plan-${plan.id}`}
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
          <div
            className="bg-green-500/10 border border-green-500/50 rounded-xl p-6 text-center"
            data-testid="success-message"
          >
            <h3 className="text-xl font-bold text-green-400 mb-2">
              サブスクリプションの登録が完了しました！
            </h3>
            <p className="text-green-300">
              自動的に占いページに移動します...
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubscribe}
            className="bg-purple-800/50 rounded-xl p-6 space-y-6"
            data-testid="payment-form"
          >
            <div>
              <label htmlFor="cardNumber" className="block text-purple-200 mb-2">
                カード番号
              </label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={paymentDetails.cardNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-purple-700/50 rounded-lg text-purple-100 border border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="1234 5678 9012 3456"
                data-testid="card-number"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiryDate" className="block text-purple-200 mb-2">
                  有効期限 (MM/YY)
                </label>
                <input
                  type="text"
                  id="expiryDate"
                  name="expiryDate"
                  value={paymentDetails.expiryDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-purple-700/50 rounded-lg text-purple-100 border border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="12/25"
                  data-testid="card-expiry"
                />
              </div>

              <div>
                <label htmlFor="securityCode" className="block text-purple-200 mb-2">
                  セキュリティコード
                </label>
                <input
                  type="text"
                  id="securityCode"
                  name="securityCode"
                  value={paymentDetails.securityCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-purple-700/50 rounded-lg text-purple-100 border border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="123"
                  data-testid="card-cvc"
                />
              </div>
            </div>

            {error && (
              <div
                className="bg-red-500/10 border border-red-500/50 rounded-lg p-4"
                data-testid="error-message"
              >
                <p className="text-red-400 text-center">{error}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => navigate('/fortune')}
                className="px-6 py-2 bg-purple-700/50 text-purple-200 rounded-lg hover:bg-purple-600/50 transition-colors"
                data-testid="skip-button"
              >
                スキップ
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="pay-button"
              >
                {isProcessing ? '処理中...' : '支払いを確定する'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
