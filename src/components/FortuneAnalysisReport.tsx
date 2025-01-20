import React from 'react';
import { motion } from 'framer-motion';
import { AnalysisResult } from '../utils/analytics';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface Props {
  analysis: AnalysisResult;
  onClose?: () => void;
}

interface TrendDataPoint {
  period: string;
  confidence: number;
  trend: number;
}

interface PatternDataPoint {
  type: string;
  frequency: number;
  significance: number;
}

export function FortuneAnalysisReport({ analysis, onClose }: Props) {
  // トレンドデータの準備
  const trendData: TrendDataPoint[] = analysis.trends.map(trend => ({
    period: trend.period,
    confidence: trend.confidence * 100,
    trend: trend.trend === 'up' ? 1 : trend.trend === 'down' ? -1 : 0
  }));

  // パターンデータの準備
  const patternData: PatternDataPoint[] = analysis.patterns.map(pattern => ({
    type: pattern.type,
    frequency: pattern.frequency,
    significance: pattern.significance * 100
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-purple-900/90 rounded-lg p-6 shadow-xl border border-purple-700/50 max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-purple-100">詳細分析レポート</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-purple-100 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* トレンド分析 */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-purple-200 mb-4">トレンド分析</h3>
        <div className="h-64 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis dataKey="period" stroke="#E9D5FF" />
              <YAxis stroke="#E9D5FF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #4B5563'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="confidence"
                stroke="#8B5CF6"
                name="信頼度"
              />
              <Line
                type="monotone"
                dataKey="trend"
                stroke="#F472B6"
                name="トレンド"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* パターン分析 */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-purple-200 mb-4">パターン分析</h3>
        <div className="h-64 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={patternData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis dataKey="type" stroke="#E9D5FF" />
              <YAxis stroke="#E9D5FF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #4B5563'
                }}
              />
              <Legend />
              <Bar dataKey="significance" fill="#8B5CF6" name="重要度" />
              <Bar dataKey="frequency" fill="#F472B6" name="頻度" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 予測 */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold text-purple-200 mb-4">予測</h3>
        <div className="space-y-4">
          {analysis.predictions.map((prediction, index: number) => (
            <div
              key={index}
              className="bg-purple-800/50 rounded-lg p-4 border border-purple-700/30"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-lg font-medium text-purple-100">
                  {prediction.aspect}
                </h4>
                <span className="text-sm text-purple-300">
                  確率: {Math.round(prediction.likelihood * 100)}%
                </span>
              </div>
              <p className="text-purple-200 mb-2">時期: {prediction.timeframe}</p>
              <div className="text-sm text-purple-300">
                <p className="font-medium mb-1">根拠:</p>
                <ul className="list-disc list-inside space-y-1">
                  {prediction.basis.map((basis: string, i: number) => (
                    <li key={i}>{basis}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 相関関係 */}
      <section>
        <h3 className="text-xl font-semibold text-purple-200 mb-4">相関関係</h3>
        <div className="space-y-4">
          {analysis.correlations.map((correlation, index: number) => (
            <div
              key={index}
              className="bg-purple-800/50 rounded-lg p-4 border border-purple-700/30"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-purple-100">
                  {correlation.factors.join(' × ')}
                </div>
                <span className="text-sm text-purple-300">
                  強度: {Math.round(correlation.strength * 100)}%
                </span>
              </div>
              <p className="text-purple-200">{correlation.description}</p>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
} 