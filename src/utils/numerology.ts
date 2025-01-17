import { NumerologyParams, NumerologyReading, NumerologyError, ERROR_CODES } from '../types';
import { getGeminiResponse } from './ai/gemini';
import { generatePrompt } from './ai/prompts';

// 数秘術の意味定義
export const NUMEROLOGY_MEANINGS: Record<number, string> = {
  1: '独立心が強く、リーダーシップがある数。創造性と独創性に優れています。',
  2: '協調性があり、外交的な数。直感力と感受性が豊かです。',
  3: '表現力が豊かで、芸術的な才能がある数。社交的で楽観的です。',
  4: '実務能力が高く、確実性を重視する数。忍耐強く、着実です。',
  5: '自由を愛し、冒険心がある数。適応力と変化を好みます。',
  6: '責任感が強く、面倒見の良い数。調和と愛情を大切にします。',
  7: '分析力に優れ、探究心がある数。精神性と知性が高いです。',
  8: '組織力があり、物事を成し遂げる力がある数。現実的で効率的です。',
  9: '博愛精神があり、奉仕の精神に富む数。理想を追求します。'
};

// 英語の文字と数値のマッピング
const englishNameMap: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8
};

// 日本語の文字と数値のマッピング
const japaneseNameMap: Record<string, number> = {
  あ: 1, い: 2, う: 3, え: 4, お: 5,
  か: 1, き: 2, く: 3, け: 4, こ: 5,
  さ: 1, し: 2, す: 3, せ: 4, そ: 5,
  た: 1, ち: 2, つ: 3, て: 4, と: 5,
  な: 1, に: 2, ぬ: 3, ね: 4, の: 5,
  は: 1, ひ: 2, ふ: 3, へ: 4, ほ: 5,
  ま: 1, み: 2, む: 3, め: 4, も: 5,
  や: 1, ゆ: 3, よ: 5,
  ら: 1, り: 2, る: 3, れ: 4, ろ: 5,
  わ: 1, を: 6, ん: 9,
  // カタカナも同様に追加
  ア: 1, イ: 2, ウ: 3, エ: 4, オ: 5,
  カ: 1, キ: 2, ク: 3, ケ: 4, コ: 5
  // ... 他のカタカナも同様に追加
};

// 誕生日のバリデーション
function validateBirthDate(birthDate: string): void {
  if (!birthDate) {
    throw new NumerologyError('生年月日を入力してください', ERROR_CODES.INVALID_BIRTHDATE);
  }

  const date = new Date(birthDate);
  if (isNaN(date.getTime())) {
    throw new NumerologyError('有効な生年月日を入力してください', ERROR_CODES.INVALID_BIRTHDATE);
  }

  if (date > new Date()) {
    throw new NumerologyError('未来の日付は入力できません', ERROR_CODES.INVALID_BIRTHDATE);
  }
}

// 名前のバリデーション
function validateName(name: string): void {
  if (name.length > 50) {
    throw new NumerologyError('名前は50文字以内で入力してください', ERROR_CODES.INVALID_NAME);
  }

  const validCharRegex = /^[a-zA-Zぁ-んァ-ン一-龯\s]*$/;
  if (!validCharRegex.test(name)) {
    throw new NumerologyError('名前に使用できない文字が含まれています', ERROR_CODES.INVALID_NAME);
  }
}

// 名前から数秘術の数値を計算
export function calculateNameNumber(name: string): number {
  if (!name) return 0;
  
  validateName(name);
  
  const normalizedName = name.toLowerCase();
  let sum = 0;

  for (const char of normalizedName) {
    if (englishNameMap[char]) {
      sum += englishNameMap[char];
    } else if (japaneseNameMap[char]) {
      sum += japaneseNameMap[char];
    }
  }

  // 数字を1桁になるまで足し合わせる
  while (sum > 9) {
    sum = String(sum).split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  }

  return sum;
}

// 誕生日から運命数を計算
export function calculateDestinyNumber(birthDate: string): number {
  validateBirthDate(birthDate);
  
  const dateStr = birthDate.replace(/\D/g, '');
  let sum = dateStr.split('').reduce((acc, digit) => acc + parseInt(digit), 0);

  // 数字を1桁になるまで足し合わせる
  while (sum > 9) {
    sum = String(sum).split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  }

  return sum;
}

// 数秘術の結果を生成
export async function generateNumerologyReading(params: NumerologyParams): Promise<NumerologyReading> {
  try {
    const destinyNumber = calculateDestinyNumber(params.birthDate);
    const nameNumber = params.name ? calculateNameNumber(params.name) : undefined;

    // AIを使用して解釈を生成
    const { system, user } = generatePrompt('numerology', {
      type: 'numerology',
      destinyNumber,
      nameNumber,
      meanings: NUMEROLOGY_MEANINGS,
      birthDate: params.birthDate,
      name: params.name
    });

    const aiResponse = await getGeminiResponse(system, user);
    if (aiResponse.error) {
      throw new NumerologyError('AIによる解釈の生成に失敗しました', ERROR_CODES.AI_ERROR);
    }

    return {
      type: 'numerology',
      reading: aiResponse.content,
      timestamp: new Date().toISOString(),
      birthDate: params.birthDate,
      name: params.name,
      destinyNumber,
      nameNumber
    };
  } catch (error) {
    if (error instanceof NumerologyError) {
      throw error;
    }
    throw new NumerologyError(
      'エラーが発生しました',
      ERROR_CODES.UNKNOWN_ERROR
    );
  }
} 