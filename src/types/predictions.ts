// MetalMind AI — Prediction Types

import { MetalType, TrendDirection } from './metals';

export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type Recommendation = 'strong_buy' | 'buy' | 'accumulate' | 'hold' | 'wait' | 'reduce' | 'sell';
export type PredictionTimeframe = '1d' | '7d' | '30d';

export interface PriceRange {
  low: number;
  high: number;
  midpoint: number;
}

export interface Prediction {
  id: string;
  metal: MetalType;
  timeframe: PredictionTimeframe;
  expectedRange: PriceRange;
  probability: number;          // 0-100
  confidence: ConfidenceLevel;
  direction: TrendDirection;
  sentiment: string;
  recommendation: Recommendation;
  explanation: string;
  indicators: IndicatorSnapshot;
  generatedAt: string;
}

export interface IndicatorSnapshot {
  rsi: IndicatorValue;
  macd: MACDValue;
  ema9: number;
  ema20: number;
  ema50: number;
  ema200: number;
  sma20: number;
  sma50: number;
  sma200: number;
  bollingerUpper: number;
  bollingerMiddle: number;
  bollingerLower: number;
  atr: number;
  momentum: number;
}

export interface IndicatorValue {
  value: number;
  signal: 'overbought' | 'oversold' | 'neutral';
  description: string;
}

export interface MACDValue {
  macd: number;
  signal: number;
  histogram: number;
  crossover: 'bullish' | 'bearish' | 'none';
}

export interface PredictionScore {
  trendScore: number;       // 0-100
  momentumScore: number;    // 0-100
  volatilityScore: number;  // 0-100
  ratioScore: number;       // 0-100
  patternScore: number;     // 0-100
  composite: number;        // 0-100 weighted
}

export interface PredictionAccuracy {
  timeframe: PredictionTimeframe;
  totalPredictions: number;
  correctDirection: number;
  withinRange: number;
  accuracy: number;
}
