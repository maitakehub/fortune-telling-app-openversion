import mongoose, { Document, Schema } from 'mongoose';
import { Message, MessageRole } from '../types/chat';

interface ChatHistoryDocument extends Document {
  userId: string;
  messages: Message[];
  metadata: {
    startTime?: Date;
    endTime?: Date;
    userFeedback?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema({
  role: {
    type: String,
    enum: ['system', 'user', 'assistant'] as MessageRole[],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  context: {
    fortuneType: String,
    fortuneId: String,
    mood: String,
    intent: String
  }
});

const chatHistorySchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  messages: [messageSchema],
  metadata: {
    startTime: Date,
    endTime: Date,
    userFeedback: String
  }
}, {
  timestamps: true
});

export const ChatHistory = mongoose.model<ChatHistoryDocument>('ChatHistory', chatHistorySchema); 