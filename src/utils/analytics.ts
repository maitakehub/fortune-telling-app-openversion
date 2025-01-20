import { FortuneHistory, FortuneReading, FortuneType } from '../types';
import { FORTUNE_CONSTANTS } from '../constants/fortune';
import { getGeminiResponse } from './ai/gemini';

type FortuneTypeRecord<T> = {
  [K in FortuneType]: T;
};

type AspectRecord<T> = {
  [K in typeof FORTUNE_CONSTANTS.ASPECTS[keyof typeof FORTUNE_CONSTANTS.ASPECTS]]: T;
};

export interface AnalysisResult {
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

interface AnalyticsResult {
  trends: {
    overall: string[];
    byType: FortuneTypeRecord<string[]>;
  };
  patterns: {
    frequency: Record<string, number>;
    correlations: Record<string, number>;
    seasonality: Record<string, any>;
  };
  recommendations: string[];
  statistics: {
    totalReadings: number;
    averageScore?: number;
    typeDistribution: FortuneTypeRecord<number>;
    aspectTrends: AspectRecord<number>;
  };
}

interface AnalyticsOptions {
  period?: 'day' | 'week' | 'month' | 'year';
  includeSeasonality?: boolean;
  minReadingsForAnalysis?: number;
}

/**
 * 高度な分析機能を提供するクラス
 */
export class FortuneAnalytics {
  /**
   * 時系列分析を実行
   */
  async analyzeTimeSeries(history: FortuneHistory): Promise<AnalysisResult> {
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

    // AIを活用した予測生成
    const aiPredictions = await this.generateAIPredictions(readings);
    result.predictions = [
      ...aiPredictions,
      ...this.generateTrendPredictions(readings),
      ...this.generatePatternPredictions(readings)
    ];

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

  /**
   * AIを活用した予測生成
   */
  private async generateAIPredictions(readings: FortuneHistory['readings']): Promise<AnalysisResult['predictions']> {
    const recentReadings = readings.slice(-10);
    if (recentReadings.length < 3) return [];

    const systemPrompt = `
あなたは占い師として、過去の占い結果から将来の予測を行います。
以下の点に注意して予測を生成してください：

1. 過去のパターンと傾向を分析
2. 各分野（総合運、恋愛運、仕事運など）の変化を考慮
3. 具体的な時期と可能性を提示
4. 予測の根拠を明確に説明
`;

    const userPrompt = `
過去の占い結果：
${recentReadings.map(r => `
日時: ${new Date(r.timestamp).toLocaleDateString()}
種類: ${getFortuneTypeName(r.type)}
結果: ${r.result.reading}
`).join('\n')}

以下の形式で予測を生成してください：
{
  "predictions": [
    {
      "aspect": "予測の分野",
      "likelihood": 0.1-1.0の確率,
      "timeframe": "予測の時期",
      "basis": ["予測の根拠1", "予測の根拠2"]
    }
  ]
}`;

    try {
      const response = await getGeminiResponse(systemPrompt, userPrompt);
      if (response.error) throw response.error;

      const aiPredictions = JSON.parse(response.content);
      return aiPredictions.predictions;
    } catch (error) {
      console.error('AI予測の生成に失敗しました:', error);
      return this.generateTrendPredictions(readings);
    }
  }
}

/**
 * 占い結果を分析する
 */
export function analyzeFortuneReadings(
  readings: FortuneReading[],
  options: AnalyticsOptions = {}
): AnalyticsResult {
  const {
    period = 'month',
    includeSeasonality = true,
    minReadingsForAnalysis = 5
  } = options;

  if (readings.length < minReadingsForAnalysis) {
    return createEmptyAnalytics();
  }

  // 基本統計の計算
  const statistics = calculateStatistics(readings);

  // トレンド分析
  const trends = analyzeTrends(readings, period);

  // パターン検出
  const patterns = detectPatterns(readings, includeSeasonality);

  // レコメンデーション生成
  const recommendations = generateRecommendations(trends, patterns, statistics);

  return {
    trends,
    patterns,
    recommendations,
    statistics
  };
}

/**
 * 基本統計を計算
 */
function calculateStatistics(readings: FortuneReading[]) {
  const typeDistribution = Object.values(FORTUNE_CONSTANTS.TYPES).reduce(
    (acc, type) => ({ ...acc, [type]: 0 }),
    {} as FortuneTypeRecord<number>
  );

  const aspectTrends = Object.values(FORTUNE_CONSTANTS.ASPECTS).reduce(
    (acc, aspect) => ({ ...acc, [aspect]: 0 }),
    {} as AspectRecord<number>
  );

  readings.forEach(reading => {
    // 占いの種類の分布
    typeDistribution[reading.type]++;

    // 運勢の分野ごとの傾向
    if ('aspects' in reading) {
      const aspects = reading.aspects as Record<string, string>;
      Object.keys(aspects).forEach(aspect => {
        if (aspect in aspectTrends) {
          const score = calculateAspectScore(aspects[aspect]);
          aspectTrends[aspect as keyof AspectRecord<number>] += score;
        }
      });
    }
  });

  return {
    totalReadings: readings.length,
    typeDistribution,
    aspectTrends: normalizeAspectTrends(aspectTrends, readings.length)
  };
}

/**
 * トレンドを分析
 */
function analyzeTrends(readings: FortuneReading[], period: string) {
  const overall: string[] = [];
  const byType = Object.values(FORTUNE_CONSTANTS.TYPES).reduce(
    (acc, type) => ({ ...acc, [type]: [] }),
    {} as FortuneTypeRecord<string[]>
  );

  // 期間でグループ化
  const groupedReadings = groupReadingsByPeriod(readings, period);

  // 全体的なトレンド
  const overallTrend = calculateOverallTrend(groupedReadings);
  overall.push(...overallTrend);

  // 占いの種類ごとのトレンド
  Object.values(FORTUNE_CONSTANTS.TYPES).forEach(type => {
    const typeReadings = readings.filter(r => r.type === type);
    const typeTrend = calculateTypeTrend(typeReadings);
    byType[type].push(...typeTrend);
  });

  return { overall, byType };
}

/**
 * パターンを検出
 */
function detectPatterns(readings: FortuneReading[], includeSeasonality: boolean) {
  const patterns = {
    frequency: calculateFrequencyPatterns(readings),
    correlations: calculateCorrelations(readings),
    seasonality: includeSeasonality ? analyzeSeasonality(readings) : {}
  };

  return patterns;
}

/**
 * レコメンデーションを生成
 */
function generateRecommendations(
  trends: AnalyticsResult['trends'],
  patterns: AnalyticsResult['patterns'],
  statistics: AnalyticsResult['statistics']
): string[] {
  const recommendations: string[] = [];

  // 全体的なトレンドに基づくレコメンデーション
  if (trends.overall.length > 0) {
    recommendations.push(
      `全体的な傾向として${trends.overall[0]}が見られます。`
    );
  }

  // 最も頻度の高い占いタイプに基づくレコメンデーション
  const mostFrequentType = Object.entries(statistics.typeDistribution)
    .sort(([, a], [, b]) => b - a)[0][0];
  recommendations.push(
    `${getFortuneTypeName(mostFrequentType)}の占いとの相性が特に良いようです。`
  );

  // 運勢の分野に基づくレコメンデーション
  const strongestAspect = Object.entries(statistics.aspectTrends)
    .sort(([, a], [, b]) => b - a)[0][0];
  recommendations.push(
    `${getAspectName(strongestAspect)}に関する運勢が特に良好です。`
  );

  return recommendations;
}

/**
 * 空の分析結果を作成
 */
function createEmptyAnalytics(): AnalyticsResult {
  const emptyTypeDistribution = Object.values(FORTUNE_CONSTANTS.TYPES).reduce(
    (acc, type) => ({ ...acc, [type]: 0 }),
    {} as FortuneTypeRecord<number>
  );

  const emptyTypeArray = Object.values(FORTUNE_CONSTANTS.TYPES).reduce(
    (acc, type) => ({ ...acc, [type]: [] }),
    {} as FortuneTypeRecord<string[]>
  );

  const emptyAspectTrends = Object.values(FORTUNE_CONSTANTS.ASPECTS).reduce(
    (acc, aspect) => ({ ...acc, [aspect]: 0 }),
    {} as AspectRecord<number>
  );

  return {
    trends: {
      overall: [],
      byType: emptyTypeArray
    },
    patterns: {
      frequency: {},
      correlations: {},
      seasonality: {}
    },
    recommendations: ['十分なデータがありません。'],
    statistics: {
      totalReadings: 0,
      typeDistribution: emptyTypeDistribution,
      aspectTrends: emptyAspectTrends
    }
  };
}

// ユーティリティ関数

function calculateAspectScore(aspect: string): number {
  const positiveWords = ['上昇', '好調', '幸運', '良い', '成功'];
  const negativeWords = ['下降', '不調', '不運', '悪い', '失敗'];

  let score = 50; // 基準値
  positiveWords.forEach(word => {
    if (aspect.includes(word)) score += 10;
  });
  negativeWords.forEach(word => {
    if (aspect.includes(word)) score -= 10;
  });

  return Math.max(0, Math.min(100, score));
}

/**
 * 運勢の分野ごとの傾向を正規化
 */
function normalizeAspectTrends(trends: AspectRecord<number>, totalReadings: number): AspectRecord<number> {
  return Object.entries(trends).reduce(
    (acc, [aspect, value]) => ({
      ...acc,
      [aspect]: totalReadings > 0 ? value / totalReadings : 0
    }),
    {} as AspectRecord<number>
  );
}

function groupReadingsByPeriod(readings: FortuneReading[], period: string) {
  const grouped: Record<string, FortuneReading[]> = {};
  readings.forEach(reading => {
    const date = new Date(reading.timestamp);
    let key: string;

    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'year':
        key = String(date.getFullYear());
        break;
      default:
        key = date.toISOString().split('T')[0];
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(reading);
  });

  return grouped;
}

function calculateOverallTrend(
  groupedReadings: Record<string, FortuneReading[]>
): string[] {
  const trends: string[] = [];
  const periods = Object.keys(groupedReadings).sort();

  if (periods.length < 2) return trends;

  let positiveCount = 0;
  let negativeCount = 0;

  periods.forEach(period => {
    const readings = groupedReadings[period];
    readings.forEach(reading => {
      if ('aspects' in reading) {
        const aspects = reading.aspects as Record<string, string>;
        Object.values(aspects).forEach(aspect => {
          const score = calculateAspectScore(aspect);
          if (score > 60) positiveCount++;
          if (score < 40) negativeCount++;
        });
      }
    });
  });

  if (positiveCount > negativeCount * 1.5) {
    trends.push('上昇傾向');
  } else if (negativeCount > positiveCount * 1.5) {
    trends.push('調整期');
  } else {
    trends.push('安定期');
  }

  return trends;
}

function calculateTypeTrend(readings: FortuneReading[]): string[] {
  const trends: string[] = [];
  if (readings.length < 3) return trends;

  // 最新の3件を分析
  const recent = readings.slice(-3);
  const scores = recent.map(reading => {
    if ('aspects' in reading) {
      const aspects = reading.aspects as Record<string, string>;
      return Object.values(aspects).reduce((sum, aspect) => {
        return sum + calculateAspectScore(aspect);
      }, 0) / Object.keys(aspects).length;
    }
    return 50;
  });

  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  if (average > 60) {
    trends.push('好調');
  } else if (average < 40) {
    trends.push('要注意');
  } else {
    trends.push('平常');
  }

  return trends;
}

function calculateFrequencyPatterns(readings: FortuneReading[]) {
  const frequency: Record<string, number> = {};
  readings.forEach(reading => {
    frequency[reading.type] = (frequency[reading.type] || 0) + 1;
  });
  return frequency;
}

function calculateCorrelations(readings: FortuneReading[]) {
  const correlations: Record<string, number> = {};
  if (readings.length < 2) return correlations;

  readings.forEach((reading, i) => {
    if (i === 0) return;
    const prev = readings[i - 1];
    if ('aspects' in reading && 'aspects' in prev) {
      const currentAspects = reading.aspects as Record<string, string>;
      const prevAspects = prev.aspects as Record<string, string>;
      Object.keys(currentAspects).forEach(aspect => {
        const currentScore = calculateAspectScore(currentAspects[aspect]);
        const prevScore = calculateAspectScore(prevAspects[aspect]);
        correlations[aspect] = (correlations[aspect] || 0) + 
          (Math.abs(currentScore - prevScore) < 20 ? 1 : 0);
      });
    }
  });

  return correlations;
}

function analyzeSeasonality(readings: FortuneReading[]) {
  const seasonality: Record<string, any> = {
    monthly: {},
    dayOfWeek: {}
  };

  readings.forEach(reading => {
    const date = new Date(reading.timestamp);
    const month = date.getMonth();
    const dayOfWeek = date.getDay();

    if ('aspects' in reading) {
      const aspects = reading.aspects as Record<string, string>;
      Object.entries(aspects).forEach(([aspect, value]) => {
        const score = calculateAspectScore(value);

        // 月別の傾向
        if (!seasonality.monthly[month]) {
          seasonality.monthly[month] = { count: 0, total: 0 };
        }
        seasonality.monthly[month].count++;
        seasonality.monthly[month].total += score;

        // 曜日別の傾向
        if (!seasonality.dayOfWeek[dayOfWeek]) {
          seasonality.dayOfWeek[dayOfWeek] = { count: 0, total: 0 };
        }
        seasonality.dayOfWeek[dayOfWeek].count++;
        seasonality.dayOfWeek[dayOfWeek].total += score;
      });
    }
  });

  // 平均値の計算
  Object.values(seasonality).forEach(category => {
    Object.keys(category).forEach(key => {
      const { count, total } = category[key];
      category[key] = count > 0 ? total / count : 0;
    });
  });

  return seasonality;
}

function getFortuneTypeName(type: string): string {
  const names: Record<string, string> = {
    numerology: '数秘術',
    tarot: 'タロット',
    palm: '手相',
    dream: '夢占い',
    compatibility: '相性占い',
    fortune: '運勢占い'
  };
  return names[type] || type;
}

function getAspectName(aspect: string): string {
  const names: Record<string, string> = {
    general: '総合運',
    love: '恋愛運',
    work: '仕事運',
    health: '健康運',
    money: '金運'
  };
  return names[aspect] || aspect;
} 