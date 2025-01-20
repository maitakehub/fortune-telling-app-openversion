import { FortuneType } from '../types';

export type MessageType = 'text' | 'fortune' | 'compatibility' | 'timing' | 'advice';

export interface Message {
  id: number;
  content: string;
  sender: 'user' | 'bot';
  type: MessageType;
  timestamp: string;
  metadata?: {
    fortuneType?: string;
    targetDate?: string;
    compatibility?: {
      sign1: string;
      sign2: string;
      score: number;
    };
    suggestions?: readonly string[];
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
  userId: string;
  sessionId: string;
  lastInteraction: string;
  fortuneHistory: {
    type: FortuneType;
    result: string;
    timestamp: string;
  }[];
  preferences: {
    favoriteTypes: FortuneType[];
    interestedAspects: string[];
    language: 'ja' | 'en';
  };
}

export interface ChatState {
  messages: ChatMessage[];
  context: ChatContext;
  isLoading: boolean;
  error: string | null;
}
