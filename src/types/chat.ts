import { FortuneType } from '../types';

export type MessageType = 'text' | 'fortune' | 'compatibility' | 'timing' | 'advice';

export interface Message {
  id: number;
  content: string;
  sender: 'user' | 'bot';
  type: 'text' | 'fortune';
  timestamp: Date;
  metadata?: {
    suggestions?: string[];
  };
}

export interface ChatMessage {
  id: number;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
  metadata?: {
    fortuneType?: FortuneType;
    context?: {
      zodiacSign?: string;
      birthDate?: string;
      previousReadings?: string[];
      userPreferences?: Record<string, any>;
    };
    suggestions?: string[];
  };
}

export interface ChatContext {
  userId?: string;
  sessionId?: string;
  lastInteraction?: Date;
  lastQuestion?: string;
  consecutiveQuestions: number;
  fortuneHistory?: string[];
  preferences?: {
    responseStyle?: 'detailed' | 'concise';
    language?: 'ja' | 'en';
    fortuneType?: 'general' | 'love' | 'career' | 'money';
  };
}

export interface ChatState {
  messages: ChatMessage[];
  context: ChatContext;
  isLoading: boolean;
  error: string | null;
}
