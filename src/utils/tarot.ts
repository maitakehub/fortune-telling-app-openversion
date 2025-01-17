import { getGeminiResponse } from './ai';

// 型定義
export type SpreadType = 'SINGLE' | 'THREE_CARD' | 'CELTIC_CROSS';

export interface CardPosition {
  meaning: string;
}

export interface TarotCard {
  name: string;
  meaning: {
    upright: string;
    reversed: string;
  };
  element: string;
  keywords: string[];
  description: string;
}

// タロットカードの定義
export const TAROT_CARDS: Record<string, TarotCard> = {
  THE_FOOL: {
    name: '愚者',
    meaning: {
      upright: '新しい始まり、冒険、無邪気さ、自由な精神',
      reversed: '無謀、不注意、リスク、新しい始まりの遅延'
    },
    element: '空気',
    keywords: ['冒険', '自由', '純粋', '可能性'],
    description: '愚者は、タロットの旅の始まりを表す重要なカードです。新しい冒険や、未知への一歩を踏み出す勇気を象徴します。'
  },
  THE_MAGICIAN: {
    name: '魔術師',
    meaning: {
      upright: '創造力、熟練、自信、意志力',
      reversed: '操作、計画の失敗、未熟なスキル'
    },
    element: '火',
    keywords: ['創造', '意志', '熟練', '実現'],
    description: '魔術師は、あなたの持つ潜在能力と、それを現実化する力を象徴します。すべての要素を統合し、目標を達成する能力を表します。'
  },
  THE_HIGH_PRIESTESS: {
    name: '女教皇',
    meaning: {
      upright: '直感、神秘、内なる声、精神的な啓示',
      reversed: '秘密の隠蔽、直感の無視、表面的な理解'
    },
    element: '水',
    keywords: ['直感', '神秘', '知恵', '内面'],
    description: '女教皇は、深い直感と精神的な知恵を象徴します。表面下に隠れた真実と、内なる声に耳を傾けることの重要性を教えています。'
  },
  THE_EMPRESS: {
    name: '女帝',
    meaning: {
      upright: '豊かさ、創造性、母性、自然との調和',
      reversed: '創造性の停滞、依存、過保護'
    },
    element: '地',
    keywords: ['豊かさ', '創造', '母性', '自然'],
    description: '女帝は、豊かさと創造性の象徴です。自然の恵みと、育む力を表現し、物質的・精神的な充実を示唆します。'
  },
  THE_EMPEROR: {
    name: '皇帝',
    meaning: {
      upright: '権威、構造、リーダーシップ、安定性',
      reversed: '支配的、柔軟性の欠如、未熟なリーダーシップ'
    },
    element: '火',
    keywords: ['権威', '秩序', '保護', '安定'],
    description: '皇帝は、権威と秩序の象徴です。確固たる基盤を築き、目標に向かって進むための力と指導力を表します。'
  },
  THE_HIEROPHANT: {
    name: '法王',
    meaning: {
      upright: '伝統、精神的な指導、教育、信念',
      reversed: '因習への挑戦、不信、個人の信念'
    },
    element: '地',
    keywords: ['伝統', '教え', '信念', '制度'],
    description: '法王は、伝統的な教えと精神的な指導を象徴します。確立された価値観と、それを通じた学びの重要性を示します。'
  },
  THE_LOVERS: {
    name: '恋人',
    meaning: {
      upright: '愛、調和、関係性の選択、価値観の統合',
      reversed: '不調和、価値観の対立、誤った選択'
    },
    element: '空気',
    keywords: ['愛', '選択', '調和', '関係'],
    description: '恋人は、愛と選択の象徴です。重要な決断と、価値観の調和を示唆し、真の結びつきの意味を教えています。'
  },
  THE_CHARIOT: {
    name: '戦車',
    meaning: {
      upright: '前進、意志の勝利、決意、成功',
      reversed: '制御の喪失、障害、意志の欠如'
    },
    element: '水',
    keywords: ['勝利', '前進', '決意', '制御'],
    description: '戦車は、意志の力と決意の象徴です。困難を乗り越え、目標に向かって進む強さを表現しています。'
  },
  STRENGTH: {
    name: '力',
    meaning: {
      upright: '内なる力、勇気、忍耐、慈悲',
      reversed: '自信の欠如、弱さ、支配欲'
    },
    element: '火',
    keywords: ['勇気', '忍耐', '慈悲', '内なる力'],
    description: '力は、内なる強さと慈悲の象徴です。困難に立ち向かう勇気と、それを乗り越える優しさの両方を表します。'
  },
  THE_HERMIT: {
    name: '隠者',
    meaning: {
      upright: '内省、孤独な探求、精神的な啓示、指導',
      reversed: '孤立、引きこもり、内なる声の無視'
    },
    element: '地',
    keywords: ['内省', '探求', '指導', '孤独'],
    description: '隠者は、内なる探求と精神的な成長の象徴です。真理を求める孤独な旅と、その過程での気づきを表します。'
  },
  WHEEL_OF_FORTUNE: {
    name: '運命の輪',
    meaning: {
      upright: '運命、転換点、機会、サイクル',
      reversed: '不運、抵抗、避けられない変化'
    },
    element: '火',
    keywords: ['運命', '変化', '機会', '循環'],
    description: '運命の輪は、人生の循環と変化の象徴です。予期せぬ転換と、それがもたらす新たな機会を示唆します。'
  },
  JUSTICE: {
    name: '正義',
    meaning: {
      upright: '正義、真実、公平、因果応報',
      reversed: '不公平、不正、歪んだ判断'
    },
    element: '空気',
    keywords: ['正義', '均衡', '真実', '因果'],
    description: '正義は、真実と公平さの象徴です。行動の結果と、バランスの重要性を教えています。'
  },
  THE_HANGED_MAN: {
    name: '吊るされた男',
    meaning: {
      upright: '犠牲、新しい視点、待機、放棄',
      reversed: '無駄な犠牲、抵抗、停滞'
    },
    element: '水',
    keywords: ['犠牲', '視点', '待機', '解放'],
    description: '吊るされた男は、新しい視点と自発的な犠牲の象徴です。状況を違う角度から見ることの価値を示しています。'
  },
  DEATH: {
    name: '死神',
    meaning: {
      upright: '終わり、変容、再生、移行',
      reversed: '抵抗、停滞、不完全な変化'
    },
    element: '水',
    keywords: ['変容', '終わり', '再生', '解放'],
    description: '死神は、大きな変化と再生の象徴です。古いものの終わりと、新しい始まりの必要性を示唆します。'
  },
  TEMPERANCE: {
    name: '節制',
    meaning: {
      upright: '調和、バランス、適度、統合',
      reversed: '不均衡、過剰、調和の欠如'
    },
    element: '火',
    keywords: ['調和', 'バランス', '適度', '融合'],
    description: '節制は、バランスと調和の象徴です。異なる要素を統合し、中庸を保つことの重要性を教えています。'
  },
  THE_DEVIL: {
    name: '悪魔',
    meaning: {
      upright: '束縛、執着、誘惑、物質主義',
      reversed: '解放、制限からの自由、力の回復'
    },
    element: '地',
    keywords: ['束縛', '執着', '誘惑', '解放'],
    description: '悪魔は、物質的な束縛と執着の象徴です。自分を制限する信念や習慣からの解放の必要性を示唆します。'
  },
  THE_TOWER: {
    name: '塔',
    meaning: {
      upright: '突然の変化、崩壊、啓示、解放',
      reversed: '変化の回避、必要な破壊の遅延'
    },
    element: '火',
    keywords: ['崩壊', '変化', '啓示', '解放'],
    description: '塔は、突然の変化と啓示の象徴です。既存の構造の崩壊と、それによってもたらされる解放を表します。'
  },
  THE_STAR: {
    name: '星',
    meaning: {
      upright: '希望、インスピレーション、平静、導き',
      reversed: '失望、信仰の喪失、希望の欠如'
    },
    element: '空気',
    keywords: ['希望', '導き', '平和', '癒し'],
    description: '星は、希望と精神的な導きの象徴です。困難な時期の後の癒しと、新たな可能性の光を示しています。'
  },
  THE_MOON: {
    name: '月',
    meaning: {
      upright: '直感、不確実性、幻想、深い感情',
      reversed: '恐怖の克服、混乱の解消、真実の顕現'
    },
    element: '水',
    keywords: ['直感', '幻想', '不安', '神秘'],
    description: '月は、直感と潜在意識の象徴です。表面下に隠れた真実と、内なる不安や恐れを表現しています。'
  },
  THE_SUN: {
    name: '太陽',
    meaning: {
      upright: '喜び、成功、活力、明確さ',
      reversed: '一時的な暗闇、過度の楽観、注意の欠如'
    },
    element: '火',
    keywords: ['喜び', '成功', '明るさ', '活力'],
    description: '太陽は、喜びと成功の象徴です。明確な視界と、生命力に満ちた前進を示唆します。'
  },
  JUDGEMENT: {
    name: '審判',
    meaning: {
      upright: '再生、召命、内なる呼びかけ、赦し',
      reversed: '自己否定、疑念、機会の見逃し'
    },
    element: '火',
    keywords: ['再生', '召命', '赦し', '目覚め'],
    description: '審判は、精神的な目覚めと再生の象徴です。過去の経験を統合し、新たな段階へ進む準備を示しています。'
  },
  THE_WORLD: {
    name: '世界',
    meaning: {
      upright: '完成、統合、達成、旅の終わり',
      reversed: '未完成、停滞、目標の未達成'
    },
    element: '地',
    keywords: ['完成', '達成', '統合', '充実'],
    description: '世界は、完成と達成の象徴です。一つの周期の終わりと、すべての要素の調和的な統合を表します。'
  }
};

// カードを引く関数
export function drawCards(count: number): string[] {
  const allCards = Object.keys(TAROT_CARDS);
  const selectedCards: string[] = [];
  const usedIndices = new Set<number>();

  while (selectedCards.length < count) {
    const randomIndex = Math.floor(Math.random() * allCards.length);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      selectedCards.push(allCards[randomIndex]);
    }
  }

  return selectedCards;
}

// カードの詳細情報を取得する関数
export function getCardDetail(cardKey: string): string {
  const card = TAROT_CARDS[cardKey];
  return `${card.name}\n${card.meaning.upright}`;
}

// タロットリーディングを生成する関数
export async function generateTarotReading(
  spreadType: SpreadType,
  question: string,
  selectedCards: string[]
): Promise<string> {
  try {
    const cards = selectedCards.map(key => TAROT_CARDS[key]);
    const prompt = generateReadingPrompt(spreadType, question, cards);
    const response = await getGeminiResponse(prompt);
    return response;
  } catch (error) {
    console.error('Error generating tarot reading:', error);
    throw new Error('タロットレスポンスの生成中にエラーが発生しました。');
  }
}

// チャットレスポンスを生成する関数
export async function generateTarotChatResponse(spreadType: SpreadType, question: string, selectedCards: string[]): Promise<string> {
  try {
    const cardDetails = selectedCards.map(cardKey => {
      const card = TAROT_CARDS[cardKey];
      return {
        name: card.name,
        meaning: card.meaning.upright,
        element: card.element,
        keywords: card.keywords.join('、'),
        description: card.description
      };
    });

    const prompt = `
あなたは経験豊富なタロット占い師として、以下のカードの組み合わせから意味を読み取り、質問者へアドバイスを提供してください。

【引かれたカード】
${cardDetails.map((card, index) => `
${index + 1}枚目: ${card.name}
- 基本的な意味: ${card.meaning}
- 元素: ${card.element}
- キーワード: ${card.keywords}
- 解説: ${card.description}
`).join('\n')}

【質問内容】
${question || 'カードの一般的な解釈をお願いします'}

以下の点に注目して、丁寧に解釈してください：
1. 各カードの基本的な意味
2. カード同士の関係性
3. 質問に対する具体的なアドバイス
4. 今後の展望

解釈は簡潔かつ分かりやすく、前向きな表現を心がけてください。
`;

    const response = await getGeminiResponse(prompt);
    return response;
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw new Error('タロットの解釈中にエラーが発生しました。');
  }
}

// リーディング用のプロンプトを生成する関数
function generateReadingPrompt(
  spreadType: SpreadType,
  question: string,
  cards: TarotCard[]
): string {
  const spreadInfo = getSpreadInfo(spreadType);
  const cardDetails = cards.map((card, index) => {
    const position = spreadInfo.positions[index].meaning;
    return `
位置: ${position}
カード: ${card.name}
意味: ${card.meaning.upright}
元素: ${card.element}
キーワード: ${card.keywords.join('、')}
説明: ${card.description}
`;
  }).join('\n');

  return `
あなたは経験豊富なタロット占い師として、以下のカードの組み合わせから詳細な解釈を提供してください。

【スプレッドタイプ】
${spreadInfo.name}
${spreadInfo.description}

【選ばれたカード】
${cardDetails}

回答は以下のフォーマットで、各セクションを明確に分けて提供してください：

【タロットからのメッセージ】

**1. カードの位置が示す具体的な意味**
[ここに解説を記入]

**2. カードの組み合わせから読み取れる状況の全体像**
[ここに解説を記入]

**3. 現在の課題と可能性**
[ここに解説を記入]

**4. 未来への展望と注意点**
[ここに解説を記入]

**5. 質問者への具体的なアドバイスや行動の提案**
[ここに解説を記入]

**6. 特に注目すべきカードや組み合わせについての詳細な解説**
[ここに解説を記入]

以下の点に注意して解釈を行ってください：
1. 各カードの位置の意味を考慮に入れる
2. カード同士の相互作用や影響を分析する
3. 具体的で実践的なアドバイスを含める
4. 前向きで建設的な解釈を心がける
5. 各カードの元素や象徴的な意味も考慮する

また、解釈は必ず日本語で提供し、専門用語は適切に説明を加えてください。
`;
}

// チャット用のプロンプトを生成する関数
function generateChatPrompt(
  spreadType: SpreadType,
  question: string,
  cards: TarotCard[]
): string {
  const cardDetails = cards.map(card => `
カード: ${card.name}
意味: ${card.meaning.upright}
元素: ${card.element}
キーワード: ${card.keywords.join('、')}
説明: ${card.description}
`).join('\n');

  return `
あなたは経験豊富なタロット占い師として、質問者の以下の質問に対して、選ばれたカードに基づいて回答してください。

【質問】
${question}

【選ばれたカード】
${cardDetails}

以下の点に注意して回答を行ってください：
1. 質問の意図を正確に理解し、カードの意味と結びつけて解説する
2. 具体的で実践的なアドバイスを含める
3. 前向きで建設的な解釈を心がける
4. 必要に応じて、追加の質問を促す
5. カードの象徴的な意味や元素の特性も考慮する

また、回答は必ず日本語で提供し、専門用語は適切に説明を加えてください。
`;
}

// スプレッドの情報を取得する関数
function getSpreadInfo(spreadType: SpreadType) {
  const spreadInfo = {
    SINGLE: {
      name: 'シングルカード',
      description: '今日のメッセージや、単一の質問への答えを得るのに適しています。',
      positions: [{ meaning: '現在の状況や、質問への答え' }]
    },
    THREE_CARD: {
      name: '3枚スプレッド',
      description: '過去、現在、未来、または状況の展開を見るのに適しています。',
      positions: [
        { meaning: '過去の影響' },
        { meaning: '現在の状況' },
        { meaning: '未来の可能性' }
      ]
    },
    CELTIC_CROSS: {
      name: 'ケルティッククロス',
      description: '状況を深く詳細に分析するための伝統的なスプレッドです。',
      positions: [
        { meaning: '現在の状況' },
        { meaning: '直面する課題' },
        { meaning: '目標や理想' },
        { meaning: '過去の基礎' },
        { meaning: '可能性や希望' },
        { meaning: '未来の展開' },
        { meaning: '自分自身の態度' },
        { meaning: '周囲の影響' },
        { meaning: '希望と不安' },
        { meaning: '最終的な結果' }
      ]
    }
  };

  return spreadInfo[spreadType];
}