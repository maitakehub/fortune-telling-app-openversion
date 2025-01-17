import { NumerologyReading, FortuneReading } from '../types';
import { getGeminiResponse } from './ai/gemini';
import { NUMEROLOGY_MEANINGS } from './numerology';

// 運勢の期間
export type FortunePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

// 運勢の分野
export type FortuneAspect = 'general' | 'love' | 'work' | 'health' | 'money';

// 運勢更新の結果インターフェース
export interface FortuneUpdate {
  period: FortunePeriod;
  aspects: Record<FortuneAspect, string>;
  luckyItems: {
    color: string;
    number: number;
    direction: string;
  };
  timestamp: string;
}

// 運勢の期間ごとの日本語表記
const periodNames: Record<FortunePeriod, string> = {
  daily: '今日',
  weekly: '今週',
  monthly: '今月',
  yearly: '今年'
};

// 運勢の分野ごとの日本語表記
const aspectNames: Record<FortuneAspect, string> = {
  general: '総合運',
  love: '恋愛運',
  work: '仕事運',
  health: '健康運',
  money: '金運'
};

// AIを使用して運勢を生成
async function generateFortuneUpdate(
  reading: NumerologyReading,
  period: FortunePeriod
): Promise<FortuneUpdate> {
  const destinyNumber = reading.destinyNumber;
  const meaning = NUMEROLOGY_MEANINGS[destinyNumber];

  const systemPrompt = `
あなたは数秘術の専門家として、運命数に基づいて詳細な運勢を占います。
運命数の意味と現在の時期を考慮して、具体的なアドバイスを含む運勢を提供してください。
`;

  const userPrompt = `
運命数: ${destinyNumber}（${meaning}）
期間: ${periodNames[period]}

以下の分野について、運勢とアドバイスを提供してください：
1. 総合運
2. 恋愛運
3. 仕事運
4. 健康運
5. 金運

また、以下のラッキーアイテムも提供してください：
- ラッキーカラー
- ラッキーナンバー（1-9）
- ラッキーな方角
`;

  try {
    const response = await getGeminiResponse(systemPrompt, userPrompt);
    if (response.error) {
      throw new Error('AIによる運勢の生成に失敗しました');
    }

    // AIの応答をパースして構造化
    const aspects: Record<FortuneAspect, string> = {
      general: '特に大きな変化のない穏やかな時期です。日々の生活を大切にしましょう。',
      love: '新しい出会いの可能性があります。積極的なコミュニケーションを心がけましょう。',
      work: '努力が実を結ぶ時期です。目標に向かって着実に進みましょう。',
      health: '疲れが出やすい時期です。十分な休息を取ることを忘れずに。',
      money: '予期せぬ出費に注意が必要です。計画的な支出を心がけましょう。'
    };

    const luckyItems = {
      color: '青',
      number: destinyNumber,
      direction: '東'
    };

    // AIの応答から運勢を抽出（実際にはAIの応答をパースする処理が必要）
    // ここではデフォルト値を使用

    return {
      period,
      aspects,
      luckyItems,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('運勢の生成に失敗しました:', error);
    throw error;
  }
}

// 運勢の更新が必要かチェック
function needsUpdate(lastUpdate: string, period: FortunePeriod): boolean {
  const now = new Date();
  const lastUpdateDate = new Date(lastUpdate);

  switch (period) {
    case 'daily':
      return now.getDate() !== lastUpdateDate.getDate();
    case 'weekly':
      const weekDiff = Math.floor((now.getTime() - lastUpdateDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      return weekDiff >= 1;
    case 'monthly':
      return now.getMonth() !== lastUpdateDate.getMonth();
    case 'yearly':
      return now.getFullYear() !== lastUpdateDate.getFullYear();
    default:
      return true;
  }
}

// 運勢を更新
export async function updateFortune(
  reading: NumerologyReading,
  period: FortunePeriod,
  lastUpdate?: string
): Promise<FortuneUpdate> {
  // 更新が必要かチェック
  if (lastUpdate && !needsUpdate(lastUpdate, period)) {
    throw new Error('まだ更新の必要はありません');
  }

  return generateFortuneUpdate(reading, period);
} 