import { FortuneType } from '../types';

export const FORTUNE_CONSTANTS = {
  TYPES: {
    NUMEROLOGY: 'numerology' as FortuneType,
    TAROT: 'tarot' as FortuneType,
    PALM: 'palm' as FortuneType,
    DREAM: 'dream' as FortuneType,
    COMPATIBILITY: 'compatibility' as FortuneType,
    FORTUNE: 'fortune' as FortuneType,
  },
  TYPE_NAMES: {
    ja: {
      numerology: '数秘術',
      tarot: 'タロット',
      palm: '手相',
      dream: '夢占い',
      compatibility: '相性占い',
      fortune: '運勢占い'
    },
    en: {
      numerology: 'Numerology',
      tarot: 'Tarot',
      palm: 'Palm Reading',
      dream: 'Dream Interpretation',
      compatibility: 'Compatibility',
      fortune: 'Fortune Telling'
    }
  },
  ASPECTS: {
    GENERAL: 'general',
    LOVE: 'love',
    WORK: 'work',
    HEALTH: 'health',
    MONEY: 'money'
  },
  ASPECT_NAMES: {
    ja: {
      general: '総合運',
      love: '恋愛運',
      work: '仕事運',
      health: '健康運',
      money: '金運'
    },
    en: {
      general: 'General',
      love: 'Love',
      work: 'Work',
      health: 'Health',
      money: 'Money'
    }
  },
  PERIODS: {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    YEARLY: 'yearly'
  } as const,
  PERIOD_NAMES: {
    ja: {
      daily: '日運',
      weekly: '週運',
      monthly: '月運',
      yearly: '年運'
    },
    en: {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly'
    }
  },
  COMPATIBILITY_TYPES: {
    LOVE: 'love',
    WORK: 'work',
    FRIENDSHIP: 'friendship'
  } as const,
  COMPATIBILITY_TYPE_NAMES: {
    ja: {
      love: '恋愛相性',
      work: '仕事相性',
      friendship: '友情相性'
    },
    en: {
      love: 'Love Compatibility',
      work: 'Work Compatibility',
      friendship: 'Friendship Compatibility'
    }
  }
} as const; 