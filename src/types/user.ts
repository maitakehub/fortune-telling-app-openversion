export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export type ReadingDepth = 'basic' | 'advanced' | 'expert';
export type ReadingFocus = 'psychological' | 'spiritual' | 'practical';

export interface ReadingPreference {
  depth: ReadingDepth;
  focus: ReadingFocus[];
  autoSave: boolean;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  isSubscribed?: boolean;
  personalInfo?: {
    birthDate: string;
    birthTime?: string;
    birthPlace?: string;
    gender?: string;
  };
  name?: string;
  displayName?: string;
  subscriptionPlan?: 'basic' | 'premium' | 'test';
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  preferences?: {
    favoriteTypes: string[];
    interestedAspects: string[];
    culturalContext: 'japanese' | 'western' | 'chinese';
    notificationSettings: {
      daily: boolean;
      weekly: boolean;
      monthly: boolean;
      fortuneTypes: string[];
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
      storeDuration: number;
    };
    fortuneSettings: {
      defaultTypes: string[];
      favoriteSymbols: string[];
      excludedSymbols: string[];
      customKeywords: string[];
      readingPreferences: {
        numerology: ReadingPreference;
        tarot: ReadingPreference;
        palm: ReadingPreference;
        dream: ReadingPreference;
        compatibility: ReadingPreference;
        fortune: ReadingPreference;
        general: ReadingPreference;
      };
    };
  };
  lastLoginDate?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  sessionWarning: boolean;
} 