import { Router } from 'express';
import { FortuneHistoryController } from '../controllers/FortuneHistoryController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 占い履歴の作成
router.post('/', authenticateToken, FortuneHistoryController.createHistory);

// ユーザーの占い履歴を取得
router.get('/user/:userId', authenticateToken, FortuneHistoryController.getUserHistory);

// 特定の占い履歴を取得
router.get('/:historyId', authenticateToken, FortuneHistoryController.getHistory);

// フィードバックの更新
router.put('/:historyId/feedback', authenticateToken, FortuneHistoryController.updateFeedback);

// AI分析の更新
router.put('/:historyId/analysis', authenticateToken, FortuneHistoryController.updateAnalysis);

// 統計情報の取得
router.get('/user/:userId/statistics', authenticateToken, FortuneHistoryController.getStatistics);

export default router; 