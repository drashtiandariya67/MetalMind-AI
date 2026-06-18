// MetalMind AI — Calculation Utilities

import {
  PURITY_RATIOS,
  MAKING_CHARGES,
  GST_RATE,
  GST_ON_MAKING,
  TROY_OUNCE_TO_GRAMS,
  USD_TO_INR_FALLBACK,
  RATIO_HISTORY,
} from '@/constants/metals';
import type { GoldSilverRatio, KaratType } from '@/types/metals';

/**
 * Convert price per troy ounce (USD) to price per gram (INR)
 */
export function ouncePriceToGramINR(pricePerOunce: number, usdToInr: number = USD_TO_INR_FALLBACK): number {
  const pricePerGramUSD = pricePerOunce / TROY_OUNCE_TO_GRAMS;
  return pricePerGramUSD * usdToInr;
}

/**
 * Convert price per troy ounce (USD) to price per gram (USD)
 */
export function ouncePriceToGramUSD(pricePerOunce: number): number {
  return pricePerOunce / TROY_OUNCE_TO_GRAMS;
}

/**
 * Calculate karat price from 24K (pure) price per gram
 */
export function calculateKaratPrice(pureGoldPricePerGram: number, karat: KaratType): number {
  return pureGoldPricePerGram * PURITY_RATIOS[karat];
}

/**
 * Calculate price with Indian market making charges + GST
 */
export function calculatePriceWithCharges(
  metalPricePerGram: number,
  karat: KaratType = '24K'
): number {
  const makingChargeRate = MAKING_CHARGES[karat];
  const makingCharges = metalPricePerGram * makingChargeRate;
  const gstOnMetal = metalPricePerGram * GST_RATE;
  const gstOnMaking = makingCharges * GST_ON_MAKING;
  return metalPricePerGram + makingCharges + gstOnMetal + gstOnMaking;
}

/**
 * Calculate all karat prices
 */
export function calculateAllKaratPrices(pricePerGram24K: number): Record<KaratType, { pure: number; withCharges: number }> {
  return {
    '24K': {
      pure: pricePerGram24K,
      withCharges: calculatePriceWithCharges(pricePerGram24K, '24K'),
    },
    '22K': {
      pure: calculateKaratPrice(pricePerGram24K, '22K'),
      withCharges: calculatePriceWithCharges(calculateKaratPrice(pricePerGram24K, '22K'), '22K'),
    },
    '18K': {
      pure: calculateKaratPrice(pricePerGram24K, '18K'),
      withCharges: calculatePriceWithCharges(calculateKaratPrice(pricePerGram24K, '18K'), '18K'),
    },
  };
}

/**
 * Calculate Gold-Silver ratio and interpretation
 */
export function calculateGoldSilverRatio(goldPrice: number, silverPrice: number): GoldSilverRatio {
  const current = goldPrice / silverPrice;
  const percentFromAvg = ((current - RATIO_HISTORY.historicalAverage) / RATIO_HISTORY.historicalAverage) * 100;

  let interpretation: string;
  let silverValuation: 'undervalued' | 'overvalued' | 'fair';

  if (current > RATIO_HISTORY.normalRange.high) {
    silverValuation = 'undervalued';
    interpretation = `Current ratio is ${current.toFixed(1)}. Silver appears undervalued compared to historical average of ${RATIO_HISTORY.historicalAverage}. Consider accumulating silver.`;
  } else if (current < RATIO_HISTORY.normalRange.low) {
    silverValuation = 'overvalued';
    interpretation = `Current ratio is ${current.toFixed(1)}. Silver appears overvalued relative to gold. Historical average is ${RATIO_HISTORY.historicalAverage}.`;
  } else {
    silverValuation = 'fair';
    interpretation = `Current ratio is ${current.toFixed(1)}, within normal range (${RATIO_HISTORY.normalRange.low}-${RATIO_HISTORY.normalRange.high}). Both metals fairly valued relative to each other.`;
  }

  return {
    current,
    historicalAverage: RATIO_HISTORY.historicalAverage,
    interpretation,
    silverValuation,
    percentFromAverage: percentFromAvg,
  };
}

/**
 * Determine trend direction based on price changes
 */
export function determineTrend(dailyChangePct: number, weeklyChangePct: number): 'bullish' | 'bearish' | 'neutral' {
  const score = (dailyChangePct * 0.6) + (weeklyChangePct * 0.4);
  if (score > 0.3) return 'bullish';
  if (score < -0.3) return 'bearish';
  return 'neutral';
}

/**
 * Calculate percentage change
 */
export function percentChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Calculate simple moving average
 */
export function simpleSMA(values: number[], period: number): number {
  if (values.length < period) return values[values.length - 1] || 0;
  const slice = values.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

/**
 * Calculate exponential moving average
 */
export function simpleEMA(values: number[], period: number): number {
  if (values.length === 0) return 0;
  const k = 2 / (period + 1);
  let ema = values[0];
  for (let i = 1; i < values.length; i++) {
    ema = values[i] * k + ema * (1 - k);
  }
  return ema;
}
