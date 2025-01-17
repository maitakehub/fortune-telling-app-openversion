import { FortuneReading, NumerologyReading, CompatibilityReading, FortuneUpdateReading } from '../types';

// シェアするプラットフォーム
export type SharePlatform = 'twitter' | 'line' | 'facebook';

// シェアのオプション
export interface ShareOptions {
  platform: SharePlatform;
  hashtags?: string[];
  url?: string;
}

// プラットフォームごとのシェアURL生成関数
const platformUrls: Record<SharePlatform, (text: string, options: ShareOptions) => string> = {
  twitter: (text, options) => {
    const params = new URLSearchParams({
      text: text,
      url: options.url || window.location.href,
      hashtags: options.hashtags?.join(',') || ''
    });
    return `https://twitter.com/intent/tweet?${params.toString()}`;
  },
  line: (text, options) => {
    const params = new URLSearchParams({
      text: `${text}\n${options.url || window.location.href}`
    });
    return `https://line.me/R/msg/text/?${params.toString()}`;
  },
  facebook: (text, options) => {
    const params = new URLSearchParams({
      u: options.url || window.location.href,
      quote: text
    });
    return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
  }
};

// 結果の種類に応じてシェアするテキストを生成
function generateShareText(reading: FortuneReading): string {
  const timestamp = new Date(reading.timestamp).toLocaleString();

  switch (reading.type) {
    case 'numerology': {
      const numerologyReading = reading as NumerologyReading;
      return `
数秘術で運命数を占いました！
運命数: ${numerologyReading.destinyNumber}
${reading.reading}
#数秘術 #占い
      `.trim();
    }

    case 'compatibility': {
      const compatibilityReading = reading as CompatibilityReading;
      const typeNames: Record<string, string> = {
        love: '恋愛',
        work: '仕事',
        friendship: '友情'
      };
      return `
数秘術で相性を診断しました！
タイプ: ${typeNames[compatibilityReading.compatibilityType]}
相性スコア: ${compatibilityReading.score}点
${reading.reading}
#数秘術 #相性診断
      `.trim();
    }

    case 'fortune': {
      const fortuneReading = reading as FortuneUpdateReading;
      const periodNames: Record<string, string> = {
        daily: '今日',
        weekly: '今週',
        monthly: '今月',
        yearly: '今年'
      };
      return `
数秘術で${periodNames[fortuneReading.period]}の運勢を占いました！
${reading.reading}
#数秘術 #運勢
      `.trim();
    }

    default:
      return `
数秘術で占いをしました！
${reading.reading}
#数秘術 #占い
      `.trim();
  }
}

// シェアを実行
export function shareReading(reading: FortuneReading, options: ShareOptions): void {
  const text = generateShareText(reading);
  const url = platformUrls[options.platform](text, options);

  // シェアURLを新しいウィンドウで開く
  window.open(url, '_blank', 'width=600,height=400');
}

// クリップボードにコピー
export function copyToClipboard(reading: FortuneReading): Promise<void> {
  const text = generateShareText(reading);
  return navigator.clipboard.writeText(text)
    .catch(error => {
      console.error('クリップボードへのコピーに失敗しました:', error);
      throw new Error('クリップボードへのコピーに失敗しました');
    });
} 