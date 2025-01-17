import { FortuneType } from '../types';

// ユーザー設定の型定義
export interface UserPreferences {
  general: {
    interpretationStyle: 'detailed' | 'concise' | 'poetic';
    culturalContext: 'japanese' | 'western' | 'chinese';
  };
  notifications: {
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
    startHour: number;
    endHour: number;
    channels: {
      email: boolean;
      browser: boolean;
      mobile: boolean;
    };
  };
  display: {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    showImages: boolean;
    compactView: boolean;
  };
  privacy: {
    shareHistory: boolean;
    allowAnalytics: boolean;
    storageDuration: '1month' | '3months' | '6months' | '1year' | 'forever';
  };
  fortune: {
    defaultType: FortuneType;
    customKeywords: string[];
  };
}

export class PreferencesManager {
  private readonly STORAGE_KEY = 'fortune_app_preferences';
  private preferences: Map<string, UserPreferences> = new Map();

  constructor() {
    this.loadPreferences();
  }

  // デフォルト設定を生成
  public createDefaultPreferences(): UserPreferences {
    return {
      general: {
        interpretationStyle: 'detailed',
        culturalContext: 'japanese'
      },
      notifications: {
        daily: true,
        weekly: true,
        monthly: true,
        startHour: 9,
        endHour: 21,
        channels: {
          email: false,
          browser: true,
          mobile: false
        }
      },
      display: {
        theme: 'auto',
        fontSize: 'medium',
        showImages: true,
        compactView: false
      },
      privacy: {
        shareHistory: false,
        allowAnalytics: true,
        storageDuration: '6months'
      },
      fortune: {
        defaultType: 'tarot',
        customKeywords: []
      }
    };
  }

  // 設定を保存
  private savePreferences(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(Array.from(this.preferences.entries())));
    } catch (error) {
      console.error('Failed to save preferences:', error);
      throw new Error('設定の保存に失敗しました');
    }
  }

  // 設定を読み込み
  private loadPreferences(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.preferences = new Map(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
      throw new Error('設定の読み込みに失敗しました');
    }
  }

  // ユーザーの設定を取得
  public getUserPreferences(userId: string): UserPreferences {
    if (!this.preferences.has(userId)) {
      this.preferences.set(userId, this.createDefaultPreferences());
      this.savePreferences();
    }
    return this.preferences.get(userId)!;
  }

  // 設定を更新
  public async updatePreferences(userId: string, updates: Partial<UserPreferences>): Promise<void> {
    try {
      const current = this.getUserPreferences(userId);
      const updated = {
        ...current,
        ...updates,
        general: { ...current.general, ...updates.general },
        notifications: { ...current.notifications, ...updates.notifications },
        display: { ...current.display, ...updates.display },
        privacy: { ...current.privacy, ...updates.privacy },
        fortune: { ...current.fortune, ...updates.fortune }
      };
      this.preferences.set(userId, updated);
      this.savePreferences();
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw new Error('設定の更新に失敗しました');
    }
  }

  // 通知設定に基づいて通知を送るべきかを判断
  public shouldNotify(userId: string, type: 'daily' | 'weekly' | 'monthly'): boolean {
    const prefs = this.getUserPreferences(userId);
    if (!prefs.notifications[type]) return false;

    const now = new Date();
    const hour = now.getHours();
    return hour >= prefs.notifications.startHour && hour <= prefs.notifications.endHour;
  }

  // 解釈オプションを生成
  public getInterpretationOptions(userId: string): {
    style: UserPreferences['general']['interpretationStyle'];
    context: UserPreferences['general']['culturalContext'];
  } {
    const prefs = this.getUserPreferences(userId);
    return {
      style: prefs.general.interpretationStyle,
      context: prefs.general.culturalContext
    };
  }
} 