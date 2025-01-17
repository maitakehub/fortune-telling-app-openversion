import { NumerologyReading } from '../types';
import { getGeminiResponse } from './ai/gemini';
import { NUMEROLOGY_MEANINGS } from './numerology';

// 相性の種類
export type CompatibilityType = 'love' | 'work' | 'friendship';

// 相性診断の結果インターフェース
export interface CompatibilityResult {
  type: CompatibilityType;
  score: number;
  reading: string;
  timestamp: string;
}

// 相性スコアを計算
function calculateCompatibilityScore(number1: number, number2: number, type: CompatibilityType): number {
  // 基本の相性表（1-9の数字の相性）
  const baseCompatibility: Record<number, number[]> = {
    1: [1, 3, 5, 9],
    2: [2, 4, 6, 8],
    3: [1, 3, 6, 9],
    4: [2, 4, 7, 8],
    5: [1, 5, 7, 9],
    6: [2, 3, 6, 9],
    7: [4, 5, 7, 8],
    8: [2, 4, 7, 8],
    9: [1, 3, 5, 9]
  };

  // タイプ別の補正値
  const typeModifiers: Record<CompatibilityType, number> = {
    love: 1.2,
    work: 1.0,
    friendship: 0.8
  };

  // 基本スコアを計算（0-100）
  let score = 0;
  if (baseCompatibility[number1].includes(number2)) {
    score = 80;
  } else if (Math.abs(number1 - number2) <= 2) {
    score = 60;
  } else {
    score = 40;
  }

  // タイプ別の補正を適用
  score = Math.min(100, Math.round(score * typeModifiers[type]));

  return score;
}

// AIを使用して相性診断の解釈を生成
async function generateCompatibilityReading(
  number1: number,
  number2: number,
  type: CompatibilityType,
  score: number
): Promise<string> {
  const meaning1 = NUMEROLOGY_MEANINGS[number1];
  const meaning2 = NUMEROLOGY_MEANINGS[number2];

  const typeNames: Record<CompatibilityType, string> = {
    love: '恋愛',
    work: '仕事',
    friendship: '友情'
  };

  const systemPrompt = `
あなたは数秘術の専門家として、2つの数字の相性を解釈します。
相性スコアと各数字の意味を考慮して、具体的なアドバイスを含む解釈を提供してください。
`;

  const userPrompt = `
数字1: ${number1}（${meaning1}）
数字2: ${number2}（${meaning2}）
相性タイプ: ${typeNames[type]}
相性スコア: ${score}点

以下の点を含めて解釈してください：
1. 2つの数字の基本的な相性
2. ${typeNames[type]}における具体的な相性
3. お互いの長所を活かすためのアドバイス
4. 注意点や改善のためのポイント
5. 今後の展望
`;

  try {
    const response = await getGeminiResponse(systemPrompt, userPrompt);
    if (response.error) {
      throw new Error('AIによる解釈の生成に失敗しました');
    }
    return response.content;
  } catch (error) {
    console.error('相性診断の解釈生成に失敗しました:', error);
    return `
相性スコア: ${score}点
基本的な相性: ${score >= 80 ? '非常に良い' : score >= 60 ? '良好' : '要注意'}
アドバイス: お互いの特徴を理解し、コミュニケーションを大切にすることで、より良い関係を築くことができます。
`;
  }
}

// 相性診断を実行
export async function analyzeCompatibility(
  reading1: NumerologyReading,
  reading2: NumerologyReading,
  type: CompatibilityType
): Promise<CompatibilityResult> {
  const score = calculateCompatibilityScore(
    reading1.destinyNumber,
    reading2.destinyNumber,
    type
  );

  const reading = await generateCompatibilityReading(
    reading1.destinyNumber,
    reading2.destinyNumber,
    type,
    score
  );

  return {
    type,
    score,
    reading,
    timestamp: new Date().toISOString()
  };
} 