import { FortuneHistory, FortuneReading, FortuneType } from '../types';

interface AnalysisResult {
  trends: {
    period: string;
    trend: 'up' | 'down' | 'stable';
    confidence: number;
    keywords: string[];
  }[];
  patterns: {
    type: string;
    description: string;
    frequency: number;
    significance: number;
  }[];
  correlations: {
    factors: string[];
    strength: number;
    description: string;
  }[];
  predictions: {
    aspect: string;
    likelihood: number;
    timeframe: string;
    basis: string[];
  }[];
}

/**
 * 高度な分析機能を提供するクラス
 */
export class FortuneAnalytics {
  /**
   * 時系列分析を実行
   */
  analyzeTimeSeries(history: FortuneHistory): AnalysisResult {
    const readings = history.readings;
    const result: AnalysisResult = {
      trends: [],
      patterns: [],
      correlations: [],
      predictions: []
    };

    // 期間ごとの傾向分析
    const periods = ['daily', 'weekly', 'monthly'] as const;
    periods.forEach(period => {
      const trend = this.analyzePeriodTrend(readings, period);
      if (trend) {
        result.trends.push(trend);
      }
    });

    // パターン検出
    result.patterns = this.detectDetailedPatterns(readings);

    // 相関関係の分析
    result.correlations = this.analyzeCorrelations(readings);

    // 予測生成
    result.predictions = this.generatePredictions(readings);

    return result;
  }

  /**
   * 期間ごとの傾向を分析
   */
  private analyzePeriodTrend(
    readings: FortuneHistory['readings'],
    period: 'daily' | 'weekly' | 'monthly'
  ) {
    const recentReadings = this.filterReadingsByPeriod(readings, period);
    if (recentReadings.length < 2) return null;

    const sentimentScores = recentReadings.map(r => this.calculateSentimentScore(r.result.reading));
    const trend = this.calculateTrend(sentimentScores);
    const keywords = this.extractTrendKeywords(recentReadings);

    return {
      period,
      trend,
      confidence: this.calculateConfidence(sentimentScores),
      keywords
    };
  }

  /**
   * 期間でフィルタリング
   */
  private filterReadingsByPeriod(
    readings: FortuneHistory['readings'],
    period: 'daily' | 'weekly' | 'monthly'
  ) {
    const now = new Date();
    const threshold = new Date();

    switch (period) {
      case 'daily':
        threshold.setDate(now.getDate() - 7); // 1週間
        break;
      case 'weekly':
        threshold.setDate(now.getDate() - 30); // 1ヶ月
        break;
      case 'monthly':
        threshold.setDate(now.getDate() - 90); // 3ヶ月
        break;
    }

    return readings.filter(r => new Date(r.timestamp) >= threshold);
  }

  /**
   * センチメントスコアを計算
   */
  private calculateSentimentScore(text: string): number {
    const positiveWords = ['上昇', '好調', '幸運', '成功', '発展', '向上', '良い'];
    const negativeWords = ['下降', '不調', '不運', '失敗', '停滞', '悪化', '悪い'];

    const words = text.split(/[\s,。、！？!?]+/);
    let score = 0;

    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) score += 1;
      if (negativeWords.some(nw => word.includes(nw))) score -= 1;
    });

    return score;
  }

  /**
   * トレンドを計算
   */
  private calculateTrend(scores: number[]): 'up' | 'down' | 'stable' {
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const recentAverage = scores.slice(-3).reduce((a, b) => a + b, 0) / 3;

    if (recentAverage > average + 0.5) return 'up';
    if (recentAverage < average - 0.5) return 'down';
    return 'stable';
  }

  /**
   * 信頼度を計算
   */
  private calculateConfidence(scores: number[]): number {
    const variance = this.calculateVariance(scores);
    return Math.max(0, Math.min(1, 1 - variance / 10));
  }

  /**
   * 分散を計算
   */
  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squareDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return squareDiffs.reduce((a, b) => a + b, 0) / numbers.length;
  }

  /**
   * トレンドのキーワードを抽出
   */
  private extractTrendKeywords(readings: FortuneHistory['readings']): string[] {
    const keywords = new Map<string, number>();
    const stopWords = ['です', 'ます', 'した', 'から', 'など', 'という'];

    readings.forEach(reading => {
      const words = reading.result.reading.split(/[\s,。、！？!?]+/);
      words.forEach(word => {
        if (word.length > 1 && !stopWords.includes(word)) {
          keywords.set(word, (keywords.get(word) || 0) + 1);
        }
      });
    });

    return Array.from(keywords.entries())
      .filter(([_, count]) => count >= readings.length * 0.3)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * 詳細なパターンを検出
   */
  private detectDetailedPatterns(readings: FortuneHistory['readings']) {
    const patterns: AnalysisResult['patterns'] = [];

    // 周期性パターン
    const cyclicalPattern = this.detectCyclicalPattern(readings);
    if (cyclicalPattern) {
      patterns.push(cyclicalPattern);
    }

    // キーワードパターン
    const keywordPatterns = this.detectKeywordPatterns(readings);
    patterns.push(...keywordPatterns);

    // 占い種類の組み合わせパターン
    const combinationPatterns = this.detectCombinationPatterns(readings);
    patterns.push(...combinationPatterns);

    return patterns;
  }

  /**
   * 周期性パターンを検出
   */
  private detectCyclicalPattern(readings: FortuneHistory['readings']) {
    const timestamps = readings.map(r => new Date(r.timestamp).getTime());
    const intervals = timestamps.slice(1).map((t, i) => t - timestamps[i]);
    
    if (intervals.length < 2) return null;

    const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = this.calculateVariance(intervals);
    const regularity = 1 - Math.min(1, variance / (averageInterval * averageInterval));

    if (regularity > 0.7) {
      const days = Math.round(averageInterval / (24 * 60 * 60 * 1000));
      return {
        type: 'cyclical',
        description: `約${days}日周期のパターンが検出されました`,
        frequency: days,
        significance: regularity
      };
    }

    return null;
  }

  /**
   * キーワードパターンを検出
   */
  private detectKeywordPatterns(readings: FortuneHistory['readings']) {
    const patterns: AnalysisResult['patterns'] = [];
    const keywordSequences = new Map<string, number>();

    // 連続するキーワードを検出
    for (let i = 1; i < readings.length; i++) {
      const prevWords = readings[i - 1].result.reading.split(/[\s,。、！？!?]+/);
      const currWords = readings[i].result.reading.split(/[\s,。、！？!?]+/);

      const commonWords = prevWords.filter(w => currWords.includes(w));
      commonWords.forEach(word => {
        if (word.length > 1) {
          keywordSequences.set(word, (keywordSequences.get(word) || 0) + 1);
        }
      });
    }

    // 重要なキーワードパターンを抽出
    Array.from(keywordSequences.entries())
      .filter(([_, count]) => count >= readings.length * 0.3)
      .forEach(([word, count]) => {
        patterns.push({
          type: 'keyword',
          description: `キーワード「${word}」が頻繁に出現`,
          frequency: count,
          significance: count / readings.length
        });
      });

    return patterns;
  }

  /**
   * 占い種類の組み合わせパターンを検出
   */
  private detectCombinationPatterns(readings: FortuneHistory['readings']) {
    const patterns: AnalysisResult['patterns'] = [];
    const combinations = new Map<string, number>();

    // 連続する占い種類の組み合わせを検出
    for (let i = 1; i < readings.length; i++) {
      const combo = `${readings[i - 1].type}-${readings[i].type}`;
      combinations.set(combo, (combinations.get(combo) || 0) + 1);
    }

    // 重要な組み合わせパターンを抽出
    Array.from(combinations.entries())
      .filter(([_, count]) => count >= 2)
      .forEach(([combo, count]) => {
        const [type1, type2] = combo.split('-');
        patterns.push({
          type: 'combination',
          description: `${type1}と${type2}の組み合わせが多く見られます`,
          frequency: count,
          significance: count / (readings.length - 1)
        });
      });

    return patterns;
  }

  /**
   * 相関関係を分析
   */
  private analyzeCorrelations(readings: FortuneHistory['readings']) {
    const correlations: AnalysisResult['correlations'] = [];

    // 占い種類間の相関
    const typeCorrelations = this.analyzeTypeCorrelations(readings);
    correlations.push(...typeCorrelations);

    // キーワード間の相関
    const keywordCorrelations = this.analyzeKeywordCorrelations(readings);
    correlations.push(...keywordCorrelations);

    return correlations;
  }

  /**
   * 占い種類間の相関を分析
   */
  private analyzeTypeCorrelations(readings: FortuneHistory['readings']) {
    const correlations: AnalysisResult['correlations'] = [];
    const types = new Set(readings.map(r => r.type));

    // 各占い種類のペアについて分析
    Array.from(types).forEach(type1 => {
      Array.from(types).forEach(type2 => {
        if (type1 >= type2) return; // 重複を避ける

        const readings1 = readings.filter(r => r.type === type1);
        const readings2 = readings.filter(r => r.type === type2);

        const correlation = this.calculateCorrelation(
          readings1.map(r => this.calculateSentimentScore(r.result.reading)),
          readings2.map(r => this.calculateSentimentScore(r.result.reading))
        );

        if (Math.abs(correlation) > 0.5) {
          correlations.push({
            factors: [type1, type2],
            strength: correlation,
            description: this.describeCorrelation(type1, type2, correlation)
          });
        }
      });
    });

    return correlations;
  }

  /**
   * キーワード間の相関を分析
   */
  private analyzeKeywordCorrelations(readings: FortuneHistory['readings']) {
    const correlations: AnalysisResult['correlations'] = [];
    const keywords = this.extractTrendKeywords(readings);

    // 各キーワードのペアについて分析
    keywords.forEach((keyword1, i) => {
      keywords.slice(i + 1).forEach(keyword2 => {
        const scores1 = readings.map(r => 
          r.result.reading.includes(keyword1) ? 1 : 0
        );
        const scores2 = readings.map(r => 
          r.result.reading.includes(keyword2) ? 1 : 0
        );

        const correlation = this.calculateCorrelation(scores1, scores2);

        if (Math.abs(correlation) > 0.5) {
          correlations.push({
            factors: [keyword1, keyword2],
            strength: correlation,
            description: `キーワード「${keyword1}」と「${keyword2}」には${
              correlation > 0 ? '正の' : '負の'
            }相関が見られます`
          });
        }
      });
    });

    return correlations;
  }

  /**
   * 相関係数を計算
   */
  private calculateCorrelation(array1: number[], array2: number[]): number {
    const n = Math.min(array1.length, array2.length);
    if (n < 2) return 0;

    const mean1 = array1.reduce((a, b) => a + b, 0) / n;
    const mean2 = array2.reduce((a, b) => a + b, 0) / n;

    const variance1 = array1.reduce((a, b) => a + Math.pow(b - mean1, 2), 0) / n;
    const variance2 = array2.reduce((a, b) => a + Math.pow(b - mean2, 2), 0) / n;

    if (variance1 === 0 || variance2 === 0) return 0;

    const covariance = array1
      .slice(0, n)
      .reduce((a, b, i) => a + (b - mean1) * (array2[i] - mean2), 0) / n;

    return covariance / Math.sqrt(variance1 * variance2);
  }

  /**
   * 相関関係を説明
   */
  private describeCorrelation(type1: string, type2: string, correlation: number): string {
    const strength = Math.abs(correlation) > 0.8 ? '強い' : '中程度の';
    const direction = correlation > 0 ? '正の' : '負の';
    return `${type1}と${type2}の間には${strength}${direction}相関が見られます`;
  }

  /**
   * 予測を生成
   */
  private generatePredictions(readings: FortuneHistory['readings']) {
    const predictions: AnalysisResult['predictions'] = [];

    // トレンドベースの予測
    const trendPredictions = this.generateTrendPredictions(readings);
    predictions.push(...trendPredictions);

    // パターンベースの予測
    const patternPredictions = this.generatePatternPredictions(readings);
    predictions.push(...patternPredictions);

    return predictions;
  }

  /**
   * トレンドベースの予測を生成
   */
  private generateTrendPredictions(readings: FortuneHistory['readings']) {
    const predictions: AnalysisResult['predictions'] = [];
    const recentReadings = readings.slice(-5);

    if (recentReadings.length < 3) return predictions;

    const sentimentScores = recentReadings.map(r => 
      this.calculateSentimentScore(r.result.reading)
    );
    const trend = this.calculateTrend(sentimentScores);
    const confidence = this.calculateConfidence(sentimentScores);

    predictions.push({
      aspect: '全体的な運勢',
      likelihood: confidence,
      timeframe: '1週間以内',
      basis: ['最近のトレンド分析', `${trend === 'up' ? '上昇' : trend === 'down' ? '下降' : '安定'}傾向`]
    });

    return predictions;
  }

  /**
   * パターンベースの予測を生成
   */
  private generatePatternPredictions(readings: FortuneHistory['readings']) {
    const predictions: AnalysisResult['predictions'] = [];
    const patterns = this.detectDetailedPatterns(readings);

    patterns.forEach(pattern => {
      if (pattern.type === 'cyclical' && pattern.significance > 0.7) {
        predictions.push({
          aspect: '周期的な変化',
          likelihood: pattern.significance,
          timeframe: `${pattern.frequency}日後`,
          basis: ['周期性パターン', `${pattern.frequency}日周期の規則性`]
        });
      }
    });

    return predictions;
  }
} 