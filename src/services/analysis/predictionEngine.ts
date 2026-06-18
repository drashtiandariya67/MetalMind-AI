// MetalMind AI — AI Prediction Engine
// Multi-factor scoring algorithm for price forecasting

import { generateIndicatorSnapshot } from './technicalAnalysis';
import { RATIO_HISTORY } from '@/constants/metals';
import type { HistoricalPrice } from '@/types/metals';
import type {
  Prediction,
  PredictionTimeframe,
  PredictionScore,
  ConfidenceLevel,
  Recommendation,
  IndicatorSnapshot,
} from '@/types/predictions';
import type { GoldSilverRatio } from '@/types/metals';

/**
 * Generate a complete prediction for a metal
 */
export function generatePrediction(
  metal: 'gold' | 'silver',
  historicalData: HistoricalPrice[],
  currentPrice: number,
  ratio: GoldSilverRatio,
  timeframe: PredictionTimeframe = '1d'
): Prediction {
  const closes = historicalData.map(d => d.close);
  const highs = historicalData.map(d => d.high);
  const lows = historicalData.map(d => d.low);

  // Calculate indicator snapshot
  const indicators = generateIndicatorSnapshot(closes, highs, lows);

  // Score each factor
  const scores = calculateScores(indicators, currentPrice, ratio, metal, closes);

  // Map composite score to direction and recommendation
  const direction = scores.composite > 55 ? 'bullish' as const
    : scores.composite < 45 ? 'bearish' as const
    : 'neutral' as const;

  const confidence = calculateConfidence(indicators, scores);
  const recommendation = mapScoreToRecommendation(scores.composite, confidence);
  const expectedRange = calculateExpectedRange(currentPrice, indicators.atr, timeframe, direction);

  const probability = Math.min(95, Math.max(20,
    direction === 'neutral' ? 50 : scores.composite + (Math.random() * 5 - 2.5)
  ));

  const explanation = generateExplanation(metal, indicators, scores, direction, recommendation);
  const sentiment = generateSentiment(scores, direction);

  return {
    id: `${metal}_${timeframe}_${Date.now()}`,
    metal,
    timeframe,
    expectedRange,
    probability: Math.round(probability),
    confidence,
    direction,
    sentiment,
    recommendation,
    explanation,
    indicators,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Calculate multi-factor scores
 */
function calculateScores(
  indicators: IndicatorSnapshot,
  currentPrice: number,
  ratio: GoldSilverRatio,
  metal: 'gold' | 'silver',
  closes: number[]
): PredictionScore {
  // 1. Trend Score (30%) — EMA alignment, price position
  let trendScore = 50;
  if (currentPrice > indicators.ema20) trendScore += 10;
  if (currentPrice > indicators.ema50) trendScore += 10;
  if (currentPrice > indicators.ema200) trendScore += 10;
  if (indicators.ema9 > indicators.ema20) trendScore += 8;
  if (indicators.ema20 > indicators.ema50) trendScore += 7;
  if (currentPrice < indicators.ema20) trendScore -= 10;
  if (currentPrice < indicators.ema50) trendScore -= 10;
  if (currentPrice < indicators.ema200) trendScore -= 10;
  trendScore = Math.max(0, Math.min(100, trendScore));

  // 2. Momentum Score (25%) — RSI, MACD
  let momentumScore = 50;
  const rsi = indicators.rsi.value;
  if (rsi > 50 && rsi < 70) momentumScore += 15;
  if (rsi > 70) momentumScore -= 10; // overbought
  if (rsi < 30) momentumScore += 10; // oversold = potential bounce
  if (rsi < 50 && rsi > 30) momentumScore -= 10;

  if (indicators.macd.histogram > 0) momentumScore += 10;
  if (indicators.macd.histogram < 0) momentumScore -= 10;
  if (indicators.macd.crossover === 'bullish') momentumScore += 15;
  if (indicators.macd.crossover === 'bearish') momentumScore -= 15;
  if (indicators.momentum > 0) momentumScore += 5;
  if (indicators.momentum < 0) momentumScore -= 5;
  momentumScore = Math.max(0, Math.min(100, momentumScore));

  // 3. Volatility Score (15%) — Bollinger position, ATR
  let volatilityScore = 50;
  const bbWidth = (indicators.bollingerUpper - indicators.bollingerLower) / indicators.bollingerMiddle;
  if (bbWidth < 0.03) volatilityScore += 10; // squeeze = potential breakout
  if (currentPrice > indicators.bollingerMiddle) volatilityScore += 10;
  if (currentPrice < indicators.bollingerLower) volatilityScore += 15; // potential bounce
  if (currentPrice > indicators.bollingerUpper) volatilityScore -= 10; // overextended
  volatilityScore = Math.max(0, Math.min(100, volatilityScore));

  // 4. Ratio Score (15%) — Gold/Silver ratio analysis
  let ratioScore = 50;
  if (metal === 'silver' && ratio.silverValuation === 'undervalued') {
    ratioScore += 20;
  } else if (metal === 'silver' && ratio.silverValuation === 'overvalued') {
    ratioScore -= 15;
  }
  if (metal === 'gold' && ratio.current > RATIO_HISTORY.recentAverage) {
    ratioScore += 5; // Gold dominant
  }
  ratioScore = Math.max(0, Math.min(100, ratioScore));

  // 5. Pattern Score (15%) — Recent price patterns
  let patternScore = 50;
  if (closes.length >= 5) {
    const recent5 = closes.slice(-5);
    const higherHighs = recent5.filter((v, i) => i > 0 && v > recent5[i - 1]).length;
    const lowerLows = recent5.filter((v, i) => i > 0 && v < recent5[i - 1]).length;
    if (higherHighs >= 3) patternScore += 20;
    if (lowerLows >= 3) patternScore -= 20;

    // Support/Resistance check
    const min20 = Math.min(...closes.slice(-20));
    const max20 = Math.max(...closes.slice(-20));
    const range = max20 - min20;
    if (range > 0) {
      const position = (currentPrice - min20) / range;
      if (position < 0.2) patternScore += 10; // Near support
      if (position > 0.8) patternScore -= 5; // Near resistance
    }
  }
  patternScore = Math.max(0, Math.min(100, patternScore));

  // Weighted composite
  const composite = (
    trendScore * 0.30 +
    momentumScore * 0.25 +
    volatilityScore * 0.15 +
    ratioScore * 0.15 +
    patternScore * 0.15
  );

  return { trendScore, momentumScore, volatilityScore, ratioScore, patternScore, composite };
}

/**
 * Calculate confidence level based on indicator agreement
 */
function calculateConfidence(indicators: IndicatorSnapshot, scores: PredictionScore): ConfidenceLevel {
  const factors = [
    scores.trendScore,
    scores.momentumScore,
    scores.volatilityScore,
    scores.ratioScore,
    scores.patternScore,
  ];

  // Calculate standard deviation of scores (lower = more agreement)
  const mean = factors.reduce((a, b) => a + b, 0) / factors.length;
  const variance = factors.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / factors.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev < 12 && (scores.composite > 65 || scores.composite < 35)) return 'high';
  if (stdDev < 18) return 'medium';
  return 'low';
}

/**
 * Map composite score to recommendation
 */
function mapScoreToRecommendation(score: number, confidence: ConfidenceLevel): Recommendation {
  if (score > 80 && confidence === 'high') return 'strong_buy';
  if (score > 65) return 'buy';
  if (score > 55) return 'accumulate';
  if (score > 45) return 'hold';
  if (score > 35) return 'wait';
  if (score > 20) return 'reduce';
  return 'sell';
}

/**
 * Calculate expected price range using ATR
 */
function calculateExpectedRange(
  currentPrice: number,
  atr: number,
  timeframe: PredictionTimeframe,
  direction: 'bullish' | 'bearish' | 'neutral'
): { low: number; high: number; midpoint: number } {
  const multiplier = timeframe === '1d' ? 1 : timeframe === '7d' ? 2.5 : 5;
  const range = atr * multiplier;

  let bias = 0;
  if (direction === 'bullish') bias = range * 0.2;
  if (direction === 'bearish') bias = -range * 0.2;

  const low = currentPrice - range + bias;
  const high = currentPrice + range + bias;
  const midpoint = (low + high) / 2;

  return { low, high, midpoint };
}

/**
 * Generate natural language explanation
 */
function generateExplanation(
  metal: string,
  indicators: IndicatorSnapshot,
  scores: PredictionScore,
  direction: 'bullish' | 'bearish' | 'neutral',
  recommendation: Recommendation
): string {
  const metalName = metal.charAt(0).toUpperCase() + metal.slice(1);
  const parts: string[] = [];

  // EMA analysis
  if (scores.trendScore > 60) {
    parts.push(`${metalName} is trading above key moving averages (EMA 20/50)`);
  } else if (scores.trendScore < 40) {
    parts.push(`${metalName} is trading below key moving averages`);
  }

  // RSI analysis
  if (indicators.rsi.signal === 'overbought') {
    parts.push(`RSI is overbought at ${indicators.rsi.value.toFixed(0)}, suggesting potential pullback`);
  } else if (indicators.rsi.signal === 'oversold') {
    parts.push(`RSI is oversold at ${indicators.rsi.value.toFixed(0)}, potential bounce opportunity`);
  } else if (indicators.rsi.value > 50) {
    parts.push(`RSI remains healthy at ${indicators.rsi.value.toFixed(0)}`);
  }

  // MACD analysis
  if (indicators.macd.crossover === 'bullish') {
    parts.push('MACD shows bullish crossover');
  } else if (indicators.macd.crossover === 'bearish') {
    parts.push('MACD shows bearish crossover');
  } else if (indicators.macd.histogram > 0) {
    parts.push('MACD histogram is positive');
  }

  // Momentum
  if (Math.abs(indicators.momentum) > 2) {
    parts.push(`Momentum is ${indicators.momentum > 0 ? 'increasing' : 'decreasing'} at ${indicators.momentum.toFixed(1)}%`);
  }

  const directionWord = direction === 'bullish' ? 'Bullish' : direction === 'bearish' ? 'Bearish' : 'Mixed';
  const recLabel = recommendation.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return `${parts.join('. ')}. ${directionWord} momentum is ${direction === 'neutral' ? 'balanced' : direction === 'bullish' ? 'building' : 'fading'}. Recommendation: ${recLabel}.`;
}

/**
 * Generate market sentiment string
 */
function generateSentiment(scores: PredictionScore, direction: 'bullish' | 'bearish' | 'neutral'): string {
  if (scores.composite > 75) return 'Very Bullish';
  if (scores.composite > 60) return 'Bullish';
  if (scores.composite > 55) return 'Slightly Bullish';
  if (scores.composite > 45) return 'Neutral';
  if (scores.composite > 40) return 'Slightly Bearish';
  if (scores.composite > 25) return 'Bearish';
  return 'Very Bearish';
}

/**
 * Generate predictions for all timeframes
 */
export function generateAllPredictions(
  metal: 'gold' | 'silver',
  historicalData: HistoricalPrice[],
  currentPrice: number,
  ratio: GoldSilverRatio
): Record<PredictionTimeframe, Prediction> {
  return {
    '1d': generatePrediction(metal, historicalData, currentPrice, ratio, '1d'),
    '7d': generatePrediction(metal, historicalData, currentPrice, ratio, '7d'),
    '30d': generatePrediction(metal, historicalData, currentPrice, ratio, '30d'),
  };
}
