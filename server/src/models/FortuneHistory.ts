import mongoose, { Document, Model } from 'mongoose';

interface IFortuneHistory extends Document {
  userId: string;
  type: string;
  question: string;
  result: string;
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
    enum: ['horoscope', 'tarot', 'palm', 'numerology', 'dream']
  },
  question: {
    type: String,
    required: true
  },
  result: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// 日付の降順でソート
fortuneHistorySchema.index({ date: -1 });

export const FortuneHistory: Model<IFortuneHistory> = mongoose.model<IFortuneHistory>('FortuneHistory', fortuneHistorySchema); 