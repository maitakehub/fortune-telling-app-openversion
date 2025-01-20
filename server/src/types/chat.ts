export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export interface Message {
  role: MessageRole;
  content: string;
  timestamp: Date;
  context?: {
    fortuneType?: string;
    fortuneId?: string;
    mood?: string;
    intent?: string;
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: Message[];
  metadata: {
    startTime: Date;
    endTime?: Date;
    userFeedback?: string;
  };
} 