import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Sparkles, Home, History } from 'lucide-react';
import { usePersonalInfo } from '../contexts/PersonalInfoContext';
import { Message, ChatContext } from '../types/chat';
import { getOpenAIResponse } from '../utils/openai';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

const SUGGESTIONS = [
  "今日の運勢を教えて",
  "恋愛運が知りたいです",
  "仕事でのアドバイスをください",
  "金運アップの方法は？",
  "健康運はどうですか？",
  "いつが転機となりそう？",
] as const;

type Suggestion = typeof SUGGESTIONS[number];

export default function AstrologyChatBot() {
  const { personalInfo } = usePersonalInfo();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [chatContext, setChatContext] = useState<ChatContext>({
    consecutiveQuestions: 0,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // チャットの初期メッセージを設定
  useEffect(() => {
    if (messages.length === 0 && personalInfo) {
      const initialMessage: Message = {
        id: 1,
        content: `こんにちは、${personalInfo.name}さん！\n${personalInfo.zodiacSign}の視点から、あなたの運勢についてお話しできることを嬉しく思います。\n\n気になることについて、お気軽にお尋ねください。`,
        sender: 'bot',
        type: 'text',
        timestamp: new Date(),
        metadata: {
          suggestions: [...SUGGESTIONS],
        },
      };
      setMessages([initialMessage]);
    }
  }, [personalInfo]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const analyzeSuggestions = (userInput: string): Suggestion[] => {
    const suggestions: Suggestion[] = [];
    
    if (userInput.includes('恋愛')) {
      suggestions.push(
        "恋愛運が知りたいです",
        "いつが転機となりそう？"
      );
    } else if (userInput.includes('仕事')) {
      suggestions.push(
        "仕事でのアドバイスをください",
        "いつが転機となりそう？"
      );
    } else if (userInput.includes('金運')) {
      suggestions.push(
        "金運アップの方法は？",
        "今日の運勢を教えて"
      );
    } else {
      suggestions.push(
        "今日の運勢を教えて",
        "健康運はどうですか？",
        "いつが転機となりそう？"
      );
    }

    return suggestions;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const now = new Date(); // 現在の時刻を取得

    const userMessage: Message = {
      id: Date.now(),
      content: input,
      sender: 'user',
      type: 'text',
      timestamp: now,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const conversationHistory: { role: 'user' | 'model'; content: string }[] = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        content: msg.content,
      }));

      // personalInfoを渡して応答を生成
      const response = await getOpenAIResponse(input, conversationHistory, now);

      const newSuggestions = analyzeSuggestions(input);

      const botMessage: Message = {
        id: Date.now() + 1,
        content: response,
        sender: 'bot',
        type: 'fortune',
        timestamp: new Date(),
        metadata: {
          suggestions: newSuggestions,
        },
      };

      setMessages(prev => [...prev, botMessage]);
      setChatContext(prev => ({
        ...prev,
        lastQuestion: input,
        consecutiveQuestions: prev.consecutiveQuestions + 1,
      }));
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        content: '申し訳ありません。一時的な問題が発生しました。もう一度お試しください。',
        sender: 'bot',
        type: 'text',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => setShowSuggestions(true), 1000);
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* ローディング画面 */}
      <AnimatePresence>
        {isLoading && (
          <LoadingSpinner message="星々の導きを受けています..." />
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-100 text-center flex-grow">AIと対話しながら星占い</h1>
        <button
          onClick={() => navigate('/fortune')}
          className="px-4 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          占い選択に戻る
        </button>
      </div>

      <div className="flex flex-col">
        <div className="h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex items-start gap-3 ${
                    message.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user'
                        ? 'bg-purple-500'
                        : 'bg-indigo-600'
                    }`}
                  >
                    {message.sender === 'user' ? (
                      <User size={16} className="text-white" />
                    ) : (
                      <Bot size={16} className="text-white" />
                    )}
                  </div>
                  <div className="space-y-2 max-w-[80%]">
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-purple-500 text-white'
                          : 'bg-indigo-600/50 text-purple-50'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {message.sender === 'bot' && message.metadata?.suggestions && showSuggestions && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.metadata.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => setInput(suggestion)}
                            className="text-sm px-3 py-1 rounded-full bg-purple-900/30 text-purple-200 hover:bg-purple-800/30 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          <div className="relative mt-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="運勢や気になることを聞いてください..."
              className="w-full bg-purple-900/30 text-purple-100 placeholder-purple-300/50 rounded-full py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${
                isLoading || !input.trim()
                  ? 'bg-purple-800/50 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-500'
              }`}
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
