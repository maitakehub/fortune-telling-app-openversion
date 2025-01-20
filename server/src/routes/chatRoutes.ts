import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { ChatController } from '../controllers/ChatController';

const router = express.Router();
const chatController = new ChatController();

// チャットセッションの開始
router.post('/sessions', authenticateToken, ChatController.startSession);

// チャット履歴の取得
router.get('/history', authenticateToken, chatController.getChatHistory.bind(chatController));

// メッセージの送信
router.post('/message', authenticateToken, chatController.sendMessage.bind(chatController));

// チャット履歴のクリア
router.post('/clear', authenticateToken, chatController.clearHistory.bind(chatController));

// セッションの終了
router.post('/sessions/:sessionId/end', authenticateToken, ChatController.endSession);

// フィードバックの送信
router.post('/sessions/:sessionId/feedback', authenticateToken, ChatController.sendFeedback);

// セッション履歴の取得
router.get('/sessions', authenticateToken, ChatController.getSessionHistory);

export default router; 