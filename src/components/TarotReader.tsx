import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  generateTarotReading, 
  generateTarotChatResponse,
  drawCards, 
  TAROT_CARDS, 
  getCardDetail,
  type TarotCard,
  type SpreadType,
  type CardPosition
} from '../utils/tarot';
import { classNames } from '../utils/styles';
import LoadingSpinner from './LoadingSpinner';

// 型定義
interface TarotReaderProps {
  onFeedback?: (feedback: string) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface SpreadPattern {
  name: string;
  description: string;
  positions: CardPosition[];
}

// スプレッドパターンの定義
const SPREAD_PATTERNS: Record<SpreadType, SpreadPattern> = {
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

// カード画像のパス定義
const CARD_IMAGES = {
  back: '/tarot/back.jpg',
  cards: {
    THE_FOOL: '/tarot/fool.jpg',
    THE_MAGICIAN: '/tarot/magician.jpg',
    THE_HIGH_PRIESTESS: '/tarot/high_priestess.jpg',
    THE_EMPRESS: '/tarot/empress.jpg',
    THE_EMPEROR: '/tarot/emperor.jpg',
    THE_HIEROPHANT: '/tarot/hierophant.jpg',
    THE_LOVERS: '/tarot/lovers.jpg',
    THE_CHARIOT: '/tarot/chariot.jpg',
    STRENGTH: '/tarot/strength.jpg',
    THE_HERMIT: '/tarot/hermit.jpg',
    WHEEL_OF_FORTUNE: '/tarot/wheel_of_fortune.jpg',
    JUSTICE: '/tarot/justice.jpg',
    THE_HANGED_MAN: '/tarot/hanged_man.jpg',
    DEATH: '/tarot/death.jpg',
    TEMPERANCE: '/tarot/temperance.jpg',
    THE_DEVIL: '/tarot/devil.jpg',
    THE_TOWER: '/tarot/tower.jpg',
    THE_STAR: '/tarot/star.jpg',
    THE_MOON: '/tarot/moon.jpg',
    THE_SUN: '/tarot/sun.jpg',
    JUDGEMENT: '/tarot/judgement.jpg',
    THE_WORLD: '/tarot/world.jpg'
  } as const
};

// スタイル定義
const styles = {
  container: {
    background: 'linear-gradient(135deg, rgba(18, 10, 32, 0.95) 0%, rgba(25, 15, 45, 0.95) 100%)',
    minHeight: '100vh',
    width: '100vw',
    overflow: 'hidden'
  },
  section: {
    background: 'rgba(30, 20, 50, 0.3)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)'
  },
  cardBack: {
    background: `url('/tarot/back.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    boxShadow: `
      0 0 20px rgba(88, 40, 169, 0.2),
      inset 0 0 15px rgba(138, 43, 226, 0.1)
    `
  },
  decoration: {
    background: `
      repeating-linear-gradient(
        45deg,
        rgba(138, 43, 226, 0.05) 0%,
        rgba(138, 43, 226, 0.05) 2px,
        transparent 2px,
        transparent 8px
      ),
      repeating-linear-gradient(
        -45deg,
        rgba(138, 43, 226, 0.05) 0%,
        rgba(138, 43, 226, 0.05) 2px,
        transparent 2px,
        transparent 8px
      )
    `
  }
};

// アニメーション設定
const animations = {
  deck: {
    initial: {
      scale: 1,
      y: 0,
      rotateY: 0,
      transition: { duration: 0.5 }
    },
    drawing: (index: number) => ({
      scale: [1, 1.02, 1],
      y: [0, -5, 0],
      rotateY: [0, -2, 0],
      transition: {
        duration: 0.6,
        times: [0, 0.5, 1],
        ease: "easeInOut"
      }
    })
  },
  card: {
    initial: { 
      scale: 0.8,
      opacity: 0,
      y: 50
    },
    enter: (index: number) => ({
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: index * 0.1,
        ease: "easeOut"
      }
    }),
    hover: {
      scale: 1.05,
      y: -5,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  },
  chat: {
    overlay: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    modal: {
      initial: { scale: 0.9, opacity: 0 },
      animate: { 
        scale: 1, 
        opacity: 1,
        transition: {
          duration: 0.3,
          ease: "easeOut"
        }
      },
      exit: { 
        scale: 0.9, 
        opacity: 0,
        transition: {
          duration: 0.2,
          ease: "easeIn"
        }
      }
    }
  }
};

// MysticSymbol コンポーネント
const MysticSymbol: React.FC = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full text-purple-300/40"
    style={{ filter: 'drop-shadow(0 0 8px rgba(138, 43, 226, 0.3))' }}
  >
    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1" />
    <path
      d="M50 5 L50 95 M5 50 L95 50 M15.5 15.5 L84.5 84.5 M15.5 84.5 L84.5 15.5"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
    <circle cx="50" cy="50" r="8" fill="currentColor" />
  </svg>
);

export default function TarotReader({ onFeedback }: TarotReaderProps) {
  const navigate = useNavigate();
  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // State管理
  const [spreadType, setSpreadType] = useState<SpreadType>('SINGLE');
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [cardDetails, setCardDetails] = useState<string[]>([]);
  const [reading, setReading] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeck, setShowDeck] = useState(true);
  const [drawingCard, setDrawingCard] = useState(false);
  const [drawingIndex, setDrawingIndex] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // チャットメッセージが追加されたら自動スクロール
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // チャットが表示されたらinputにフォーカス
  useEffect(() => {
    if (showChat && chatInputRef.current) {
      chatInputRef.current.focus();
    }
  }, [showChat]);

  // スプレッド選択時の処理
  const handleSpreadChange = useCallback((value: SpreadType) => {
    setSpreadType(value);
    setSelectedCards([]);
    setCardDetails([]);
    setReading(null);
    setShowDeck(true);
    setError(null);
  }, []);

  // カードを引く処理
  const handleDrawCard = useCallback(async () => {
    try {
      setError(null);
      setDrawingCard(true);
      setIsLoading(true);

      const pattern = SPREAD_PATTERNS[spreadType];
      const drawnCards = drawCards(pattern.positions.length);
      setSelectedCards(drawnCards);

      // カードの詳細を取得
      const details = drawnCards.map(card => getCardDetail(card));
      setCardDetails(details);

      // リーディングを生成
      const readingResult = await generateTarotReading(spreadType, "今日の運勢を教えてください", drawnCards);
      setReading(readingResult);

      setShowDeck(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '占いの生成中にエラーが発生しました');
      console.error('Tarot reading error:', err);
    } finally {
      setDrawingCard(false);
      setIsLoading(false);
    }
  }, [spreadType]);

  // チャットメッセージを送信
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    try {
      setIsChatLoading(true);
      setChatMessages(prev => [...prev, { role: 'user', content: message }]);
      setChatInput('');

      const response = await generateTarotChatResponse(spreadType, message, selectedCards);
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);

      if (chatMessagesRef.current) {
        chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'チャットの生成中にエラーが発生しました');
      console.error('Chat error:', err);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 p-8">
      {/* ローディング画面 */}
      <AnimatePresence>
        {(isLoading || drawingCard) && (
          <LoadingSpinner message={
            drawingCard ? 'カードを選んでいます...' : 
            isLoading ? 'カードを読み解いています...' : 
            '占い中...'
          } />
        )}
      </AnimatePresence>

      <div className="max-w-[1920px] mx-auto px-4 py-6">
        {/* ヘッダー */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-pink-200">
            タロットカードリーディング
          </h1>
          <button
            onClick={() => navigate('/fortune')}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-lg transition-colors"
          >
            占い選択に戻る
          </button>
        </header>

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
          {/* 左カラム：スプレッド選択、デッキ、カード表示 */}
          <div className="lg:sticky lg:top-6 lg:self-start space-y-6">
            <div style={styles.section} className="p-6">
              <div className="space-y-4">
                <label className="block text-lg font-medium text-purple-200">
                  スプレッドを選択
                </label>
                <select
                  value={spreadType}
                  onChange={(e) => handleSpreadChange(e.target.value as SpreadType)}
                  className="w-full p-3 bg-purple-900/30 border border-purple-500/30 rounded-lg text-purple-100 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                >
                  {Object.entries(SPREAD_PATTERNS).map(([key, { name }]) => (
                    <option key={key} value={key}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* デッキ */}
              {showDeck && (
                <div className="relative w-[150px] h-[225px] mx-auto my-6">
                  <motion.div
                    style={styles.cardBack}
                    className="absolute w-full h-full rounded-xl overflow-hidden"
                    variants={animations.deck}
                    initial="initial"
                    animate={drawingCard ? "drawing" : "initial"}
                    custom={drawingIndex}
                  />
                </div>
              )}

              <button
                onClick={handleDrawCard}
                disabled={isLoading}
                className={classNames(
                  "w-full py-3 rounded-lg font-medium transition-all duration-300",
                  "bg-gradient-to-r from-purple-500 to-pink-500",
                  "hover:from-purple-600 hover:to-pink-600",
                  "focus:outline-none focus:ring-2 focus:ring-purple-400",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "text-white shadow-lg"
                )}
              >
                {isLoading ? 'カードを選んでいます...' : 'カードを引く'}
              </button>
            </div>

            {/* 選ばれたカード */}
            {selectedCards.length > 0 && (
              <div style={styles.section} className="p-6">
                <div className={classNames(
                  'grid',
                  spreadType === 'SINGLE' && 'grid-cols-1 place-items-center',
                  spreadType === 'THREE_CARD' && 'grid-cols-3 gap-x-4',
                  spreadType === 'CELTIC_CROSS' && 'grid-cols-2 gap-4'
                )}>
                  <AnimatePresence mode="wait">
                    {selectedCards.map((cardKey, index) => (
                      <motion.div
                        key={cardKey}
                        variants={animations.card}
                        initial="initial"
                        animate="enter"
                        whileHover="hover"
                        custom={index}
                        className="relative"
                      >
                        <div className="w-[120px] h-[180px] rounded-xl shadow-xl overflow-hidden">
                          <img
                            src={CARD_IMAGES.cards[cardKey as keyof typeof CARD_IMAGES.cards]}
                            alt={TAROT_CARDS[cardKey].name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                              <h4 className="font-bold text-xs mb-1">
                                {SPREAD_PATTERNS[spreadType].positions[index].meaning}
                              </h4>
                              <p className="text-xs opacity-90">
                                {TAROT_CARDS[cardKey].name}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          {/* 右カラム：リーディング結果 */}
          {reading && (
            <div style={styles.section} className="p-6">
              <h2 className="text-xl font-semibold text-purple-200 mb-6">
                タロットからのメッセージ
              </h2>
              <div className="prose prose-invert max-w-none">
                {reading.split('\n').map((line, index) => {
                  if (line.startsWith('【')) {
                    return (
                      <h3 key={index} className="text-lg font-bold text-purple-200 mt-6 mb-3">
                        {line}
                      </h3>
                    );
                  }
                  if (line.startsWith('**')) {
                    return (
                      <h4 key={index} className="text-base font-semibold text-purple-300 mt-4 mb-2">
                        {line.replace(/\*\*/g, '')}
                      </h4>
                    );
                  }
                  if (line.trim() === '') {
                    return <br key={index} />;
                  }
                  return (
                    <p key={index} className="text-purple-100 leading-relaxed mb-3">
                      {line}
                    </p>
                  );
                })}
              </div>

              <button
                onClick={() => setShowChat(true)}
                className="mt-6 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-lg transition-colors"
              >
                詳しく質問する
              </button>
            </div>
          )}
        </div>

        {/* チャットモーダル */}
        <AnimatePresence>
          {showChat && (
            <div className="fixed inset-0 z-50">
              <motion.div
                className="absolute inset-0 bg-black/50"
                variants={animations.chat.overlay}
                initial="initial"
                animate="animate"
                exit="exit"
                onClick={() => setShowChat(false)}
              />
              
              <div className="absolute inset-0 overflow-y-auto">
                <div className="min-h-full flex items-center justify-center p-4">
                  <motion.div
                    style={styles.section}
                    className="w-full max-w-2xl bg-purple-900/95"
                    variants={animations.chat.modal}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    {/* チャットヘッダー */}
                    <div className="p-6 flex justify-between items-center border-b border-purple-500/20">
                      <h2 className="text-xl font-semibold text-purple-200">
                        カードとの対話
                      </h2>
                      <button
                        onClick={() => setShowChat(false)}
                        className="text-purple-200 hover:text-purple-100 transition-colors"
                      >
                        <span className="sr-only">閉じる</span>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* チャットメッセージ */}
                    <div 
                      ref={chatMessagesRef}
                      className="p-6 max-h-[50vh] overflow-y-auto space-y-4"
                    >
                      {chatMessages.map((message, index) => (
                        <div
                          key={index}
                          className={classNames(
                            'p-4 rounded-lg max-w-[80%]',
                            message.role === 'user' 
                              ? 'bg-purple-500/20 ml-auto' 
                              : 'bg-purple-900/30 mr-auto'
                          )}
                        >
                          <p className="text-purple-100 leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      ))}
                      {isChatLoading && (
                        <div className="bg-purple-900/30 p-4 rounded-lg mr-auto max-w-[80%]">
                          <p className="text-purple-300">
                            タロットカードから返答を受け取っています...
                          </p>
                        </div>
                      )}
                    </div>

                    {/* チャット入力 */}
                    <div className="p-6 border-t border-purple-500/20">
                      <div className="flex gap-3">
                        <input
                          ref={chatInputRef}
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage(chatInput);
                            }
                          }}
                          placeholder="カードについて質問してください..."
                          className={classNames(
                            "flex-1 p-3 rounded-lg",
                            "bg-purple-900/30 border border-purple-500/30",
                            "text-purple-100 placeholder-purple-400",
                            "focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                          )}
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleSendMessage(chatInput);
                          }}
                          disabled={isChatLoading || !chatInput.trim()}
                          className={classNames(
                            "px-6 py-3 rounded-lg transition-colors",
                            "bg-purple-500/20 hover:bg-purple-500/30",
                            "disabled:bg-purple-600/10 disabled:cursor-not-allowed",
                            "text-purple-200"
                          )}
                        >
                          送信
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}