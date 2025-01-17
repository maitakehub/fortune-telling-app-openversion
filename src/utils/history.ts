import { FortuneHistory, FortuneReading, FortuneType } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * 占い結果の履歴を分析するクラス
 */
export class FortuneHistoryManager {
  private histories: Map<string, FortuneHistory> = new Map();

  /**
   * 新しい占い結果を追加
   */
  async addReading(userId: string, reading: FortuneReading): Promise<void> {
    let history = this.histories.get(userId);
    if (!history) {
      history = {
        userId,
        readings: []
      };
      this.histories.set(userId, history);
    }

    // 傾向分析
    const trends = await this.analyzeTrends(userId, reading.type);
    
    // パターン検出
    const patterns = this.detectPatterns(history.readings, reading);
    
    // レコメンデーション生成
    const recommendations = this.generateRecommendations(patterns, reading.type);

    // 新しい履歴エントリーを追加
    history.readings.push({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type: reading.type,
      result: reading,
      analysis: {
        trends,
        patterns,
        recommendations
      }
    });
  }

  /**
   * 特定のユーザーの履歴を取得
   */
  getHistory(userId: string): FortuneHistory | undefined {
    return this.histories.get(userId);
  }

  /**
   * 特定の種類の占いの履歴を取得
   */
  getReadingsByType(userId: string, type: FortuneType): FortuneReading[] {
    const history = this.histories.get(userId);
    if (!history) return [];
    
    return history.readings
      .filter(entry => entry.type === type)
      .map(entry => entry.result);
  }

  /**
   * 傾向を分析
   */
  private async analyzeTrends(userId: string, type: FortuneType): Promise<string[]> {
    const history = this.histories.get(userId);
    if (!history) return [];

    const recentReadings = history.readings
      .filter(entry => entry.type === type)
      .slice(-5); // 最新5件を分析

    const trends: string[] = [];

    // 運勢の変化傾向を分析
    if (recentReadings.length >= 2) {
      const positiveWords = ['良い', '上昇', '好調', '幸運', '成功'];
      const negativeWords = ['悪い', '下降', '不調', '不運', '失敗'];

      let positiveCount = 0;
      let negativeCount = 0;

      recentReadings.forEach(entry => {
        const content = entry.result.reading.toLowerCase();
        positiveCount += positiveWords.filter(word => content.includes(word)).length;
        negativeCount += negativeWords.filter(word => content.includes(word)).length;
      });

      if (positiveCount > negativeCount * 1.5) {
        trends.push('全体的に上昇傾向にあります');
      } else if (negativeCount > positiveCount * 1.5) {
        trends.push('一時的な調整期間かもしれません');
      } else {
        trends.push('安定した状態を保っています');
      }
    }

    return trends;
  }

  /**
   * パターンを検出
   */
  private detectPatterns(
    history: FortuneHistory['readings'],
    currentReading: FortuneReading
  ): string[] {
    const patterns: string[] = [];
    const recentReadings = history.slice(-10); // 最新10件を分析

    // 周期性の検出
    const timestamps = recentReadings.map(r => new Date(r.timestamp).getTime());
    const intervals = timestamps.slice(1).map((t, i) => t - timestamps[i]);
    const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    
    if (Math.abs(averageInterval - (24 * 60 * 60 * 1000)) < (60 * 60 * 1000)) {
      patterns.push('日次のリズムが見られます');
    } else if (Math.abs(averageInterval - (7 * 24 * 60 * 60 * 1000)) < (24 * 60 * 60 * 1000)) {
      patterns.push('週次のリズムが見られます');
    }

    // キーワードの出現パターン
    const commonKeywords = this.extractCommonKeywords(recentReadings.map(r => r.result.reading));
    if (commonKeywords.length > 0) {
      patterns.push(`頻出キーワード: ${commonKeywords.join(', ')}`);
    }

    return patterns;
  }

  /**
   * 共通キーワードを抽出
   */
  private extractCommonKeywords(texts: string[]): string[] {
    const keywords = new Map<string, number>();
    const stopWords = ['です', 'ます', 'した', 'から', 'など', 'という'];

    texts.forEach(text => {
      const words = text.split(/[\s,。、！？!?]+/);
      words.forEach(word => {
        if (word.length > 1 && !stopWords.includes(word)) {
          keywords.set(word, (keywords.get(word) || 0) + 1);
        }
      });
    });

    return Array.from(keywords.entries())
      .filter(([_, count]) => count > texts.length * 0.3) // 30%以上の頻出度
      .map(([word]) => word);
  }

  /**
   * レコメンデーションを生成
   */
  private generateRecommendations(patterns: string[], type: FortuneType): string[] {
    const recommendations: string[] = [];

    // パターンに基づくレコメンデーション
    if (patterns.some(p => p.includes('日次のリズム'))) {
      recommendations.push('定期的な占いで運気の流れを把握することをお勧めします');
    }

    // 占いの種類に基づくレコメンデーション
    switch (type) {
      case 'dream':
        recommendations.push('夢日記をつけることで、より詳細な解釈が可能になります');
        break;
      case 'palmistry':
        recommendations.push('定期的な手相の変化を観察することで、運気の変化を捉えられます');
        break;
      case 'tarot':
        recommendations.push('質問を変えて複数回占うことで、異なる視点が得られます');
        break;
      case 'numerology':
        recommendations.push('誕生日に加えて、名前の数秘術も試してみましょう');
        break;
    }

    return recommendations;
  }
} 