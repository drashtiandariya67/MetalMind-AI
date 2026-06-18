// MetalMind AI — Opportunity Detector
// Detects price dips, breakouts, and trend reversals

import type { HistoricalPrice, MetalType } from '@/types/metals';
import type { IndicatorSnapshot } from '@/types/predictions';
import { METALS } from '@/constants/metals';

export type OpportunityType = 'dip' | 'breakout' | 'reversal';
export type OpportunitySeverity = 'high' | 'medium' | 'low';

export interface Opportunity {
  id: string;
  metal: MetalType;
  type: OpportunityType;
  severity: OpportunitySeverity;
  title: string;
  description: string;
  emoji: string;
  detectedAt: string;
  currentPrice: number;
  referencePrice: number;
  percentChange: number;
}

/**
 * Detect all opportunities from current market data
 */
export function detectOpportunities(
  metal: MetalType,
  currentPrice: number,
  historicalData: HistoricalPrice[],
  indicators: IndicatorSnapshot
): Opportunity[] {
  const opportunities: Opportunity[] = [];

  // 1. Price Dip Detection
  const dipOpp = detectPriceDip(metal, currentPrice, historicalData);
  if (dipOpp) opportunities.push(dipOpp);

  // 2. Breakout Detection
  const breakoutOpp = detectBreakout(metal, currentPrice, historicalData);
  if (breakoutOpp) opportunities.push(breakoutOpp);

  // 3. Trend Reversal Detection
  const reversalOpp = detectTrendReversal(metal, currentPrice, indicators);
  if (reversalOpp) opportunities.push(reversalOpp);

  return opportunities;
}

/**
 * Detect price dip opportunities
 */
function detectPriceDip(
  metal: MetalType,
  currentPrice: number,
  historicalData: HistoricalPrice[]
): Opportunity | null {
  if (historicalData.length < 2) return null;

  const threshold = METALS[metal].dipThreshold;
  const recentHigh = Math.max(...historicalData.slice(-7).map(d => d.high));
  const dropPercent = ((recentHigh - currentPrice) / recentHigh) * 100;

  if (dropPercent >= threshold) {
    const metalName = METALS[metal].name;
    return {
      id: `dip_${metal}_${Date.now()}`,
      metal,
      type: 'dip',
      severity: dropPercent >= threshold * 2 ? 'high' : dropPercent >= threshold * 1.5 ? 'medium' : 'low',
      title: `${metalName} Price Dip`,
      description: `${metalName} dropped ${dropPercent.toFixed(1)}% from recent high. Potential accumulation opportunity.`,
      emoji: '📉💰',
      detectedAt: new Date().toISOString(),
      currentPrice,
      referencePrice: recentHigh,
      percentChange: -dropPercent,
    };
  }

  return null;
}

/**
 * Detect breakout opportunities
 */
function detectBreakout(
  metal: MetalType,
  currentPrice: number,
  historicalData: HistoricalPrice[]
): Opportunity | null {
  if (historicalData.length < 7) return null;

  const metalName = METALS[metal].name;

  // Check weekly high breakout
  const weeklyHigh = Math.max(...historicalData.slice(-7).map(d => d.high));
  if (currentPrice > weeklyHigh) {
    return {
      id: `breakout_weekly_${metal}_${Date.now()}`,
      metal,
      type: 'breakout',
      severity: 'medium',
      title: `${metalName} Weekly Breakout`,
      description: `${metalName} broke above weekly high of ₹${weeklyHigh.toFixed(2)}/g. Significant momentum increase.`,
      emoji: '🚀',
      detectedAt: new Date().toISOString(),
      currentPrice,
      referencePrice: weeklyHigh,
      percentChange: ((currentPrice - weeklyHigh) / weeklyHigh) * 100,
    };
  }

  // Check monthly high breakout
  if (historicalData.length >= 30) {
    const monthlyHigh = Math.max(...historicalData.slice(-30).map(d => d.high));
    if (currentPrice > monthlyHigh) {
      return {
        id: `breakout_monthly_${metal}_${Date.now()}`,
        metal,
        type: 'breakout',
        severity: 'high',
        title: `${metalName} Monthly Breakout`,
        description: `${metalName} broke monthly resistance at ₹${monthlyHigh.toFixed(2)}/g!`,
        emoji: '🏔️🚀',
        detectedAt: new Date().toISOString(),
        currentPrice,
        referencePrice: monthlyHigh,
        percentChange: ((currentPrice - monthlyHigh) / monthlyHigh) * 100,
      };
    }
  }

  return null;
}

/**
 * Detect trend reversal opportunities
 */
function detectTrendReversal(
  metal: MetalType,
  currentPrice: number,
  indicators: IndicatorSnapshot
): Opportunity | null {
  const metalName = METALS[metal].name;

  // MACD crossover + EMA crossover confirmation
  if (indicators.macd.crossover === 'bullish' && currentPrice > indicators.ema20) {
    return {
      id: `reversal_bullish_${metal}_${Date.now()}`,
      metal,
      type: 'reversal',
      severity: 'high',
      title: `${metalName} Bullish Reversal`,
      description: `${metalName} showing bullish reversal — MACD crossover confirmed with price above EMA 20. Bearish trend may be ending.`,
      emoji: '🔄📈',
      detectedAt: new Date().toISOString(),
      currentPrice,
      referencePrice: indicators.ema20,
      percentChange: ((currentPrice - indicators.ema20) / indicators.ema20) * 100,
    };
  }

  if (indicators.macd.crossover === 'bearish' && currentPrice < indicators.ema20) {
    return {
      id: `reversal_bearish_${metal}_${Date.now()}`,
      metal,
      type: 'reversal',
      severity: 'high',
      title: `${metalName} Bearish Reversal`,
      description: `${metalName} showing bearish reversal — MACD crossover with price below EMA 20. Bullish trend may be ending.`,
      emoji: '🔄📉',
      detectedAt: new Date().toISOString(),
      currentPrice,
      referencePrice: indicators.ema20,
      percentChange: ((currentPrice - indicators.ema20) / indicators.ema20) * 100,
    };
  }

  return null;
}
