// 占いの種類
export type FortuneType = 'numerology' | 'tarot' | 'palm' | 'dream' | 'compatibility' | 'fortune' | 'general';

// 数秘術のパラメータ
export interface NumerologyParams {
  birthDate: string;
  name?: string;
}

// 基本の占い結果インターフェース
export interface FortuneReading {
  type: FortuneType;
  reading: string;
  timestamp: string;
  // 相性診断用のプロパティ
  compatibilityType?: 'love' | 'work' | 'friendship';
  score?: number;
  // 運勢更新用のプロパティ
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  aspects?: Record<string, string>;
  luckyItems?: {
    color: string;
    number: number;
    direction: string;
  };
}

// 数秘術の結果インターフェース
export interface NumerologyReading extends FortuneReading {
  type: 'numerology';
  birthDate: string;
  name?: string;
  destinyNumber: number;
  nameNumber?: number;
}

// 相性診断の結果インターフェース
export interface CompatibilityReading extends FortuneReading {
  type: 'compatibility';
  compatibilityType: 'love' | 'work' | 'friendship';
  score: number;
}

// 運勢更新の結果インターフェース
export interface FortuneUpdateReading extends FortuneReading {
  type: 'fortune';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  aspects: Record<string, string>;
  luckyItems: {
    color: string;
    number: number;
    direction: string;
  };
}

// AIレスポンスの型
export interface AIResponse {
  content: string;
  error?: FortuneError | null;
}

// シンボルの詳細情報
export interface SymbolDetail {
  name: string;
  meaning: string;
  interpretation: string;
  category: string;
  importance: number;  // シンボルの重要度
}

// プロンプトのパラメータ
export interface PromptParams {
  type: FortuneType;
  // 数秘術用のパラメータ
  destinyNumber?: number;
  nameNumber?: number;
  meanings?: Record<number, string>;
  birthDate?: string;
  name?: string;
  // タロット用のパラメータ
  cards?: {
    name: string;
    position: string;
    meaning: {
      upright: string;
      reversed: string;
    };
  }[];
  question?: string;  // 質問（タロットと夢占い共通）
  // 手相用のパラメータ
  image?: string;
  palmLines?: Record<string, any>;
  palmFeatures?: Record<string, any>;
  // 夢占い用のパラメータ
  content?: string;
  symbols?: Record<string, any>;
  symbolDetails?: SymbolDetail[];
}

// プロンプトの結果
export interface PromptResult {
  system: string;
  user: string;
}

// エラーコードの定義
export const ERROR_CODES = {
  // 共通エラー
  NETWORK_ERROR: 'NETWORK_ERROR',
  AI_ERROR: 'AI_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  // 数秘術のエラー
  INVALID_BIRTHDATE: 'INVALID_BIRTHDATE',
  INVALID_NAME: 'INVALID_NAME',
  // タロットのエラー
  INVALID_CARD: 'INVALID_CARD',
  INVALID_SPREAD: 'INVALID_SPREAD',
  // 手相のエラー
  INVALID_IMAGE: 'INVALID_IMAGE',
  IMAGE_PROCESSING_ERROR: 'IMAGE_PROCESSING_ERROR',
  // 夢占いのエラー
  INVALID_CONTENT: 'INVALID_CONTENT',
  CONTENT_TOO_LONG: 'CONTENT_TOO_LONG'
} as const;

// エラーコードの型
export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'AI_ERROR'
  | 'UNKNOWN_ERROR'
  | 'INVALID_BIRTHDATE'
  | 'INVALID_NAME'
  | 'INVALID_CARD'
  | 'INVALID_SPREAD'
  | 'INVALID_IMAGE'
  | 'IMAGE_PROCESSING_ERROR'
  | 'INVALID_CONTENT'
  | 'CONTENT_TOO_LONG'
  | 'CONFIGURATION_ERROR'
  | 'VALIDATION_ERROR'
  | 'API_ERROR'
  | 'RESPONSE_FORMAT_ERROR'
  | 'UNEXPECTED_ERROR';

// 基本のエラークラス
export class FortuneError extends Error {
  constructor(
    message: string,
    public code: ErrorCode
  ) {
    super(message);
    this.name = 'FortuneError';
  }
}

// 数秘術のエラークラス
export class NumerologyError extends FortuneError {
  constructor(message: string, code: ErrorCode) {
    super(message, code);
    this.name = 'NumerologyError';
  }
}

// タロットのエラークラス
export class TarotError extends FortuneError {
  constructor(message: string, code: ErrorCode) {
    super(message, code);
    this.name = 'TarotError';
  }
}

// 手相のエラークラス
export class PalmError extends FortuneError {
  constructor(message: string, code: ErrorCode) {
    super(message, code);
    this.name = 'PalmError';
  }
}

// 夢占いのエラークラス
export class DreamError extends FortuneError {
  constructor(message: string, code: ErrorCode) {
    super(message, code);
    this.name = 'DreamError';
  }
}

// タロットの結果インターフェース
export interface TarotReading extends FortuneReading {
  type: 'tarot';
  cards: {
    name: string;
    position: string;
    meaning: {
      upright: string;
      reversed: string;
    };
  }[];
  spread: string;
  question?: string;
}

// 手相占いの結果型
export interface PalmReading extends FortuneReading {
  type: 'palm';
  imageUrl: string;
}

// 夢占いの結果インターフェース
export interface DreamReading extends FortuneReading {
  type: 'dream';
  content: string;
  symbols: string[];
  symbolDetails: Record<string, SymbolDetail[]>;
  interpretation: string;
  mainSymbols: string[];  // 主要なシンボル（重要度順）
  relationships: SymbolRelationship[];  // シンボル間の関連性
  options?: InterpretationOptions;  // 解釈オプション
}

// 占い履歴の管理用インターフェース
export interface FortuneHistory {
  userId: string;
  readings: {
    id: string;
    timestamp: string;
    type: FortuneType;
    result: FortuneReading;
    analysis: {
      trends: string[];
      patterns: string[];
      recommendations: string[];
    };
  }[];
}

// ユーザー設定インターフェース
export interface UserPreferences {
  favoriteTypes: FortuneType[];
  interestedAspects: string[];
  culturalContext: 'japanese' | 'western' | 'chinese';
  notificationSettings: {
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
    fortuneTypes: FortuneType[];
    timePreference?: {
      startHour: number;  // 0-23
      endHour: number;    // 0-23
      timezone: string;
    };
    channels: {
      email: boolean;
      browser: boolean;
      mobile: boolean;
    };
  };
  displaySettings: {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    language: 'ja' | 'en';
    showImages: boolean;
    compactView: boolean;
  };
  privacySettings: {
    shareHistory: boolean;
    allowAnalytics: boolean;
    storeDuration: 30 | 90 | 180 | 365;  // 日数
  };
  fortuneSettings: {
    defaultTypes: FortuneType[];
    favoriteSymbols: string[];
    excludedSymbols: string[];
    customKeywords: string[];
    readingPreferences: {
      [key in FortuneType]?: {
        depth: 'basic' | 'advanced' | 'expert';
        focus: ('psychological' | 'spiritual' | 'practical')[];
        autoSave: boolean;
      };
    };
  };
}

// 複合シンボル分析結果
export interface SymbolRelationship {
  symbols: string[];
  relationship: 'complementary' | 'conflicting' | 'reinforcing';
  interpretation: string;
  significance: number;
}

// AIの解釈オプション
export interface InterpretationOptions {
  depth: 'basic' | 'advanced' | 'expert';
  focus: ('psychological' | 'spiritual' | 'practical')[];
  timespan: 'immediate' | 'short-term' | 'long-term';
}

export enum UserRole {
  ADMIN = 'admin',
  TEST_USER = 'test_user',
  USER = 'user',
  GUEST = 'guest'
}

export interface User {
  id: string;
  email: string;
  name: string;
  displayName: string;
  role: UserRole;
  isSubscribed: boolean;
  createdAt: string;
  updatedAt: string;
  preferences: {
    favoriteTypes: FortuneType[];
    interestedAspects: string[];
    culturalContext: 'japanese' | 'western' | 'chinese';
    notificationSettings: {
      daily: boolean;
      weekly: boolean;
      monthly: boolean;
      fortuneTypes: FortuneType[];
      timePreference?: {
        startHour: number;
        endHour: number;
        timezone: string;
      };
      channels: {
        email: boolean;
        browser: boolean;
        mobile: boolean;
      };
    };
    displaySettings: {
      theme: 'light' | 'dark' | 'auto';
      fontSize: 'small' | 'medium' | 'large';
      language: 'ja' | 'en';
      showImages: boolean;
      compactView: boolean;
    };
    privacySettings: {
      shareHistory: boolean;
      allowAnalytics: boolean;
      storeDuration: 30 | 90 | 180 | 365;
    };
    fortuneSettings: {
      defaultTypes: FortuneType[];
      favoriteSymbols: string[];
      excludedSymbols: string[];
      customKeywords: string[];
      readingPreferences: {
        [key in FortuneType]: {
          depth: 'basic' | 'advanced' | 'expert';
          focus: ('psychological' | 'spiritual' | 'practical')[];
          autoSave: boolean;
        };
      };
    };
  };
  profile: {
    avatar: string;
    bio: string;
    birthDate: string;
    zodiacSign: string;
  };
  settings: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: 'ja' | 'en';
  };
  subscription: {
    type: 'free' | 'premium' | 'pro';
    expiresAt: string;
    features: string[];
  };
  fortuneHistory: {
    type: FortuneType;
    result: string;
    timestamp: string;
  }[];
} 