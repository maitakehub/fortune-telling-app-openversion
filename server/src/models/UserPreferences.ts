import mongoose, { Document, Model } from 'mongoose';

interface IUserPreferences extends Document {
  userId: string;
  fortunePreferences: {
    favoriteTypes: string[];
    interestedAspects: string[];
    readingFrequency: string;
    notificationPreferences: {
      email: boolean;
      push: boolean;
      frequency: string;
    };
  };
  aiChatPreferences: {
    language: string;
    responseStyle: string;
    detailLevel: string;
    topicsOfInterest: string[];
    personalityTrait: string;
  };
  displayPreferences: {
    theme: string;
    fontSize: string;
    colorScheme: string;
    layout: string;
  };
  privacySettings: {
    shareHistory: boolean;
    shareAnalytics: boolean;
    allowRecommendations: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userPreferencesSchema = new mongoose.Schema<IUserPreferences>({
  userId: {
    type: String,
    required: true,
    unique: true,
    ref: 'User'
  },
  fortunePreferences: {
    favoriteTypes: {
      type: [String],
      enum: ['horoscope', 'tarot', 'palm', 'numerology', 'dream', 'compatibility', 'general'],
      default: []
    },
    interestedAspects: {
      type: [String],
      enum: ['love', 'career', 'health', 'money', 'general'],
      default: []
    },
    readingFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'occasional'],
      default: 'occasional'
    },
    notificationPreferences: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: false
      },
      frequency: {
        type: String,
        enum: ['realtime', 'daily', 'weekly', 'never'],
        default: 'daily'
      }
    }
  },
  aiChatPreferences: {
    language: {
      type: String,
      enum: ['ja', 'en'],
      default: 'ja'
    },
    responseStyle: {
      type: String,
      enum: ['formal', 'casual', 'friendly', 'professional'],
      default: 'friendly'
    },
    detailLevel: {
      type: String,
      enum: ['brief', 'detailed', 'comprehensive'],
      default: 'detailed'
    },
    topicsOfInterest: {
      type: [String],
      default: []
    },
    personalityTrait: {
      type: String,
      enum: ['encouraging', 'analytical', 'empathetic', 'direct'],
      default: 'encouraging'
    }
  },
  displayPreferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    },
    colorScheme: {
      type: String,
      enum: ['default', 'high-contrast', 'soft'],
      default: 'default'
    },
    layout: {
      type: String,
      enum: ['compact', 'comfortable', 'spacious'],
      default: 'comfortable'
    }
  },
  privacySettings: {
    shareHistory: {
      type: Boolean,
      default: false
    },
    shareAnalytics: {
      type: Boolean,
      default: true
    },
    allowRecommendations: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// インデックスの設定
userPreferencesSchema.index({ userId: 1 }, { unique: true });

export const UserPreferences: Model<IUserPreferences> = mongoose.model<IUserPreferences>('UserPreferences', userPreferencesSchema); 