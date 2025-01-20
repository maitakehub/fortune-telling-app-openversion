import mongoose, { Document, Model } from 'mongoose';

interface IFortuneHistory extends Document {
  userId: string;
  type: string;
  question: string;
  result: {
    mainReading: string;
    aspects: {
      love?: string;
      career?: string;
      health?: string;
      money?: string;
      general?: string;
    };
    score: number;
    keywords: string[];
    advice: string;
    nextReadingRecommendation?: string;
  };
  userFeedback?: {
    rating: number;
    comment?: string;
    accuracy?: number;
    helpfulness?: number;
  };
  metadata: {
    readingTime: Date;
    location?: string;
    mood?: string;
    significantEvents?: string[];
  };
  aiAnalysis?: {
    patterns: string[];
    insights: string[];
    recommendations: string[];
  };
  date: Date;
}

const fortuneHistorySchema = new mongoose.Schema<IFortuneHistory>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  type: {
    type: String,
    required: true,
    enum: ['horoscope', 'tarot', 'palm', 'numerology', 'dream', 'compatibility', 'general']
  },
  question: {
    type: String,
    required: true
  },
  result: {
    mainReading: {
      type: String,
      required: true
    },
    aspects: {
      love: String,
      career: String,
      health: String,
      money: String,
      general: String
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    keywords: [String],
    advice: {
      type: String,
      required: true
    },
    nextReadingRecommendation: String
  },
  userFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    accuracy: {
      type: Number,
      min: 0,
      max: 100
    },
    helpfulness: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  metadata: {
    readingTime: {
      type: Date,
      required: true,
      default: Date.now
    },
    location: String,
    mood: String,
    significantEvents: [String]
  },
  aiAnalysis: {
    patterns: [String],
    insights: [String],
    recommendations: [String]
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// インデックスの設定
fortuneHistorySchema.index({ date: -1 });
fortuneHistorySchema.index({ userId: 1, date: -1 });
fortuneHistorySchema.index({ type: 1, date: -1 });

export const FortuneHistory: Model<IFortuneHistory> = mongoose.model<IFortuneHistory>('FortuneHistory', fortuneHistorySchema); 