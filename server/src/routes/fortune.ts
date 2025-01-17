import express from 'express';
import { FortuneHistory } from '../models/FortuneHistory';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 占い結果の保存
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const { type, question, result } = req.body;
    const userId = req.user.id;

    const fortuneHistory = new FortuneHistory({
      userId,
      type,
      question,
      result
    });

    await fortuneHistory.save();
    res.status(201).json({ message: '占い結果を保存しました' });
  } catch (error) {
    console.error('Error saving fortune result:', error);
    res.status(500).json({ error: '占い結果の保存に失敗しました' });
  }
});

// 履歴の取得
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await FortuneHistory.find({ userId })
      .sort({ date: -1 })
      .limit(50);
    res.json(history);
  } catch (error) {
    console.error('Error fetching fortune history:', error);
    res.status(500).json({ error: '履歴の取得に失敗しました' });
  }
});

export default router; 