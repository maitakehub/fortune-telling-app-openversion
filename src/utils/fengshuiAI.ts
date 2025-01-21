import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// 部屋の位置の種類
export const ROOM_POSITIONS = [
  '玄関',
  'リビング',
  'キッチン',
  'ダイニング',
  '寝室',
  '子供部屋',
  '書斎',
  'トイレ',
  '浴室',
  '洗面所',
  'バルコニー',
  '和室',
] as const;

export type RoomPosition = typeof ROOM_POSITIONS[number];

// 方角の種類
export const DIRECTIONS = [
  '北',
  '北東',
  '東',
  '南東',
  '南',
  '南西',
  '西',
  '北西',
] as const;

export type Direction = typeof DIRECTIONS[number];

interface FengshuiRoomData {
  position: RoomPosition;
  direction: Direction;
  imageUrl?: string;
}

interface FengshuiFloorPlanData {
  imageUrl: string;
  mainDirection: Direction;
}

const generateRoomPrompt = (data: FengshuiRoomData): string => {
  return `あなたは風水の専門家です。以下の情報から、部屋の風水を詳しく解釈し、具体的なアドバイスを提供してください。

部屋の情報：
- 部屋の種類: ${data.position}
- 方角: ${data.direction}
${data.imageUrl ? '- 画像が提供されています' : ''}

以下の項目について詳しく解説してください：

1. 現状の風水評価
- ${data.position}の理想的な風水の特徴
- 現在の方角（${data.direction}）が持つ意味
- 気の流れの状態

2. 運気への影響
- 健康運への影響
- 金運への影響
- 人間関係への影響
- 仕事運・学業運への影響

3. 改善のアドバイス
- 配置の改善点
- おすすめの色や素材
- 追加すべきアイテム
- 避けるべき要素

4. 季節ごとの調整
- 現在の季節における注意点
- 季節の変わり目での調整ポイント

5. 具体的な開運アクション
- 即実践できる3つの改善策
- 長期的に検討すべき改善案
- 定期的なメンテナンスのポイント

できるだけ具体的で実践的な助言を含め、前向きで建設的な内容としてください。`;
};

const generateFloorPlanPrompt = (data: FengshuiFloorPlanData): string => {
  return `あなたは風水の専門家です。提供された間取り図と方角の情報から、住居全体の風水を詳しく解釈し、具体的なアドバイスを提供してください。

住居の情報：
- 主要な方角: ${data.mainDirection}
- 間取り図が提供されています

以下の項目について詳しく解説してください：

1. 全体的な気の流れ
- 住居全体のエネルギーバランス
- 気の流れの特徴と課題
- 主要な方角（${data.mainDirection}）の影響

2. 各エリアの評価
- パブリックスペース（リビング、ダイニング等）の配置評価
- プライベートスペース（寝室等）の配置評価
- 水回りの配置評価
- 玄関・出入り口の評価

3. 運気の影響
- 家族全体の運気への影響
- 財運・金運への影響
- 健康運への影響
- 人間関係・家族関係への影響

4. 改善提案
- 家具の配置に関する提案
- 色使いや素材の提案
- 各部屋の用途変更の提案
- 装飾品や開運アイテムの提案

5. 具体的な改善アクション
- 即実践できる3つの改善策
- 中長期的な改善計画
- 定期的な見直しポイント
- 季節ごとの調整方法

できるだけ具体的で実践的な助言を含め、前向きで建設的な内容としてください。
また、大規模な改装が必要な提案と、現状でできる工夫を分けて提示してください。`;
};

export const generateRoomFengshuiInterpretation = async (data: FengshuiRoomData) => {
  try {
    const prompt = generateRoomPrompt(data);
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "あなたは風水の専門家です。クライアントの住空間を詳しく解釈し、具体的で実用的なアドバイスを提供してください。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return response.choices[0].message.content || "申し訳ありませんが、解釈を生成できませんでした。";
  } catch (error) {
    console.error("AI解釈の生成中にエラーが発生しました:", error);
    throw new Error("AI解釈の生成中にエラーが発生しました。しばらく待ってから再度お試しください。");
  }
};

export const generateFloorPlanFengshuiInterpretation = async (data: FengshuiFloorPlanData) => {
  try {
    const prompt = generateFloorPlanPrompt(data);
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "あなたは風水の専門家です。クライアントの間取り図の情報を詳しく解釈し、具体的で実用的なアドバイスを提供してください。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return response.choices[0].message.content || "申し訳ありませんが、解釈を生成できませんでした。";
  } catch (error) {
    console.error("AI解釈の生成中にエラーが発生しました:", error);
    throw new Error("AI解釈の生成中にエラーが発生しました。しばらく待ってから再度お試しください。");
  }
}; 