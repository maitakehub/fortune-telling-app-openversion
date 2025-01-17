import express from 'express';
import { FortuneHistory } from '../models/FortuneHistory';
import { authenticateToken } from '../middleware/auth';
import { User } from '../models/User';

const router = express.Router();

// 占い結果の保存
router.post('/save', authenticateToken, async (req, res) => {
  try {
    console.log('Saving fortune result...');
    const { type, question, result } = req.body;
    const userId = req.user.id;

    const fortuneHistory = new FortuneHistory({
      userId,
      type,
      question,
      result
    });

    await fortuneHistory.save();
    console.log('Fortune result saved successfully');
    res.status(201).json({ message: '占い結果を保存しました' });
  } catch (error) {
    console.error('Error saving fortune result:', error);
    res.status(500).json({ error: '占い結果の保存に失敗しました' });
  }
});

// 履歴の取得
router.get('/history', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching fortune history...');
    const userId = req.user.id;
    const history = await FortuneHistory.find({ userId })
      .sort({ date: -1 })
      .limit(50);
    console.log(`Found ${history.length} history items`);
    res.json(history);
  } catch (error) {
    console.error('Error fetching fortune history:', error);
    res.status(500).json({ error: '履歴の取得に失敗しました' });
  }
});

// ユーザー個人情報の取得
router.get('/user/personal-info', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching user personal info...');
    const userId = req.user.id;
    console.log('User ID:', userId);
    const user = await User.findById(userId);
    console.log('Found user:', user);
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    // モックデータを返す（実際のアプリケーションでは、別のコレクションからユーザーの個人情報を取得する）
    const response = {
      name: user.name || 'ゲスト',
      birthDate: new Date().toISOString().split('T')[0],
      zodiac: 'libra'  // デフォルト値
    };
    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error fetching user personal info:', error);
    res.status(500).json({ error: 'ユーザー情報の取得に失敗しました' });
  }
});

export default router; 