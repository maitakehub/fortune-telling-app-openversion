import { Request, Response } from 'express';
import { UserPreferences } from '../models/UserPreferences';

export class UserPreferencesController {
  // ユーザー設定の取得
  static async getPreferences(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      const preferences = await UserPreferences.findOne({ userId });
      if (!preferences) {
        return res.status(404).json({
          success: false,
          message: 'ユーザー設定が見つかりません'
        });
      }

      res.status(200).json({
        success: true,
        preferences
      });
    } catch (error) {
      console.error('Error getting user preferences:', error);
      res.status(500).json({
        success: false,
        message: 'ユーザー設定の取得に失敗しました'
      });
    }
  }

  // ユーザー設定の作成または更新
  static async updatePreferences(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const updates = req.body;

      const preferences = await UserPreferences.findOneAndUpdate(
        { userId },
        { $set: updates },
        { new: true, upsert: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        preferences
      });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      res.status(500).json({
        success: false,
        message: 'ユーザー設定の更新に失敗しました'
      });
    }
  }

  // 占い設定の更新
  static async updateFortunePreferences(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const fortunePreferences = req.body;

      const preferences = await UserPreferences.findOneAndUpdate(
        { userId },
        { $set: { fortunePreferences } },
        { new: true, upsert: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        preferences
      });
    } catch (error) {
      console.error('Error updating fortune preferences:', error);
      res.status(500).json({
        success: false,
        message: '占い設定の更新に失敗しました'
      });
    }
  }

  // AIチャット設定の更新
  static async updateAIChatPreferences(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const aiChatPreferences = req.body;

      const preferences = await UserPreferences.findOneAndUpdate(
        { userId },
        { $set: { aiChatPreferences } },
        { new: true, upsert: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        preferences
      });
    } catch (error) {
      console.error('Error updating AI chat preferences:', error);
      res.status(500).json({
        success: false,
        message: 'AIチャット設定の更新に失敗しました'
      });
    }
  }

  // 表示設定の更新
  static async updateDisplayPreferences(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const displayPreferences = req.body;

      const preferences = await UserPreferences.findOneAndUpdate(
        { userId },
        { $set: { displayPreferences } },
        { new: true, upsert: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        preferences
      });
    } catch (error) {
      console.error('Error updating display preferences:', error);
      res.status(500).json({
        success: false,
        message: '表示設定の更新に失敗しました'
      });
    }
  }

  // プライバシー設定の更新
  static async updatePrivacySettings(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const privacySettings = req.body;

      const preferences = await UserPreferences.findOneAndUpdate(
        { userId },
        { $set: { privacySettings } },
        { new: true, upsert: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        preferences
      });
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      res.status(500).json({
        success: false,
        message: 'プライバシー設定の更新に失敗しました'
      });
    }
  }
} 