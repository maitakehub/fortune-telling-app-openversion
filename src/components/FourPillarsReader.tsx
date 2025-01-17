import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, History, Lock, CreditCard } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';
import { useSubscription } from '@/subscriptions/useSubscription';

// 十干
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
// 十二支
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
// 五行
const FIVE_ELEMENTS = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
};

// 五行の相生相剋
const ELEMENT_RELATIONS = {
  '木': { generates: '火', controls: '土' },
  '火': { generates: '土', controls: '金' },
  '土': { generates: '金', controls: '水' },
  '金': { generates: '水', controls: '木' },
  '水': { generates: '木', controls: '火' }
};

// 運勢の解釈
const FORTUNE_INTERPRETATIONS = {
  '木': {
    strong: '創造性と成長の時期です。新しいプロジェクトの開始に適しています。',
    weak: '計画を練り直し、エネルギーを蓄える時期です。',
  },
  '火': {
    strong: '情熱と活力に満ちた時期です。人との出会いが重要になります。',
    weak: '感情的になりやすい時期です。冷静さを保つことが大切です。',
  },
  '土': {
    strong: '安定と実りの時期です。基盤を固めるのに適しています。',
    weak: '変化を受け入れ、柔軟に対応することが必要です。',
  },
  '金': {
    strong: '決断力と実行力が高まる時期です。目標達成に向けて進みましょう。',
    weak: '慎重な判断が必要な時期です。急がず着実に進むことが大切です。',
  },
  '水': {
    strong: '知恵と直感が冴える時期です。学びと成長のチャンスです。',
    weak: '内省と準備の時期です。次の行動の計画を立てましょう。',
  }
};

export default function FourPillarsReader() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSubscribed } = useSubscription();
  const [birthDateTime, setBirthDateTime] = useState('');
  const [pillars, setPillars] = useState<{
    year: string[];
    month: string[];
    day: string[];
    hour: string[];
  } | null>(null);
  const [interpretation, setInterpretation] = useState<string>('');
  const [error, setError] = useState<string>('');

  // 四柱を計算する関数
  const calculatePillars = (dateTime: string) => {
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();

    // 年柱の計算
    const yearStem = HEAVENLY_STEMS[(year - 4) % 10];
    const yearBranch = EARTHLY_BRANCHES[(year - 4) % 12];

    // 月柱の計算（簡略化）
    const monthStem = HEAVENLY_STEMS[(month + 2) % 10];
    const monthBranch = EARTHLY_BRANCHES[month - 1];

    // 日柱の計算（簡略化）
    const dayStem = HEAVENLY_STEMS[day % 10];
    const dayBranch = EARTHLY_BRANCHES[day % 12];

    // 時柱の計算
    const hourStem = HEAVENLY_STEMS[Math.floor(hour / 2) % 10];
    const hourBranch = EARTHLY_BRANCHES[Math.floor(hour / 2) % 12];

    return {
      year: [yearStem, yearBranch],
      month: [monthStem, monthBranch],
      day: [dayStem, dayBranch],
      hour: [hourStem, hourBranch]
    };
  };

  // 運勢を解釈する関数
  const interpretFortune = (pillars: {
    year: string[];
    month: string[];
    day: string[];
    hour: string[];
  }) => {
    // 五行の強さを計算
    const elements = {
      '木': 0,
      '火': 0,
      '土': 0,
      '金': 0,
      '水': 0
    };

    // 各柱の干支から五行の強さを計算
    [pillars.year[0], pillars.month[0], pillars.day[0], pillars.hour[0]].forEach(stem => {
      const element = FIVE_ELEMENTS[stem as keyof typeof FIVE_ELEMENTS];
      elements[element as keyof typeof elements] += 1;
    });

    // 最も強い五行と最も弱い五行を特定
    const sortedElements = Object.entries(elements).sort((a, b) => b[1] - a[1]);
    const strongestElement = sortedElements[0][0];
    const weakestElement = sortedElements[4][0];

    // 運勢の解釈を生成
    let interpretation = `【四柱推命による運勢解釈】\n\n`;
    interpretation += `基本的な性質：\n`;
    interpretation += `最も強い五行は「${strongestElement}」です。\n`;
    interpretation += FORTUNE_INTERPRETATIONS[strongestElement as keyof typeof FORTUNE_INTERPRETATIONS].strong + '\n\n';
    
    interpretation += `注意点：\n`;
    interpretation += `最も弱い五行は「${weakestElement}」です。\n`;
    interpretation += FORTUNE_INTERPRETATIONS[weakestElement as keyof typeof FORTUNE_INTERPRETATIONS].weak + '\n\n';

    interpretation += `相性：\n`;
    interpretation += `- 相生（プラスの影響）：${ELEMENT_RELATIONS[strongestElement as keyof typeof ELEMENT_RELATIONS].generates}\n`;
    interpretation += `- 相剋（注意が必要）：${ELEMENT_RELATIONS[strongestElement as keyof typeof ELEMENT_RELATIONS].controls}\n\n`;

    interpretation += `アドバイス：\n`;
    interpretation += `強い五行の特性を活かしながら、弱い五行の分野にも意識を向けることで、よりバランスの取れた運勢が期待できます。`;

    return interpretation;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubscribed) {
      setError('この機能はサブスクリプション会員専用です。');
      return;
    }
    try {
      const calculatedPillars = calculatePillars(birthDateTime);
      setPillars(calculatedPillars);
      const fortune = interpretFortune(calculatedPillars);
      setInterpretation(fortune);
      setError('');
    } catch (err) {
      setError('計算中にエラーが発生しました。入力を確認してください。');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 text-purple-100">
      <nav className="p-4 bg-purple-900/50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate('/fortune')}
            className="flex items-center space-x-2 text-purple-200 hover:text-purple-100"
          >
            <Home size={24} />
            <span>ホーム</span>
          </button>
          <button
            onClick={() => navigate('/history')}
            className="flex items-center space-x-2 text-purple-200 hover:text-purple-100"
          >
            <History size={24} />
            <span>履歴</span>
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-100 text-center flex-grow">四柱推命</h1>
            <button
              onClick={() => navigate('/fortune')}
              className="px-4 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              占い選択に戻る
            </button>
          </div>

          {!isSubscribed ? (
            <div className="p-6 bg-purple-900/30 border border-purple-700/50 rounded-lg text-center">
              <Lock className="mx-auto mb-4" size={48} />
              <h2 className="text-xl font-semibold mb-4">サブスクリプション会員限定機能</h2>
              <p className="mb-4">より詳細な運勢を知るには、サブスクリプションにご登録ください。</p>
              <button
                onClick={() => navigate('/subscription')}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center mx-auto"
              >
                <CreditCard className="mr-2" size={20} />
                サブスクリプションに登録
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-6 bg-purple-900/30 border border-purple-700/50 rounded-lg">
                <div className="mb-4">
                  <label htmlFor="birthDateTime" className="block text-sm font-medium mb-2">
                    生年月日時を入力してください
                  </label>
                  <input
                    type="datetime-local"
                    id="birthDateTime"
                    value={birthDateTime}
                    onChange={(e) => setBirthDateTime(e.target.value)}
                    className="w-full p-2 bg-purple-800/50 border border-purple-700/50 rounded-lg text-purple-100"
                    required
                  />
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                    <p className="text-red-400">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  鑑定する
                </button>
              </div>

              {pillars && interpretation && (
                <div className="p-6 bg-purple-900/30 border border-purple-700/50 rounded-lg">
                  <h2 className="text-xl font-semibold mb-4">四柱</h2>
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <h3 className="font-medium mb-2">年柱</h3>
                      <p className="text-2xl">{pillars.year.join('')}</p>
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium mb-2">月柱</h3>
                      <p className="text-2xl">{pillars.month.join('')}</p>
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium mb-2">日柱</h3>
                      <p className="text-2xl">{pillars.day.join('')}</p>
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium mb-2">時柱</h3>
                      <p className="text-2xl">{pillars.hour.join('')}</p>
                    </div>
                  </div>

                  <h2 className="text-xl font-semibold mb-4">運勢解釈</h2>
                  <pre className="whitespace-pre-wrap text-purple-100">{interpretation}</pre>
                </div>
              )}
            </form>
          )}
        </div>
      </main>
    </div>
  );
} 