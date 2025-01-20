import { Router } from 'express';
import { UserPreferencesController } from '../controllers/UserPreferencesController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 設定の取得
router.get('/', authenticateToken, UserPreferencesController.getPreferences);

// 設定の更新
router.put('/', authenticateToken, UserPreferencesController.updatePreferences);

// 占い設定の更新
router.put('/fortune', authenticateToken, UserPreferencesController.updateFortunePreferences);

// AIチャット設定の更新
router.put('/ai-chat', authenticateToken, UserPreferencesController.updateAIChatPreferences);

// 表示設定の更新
router.put('/display', authenticateToken, UserPreferencesController.updateDisplayPreferences);

// プライバシー設定の更新
router.put('/privacy', authenticateToken, UserPreferencesController.updatePrivacySettings);

export default router; 