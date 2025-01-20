import { Request, Response } from 'express';
import { FortuneHistory } from '../models/FortuneHistory';

export class FortuneHistoryController {
  // 占い履歴の作成
  static async createHistory(req: Request, res: Response) {
    try {
      const historyData = req.body;
      
      const history = new FortuneHistory(historyData);
      await history.save();

      res.status(201).json({
        success: true,
        history
      });
    } catch (error) {
      console.error('Error creating fortune history:', error);
      res.status(500).json({
        success: false,
        message: '占い履歴の作成に失敗しました'
      });
    }
  }

  // ユーザーの占い履歴を取得
  static async getUserHistory(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { 
        limit = 10, 
        offset = 0,
        type,
        startDate,
        endDate
      } = req.query;

      const query: any = { userId };
      
      if (type) {
        query.type = type;
      }
      
      if (startDate || endDate) {
        query.date = {};
        if (startDate) {
          query.date.$gte = new Date(startDate as string);
        }
        if (endDate) {
          query.date.$lte = new Date(endDate as string);
        }
      }

      const histories = await FortuneHistory.find(query)
        .sort({ date: -1 })
        .skip(Number(offset))
        .limit(Number(limit));

      const total = await FortuneHistory.countDocuments(query);

      res.status(200).json({
        success: true,
        histories,
        total
      });
    } catch (error) {
      console.error('Error getting user fortune history:', error);
      res.status(500).json({
        success: false,
        message: '占い履歴の取得に失敗しました'
      });
    }
  }

  // 特定の占い履歴を取得
  static async getHistory(req: Request, res: Response) {
    try {
      const { historyId } = req.params;
      
      const history = await FortuneHistory.findById(historyId);
      if (!history) {
        return res.status(404).json({
          success: false,
          message: '占い履歴が見つかりません'
        });
      }

      res.status(200).json({
        success: true,
        history
      });
    } catch (error) {
      console.error('Error getting fortune history:', error);
      res.status(500).json({
        success: false,
        message: '占い履歴の取得に失敗しました'
      });
    }
  }

  // フィードバックの更新
  static async updateFeedback(req: Request, res: Response) {
    try {
      const { historyId } = req.params;
      const { feedback } = req.body;

      const history = await FortuneHistory.findByIdAndUpdate(
        historyId,
        { $set: { userFeedback: feedback } },
        { new: true, runValidators: true }
      );

      if (!history) {
        return res.status(404).json({
          success: false,
          message: '占い履歴が見つかりません'
        });
      }

      res.status(200).json({
        success: true,
        history
      });
    } catch (error) {
      console.error('Error updating fortune feedback:', error);
      res.status(500).json({
        success: false,
        message: 'フィードバックの更新に失敗しました'
      });
    }
  }

  // AI分析の更新
  static async updateAnalysis(req: Request, res: Response) {
    try {
      const { historyId } = req.params;
      const { analysis } = req.body;

      const history = await FortuneHistory.findByIdAndUpdate(
        historyId,
        { $set: { aiAnalysis: analysis } },
        { new: true, runValidators: true }
      );

      if (!history) {
        return res.status(404).json({
          success: false,
          message: '占い履歴が見つかりません'
        });
      }

      res.status(200).json({
        success: true,
        history
      });
    } catch (error) {
      console.error('Error updating fortune analysis:', error);
      res.status(500).json({
        success: false,
        message: 'AI分析の更新に失敗しました'
      });
    }
  }

  // 統計情報の取得
  static async getStatistics(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;

      const query: any = { userId };
      
      if (startDate || endDate) {
        query.date = {};
        if (startDate) {
          query.date.$gte = new Date(startDate as string);
        }
        if (endDate) {
          query.date.$lte = new Date(endDate as string);
        }
      }

      const [
        totalCount,
        typeDistribution,
        averageRating,
        accuracyStats
      ] = await Promise.all([
        FortuneHistory.countDocuments(query),
        FortuneHistory.aggregate([
          { $match: query },
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ]),
        FortuneHistory.aggregate([
          { $match: query },
          { $group: { _id: null, avg: { $avg: '$userFeedback.rating' } } }
        ]),
        FortuneHistory.aggregate([
          { $match: query },
          { $group: { _id: null, avg: { $avg: '$userFeedback.accuracy' } } }
        ])
      ]);

      res.status(200).json({
        success: true,
        statistics: {
          totalCount,
          typeDistribution: typeDistribution.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
          }, {} as Record<string, number>),
          averageRating: averageRating[0]?.avg || 0,
          averageAccuracy: accuracyStats[0]?.avg || 0
        }
      });
    } catch (error) {
      console.error('Error getting fortune statistics:', error);
      res.status(500).json({
        success: false,
        message: '統計情報の取得に失敗しました'
      });
    }
  }
} 