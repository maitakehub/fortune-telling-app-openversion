import { Request, Response } from 'express';
import { ChatHistory } from '../models/ChatHistory';
import { FortuneHistory } from '../models/FortuneHistory';
import { UserPreferences } from '../models/UserPreferences';
import { generateGeminiResponse } from '../utils/ai/gemini';
import { ErrorType, AppError, ValidationError } from '../types/errors';
import { ErrorMessages } from '../constants/errorMessages';
import { Message, MessageRole } from '../types/chat';
import { generateResponse } from '../utils/ai/gemini';
import { createLogger } from '../utils/logger';

const logger = createLogger('ChatController');

export class ChatController {
  // チャットセッションの開始
  static async startSession(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      
      const session = new ChatHistory({
        userId,
        messages: [{
          role: 'system',
          content: '占い師AIアシスタントとして、ユーザーの相談に乗り、的確なアドバイスを提供します。',
          timestamp: new Date()
        }],
        metadata: {
          startTime: new Date()
        }
      });

      await session.save();
      
      res.status(201).json({
        success: true,
        userId: session.userId
      });
    } catch (error) {
      console.error('Error starting chat session:', error);
      res.status(500).json({
        success: false,
        message: 'チャットセッションの開始に失敗しました'
      });
    }
  }

  // チャット履歴の取得
  async getChatHistory(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const chatHistory = await ChatHistory.findOne({ userId });

      if (!chatHistory) {
        return res.json({ messages: [] });
      }

      res.json({
        messages: chatHistory.messages.map(m => ({
          role: m.role as MessageRole,
          content: m.content
        }))
      });
    } catch (error) {
      logger.error('チャット履歴の取得に失敗しました', { error });
      throw new AppError({
        statusCode: 500,
        message: ErrorMessages.SERVER_ERROR,
        type: ErrorType.SERVER_ERROR
      });
    }
  }

  // メッセージの送信
  async sendMessage(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { message } = req.body;

      if (!message || typeof message !== 'string') {
        throw new ValidationError({
          message: ErrorMessages.INVALID_MESSAGE_FORMAT,
          type: ErrorType.VALIDATION_ERROR
        });
      }

      let chatHistory = await ChatHistory.findOne({ userId });
      
      if (!chatHistory) {
        chatHistory = new ChatHistory({
          userId,
          messages: []
        });
      }

      // ユーザーメッセージを追加
      const userMessage: Message = {
        role: MessageRole.USER,
        content: message,
        timestamp: new Date()
      };
      chatHistory.messages.push(userMessage);
      await chatHistory.save();

      // AIレスポンスを生成
      try {
        const aiResponse = await generateGeminiResponse(message, chatHistory.messages);
        const assistantMessage: Message = {
          role: MessageRole.ASSISTANT,
          content: aiResponse,
          timestamp: new Date()
        };
        
        chatHistory.messages.push(assistantMessage);
        await chatHistory.save();

        return res.json({
          success: true,
          message: assistantMessage
        });
      } catch (aiError) {
        logger.error('AI response generation failed:', aiError);
        throw new AppError({
          statusCode: 500,
          message: ErrorMessages.AI_RESPONSE_FAILED,
          type: ErrorType.AI_ERROR
        });
      }
    } catch (error) {
      logger.error('Message processing failed:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError({
        statusCode: 500,
        message: ErrorMessages.MESSAGE_PROCESSING_FAILED,
        type: ErrorType.SERVER_ERROR
      });
    }
  }

  // セッションの終了
  static async endSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      
      const session = await ChatHistory.findOne({ sessionId });
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'セッションが見つかりません'
        });
      }

      session.metadata.endTime = new Date();
      await session.save();

      res.status(200).json({
        success: true,
        message: 'セッションを終了しました'
      });
    } catch (error) {
      console.error('Error ending chat session:', error);
      res.status(500).json({
        success: false,
        message: 'セッションの終了に失敗しました'
      });
    }
  }

  // フィードバックの送信
  static async sendFeedback(req: Request, res: Response) {
    try {
      const { sessionId, feedback } = req.body;
      
      const session = await ChatHistory.findOne({ sessionId });
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'セッションが見つかりません'
        });
      }

      session.metadata.userFeedback = feedback;
      await session.save();

      res.status(200).json({
        success: true,
        message: 'フィードバックを保存しました'
      });
    } catch (error) {
      console.error('Error sending feedback:', error);
      res.status(500).json({
        success: false,
        message: 'フィードバックの送信に失敗しました'
      });
    }
  }

  // セッション履歴の取得
  static async getSessionHistory(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { limit = 10, offset = 0 } = req.query;
      
      const sessions = await ChatHistory.find({ userId })
        .sort({ createdAt: -1 })
        .skip(Number(offset))
        .limit(Number(limit));

      const total = await ChatHistory.countDocuments({ userId });

      res.status(200).json({
        success: true,
        sessions,
        total
      });
    } catch (error) {
      console.error('Error getting session history:', error);
      res.status(500).json({
        success: false,
        message: 'セッション履歴の取得に失敗しました'
      });
    }
  }

  // チャット履歴のクリア
  async clearHistory(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      await ChatHistory.findOneAndUpdate(
        { userId },
        { $set: { messages: [] } },
        { upsert: true }
      );

      res.json({ message: 'チャット履歴をクリアしました' });
    } catch (error) {
      logger.error('チャット履歴のクリアに失敗しました', { error });
      throw new AppError({
        statusCode: 500,
        message: ErrorMessages.SERVER_ERROR,
        type: ErrorType.SERVER_ERROR
      });
    }
  }
} 