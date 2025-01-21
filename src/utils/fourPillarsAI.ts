import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface FourPillarsData {
  year: { stem: string; branch: string };
  month: { stem: string; branch: string };
  day: { stem: string; branch: string };
  hour: { stem: string; branch: string };
  mainElement: string;
  lifeStage: string;
}

const generateFourPillarsPrompt = (data: FourPillarsData): string => {
  return `あなたは四柱推命の熟練した占い師です。以下の四柱推命の情報から、詳細な運勢解釈とアドバイスを提供してください。

与えられた情報：
- 年柱: ${data.year.stem}${data.year.branch}
- 月柱: ${data.month.stem}${data.month.branch}
- 日柱: ${data.day.stem}${data.day.branch}
- 時柱: ${data.hour.stem}${data.hour.branch}
- 主たる五行: ${data.mainElement}
- 現在の運勢段階: ${data.lifeStage}

以下の項目について、詳細な解釈を行ってください：

1. 基本性格と素質
- 年柱と月柱から読み取れる生まれ持った資質
- 日柱から見る本質的な性格
- 時柱が示す内面的な傾向

2. 現在の運勢
- ${data.lifeStage}の段階における具体的な意味
- ${data.mainElement}の五行が示す現在のエネルギーの流れ
- 四柱の組み合わせが示す現在の課題と機会

3. 人生の方向性
- キャリアと職業適性
- 対人関係での強みと注意点
- 健康面での助言

4. 具体的なアドバイス
- 現在の状況を改善するための3つの具体的なアクション
- ${data.mainElement}の性質を活かすための実践的な方法
- 避けるべき行動や注意点

5. 期待できる変化
- 短期的な変化の兆し
- 長期的な展望
- 活かすべき機会

できるだけ具体的で実践的な助言を含め、前向きで建設的な内容としてください。`;
};

export const generateAIInterpretation = async (data: FourPillarsData) => {
  try {
    const prompt = generateFourPillarsPrompt(data);
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "あなたは四柱推命の熟練した占い師です。クライアントの運勢を詳しく解釈し、具体的で実用的なアドバイスを提供してください。"
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