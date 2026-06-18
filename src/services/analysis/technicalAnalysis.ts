// MetalMind AI — Technical Analysis Service
// Calculates RSI, MACD, EMA, SMA, Bollinger Bands, ATR

import { INDICATOR_PERIODS } from '@/constants/metals';
import type { IndicatorSnapshot, IndicatorValue, MACDValue } from '@/types/predictions';

/**
 * Calculate Simple Moving Average
 */
function calculateSMA(values: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const slice = values.slice(i - period + 1, i + 1);
      result.push(slice.reduce((a, b) => a + b, 0) / period);
    }
  }
  return result;
}

/**
 * Calculate Exponential Moving Average
 */
function calculateEMA(values: number[], period: number): number[] {
  const result: number[] = [];
  const k = 2 / (period + 1);

  if (values.length === 0) return [];

  // Start with SMA for first value
  let sum = 0;
  for (let i = 0; i < Math.min(period, values.length); i++) {
    sum += values[i];
    result.push(NaN);
  }
  if (result.length > 0) {
    result[result.length - 1] = sum / Math.min(period, values.length);
  }

  // Calculate EMA for rest
  for (let i = period; i < values.length; i++) {
    const ema = values[i] * k + result[i - 1] * (1 - k);
    result.push(ema);
  }

  return result;
}

/**
 * Calculate RSI (Relative Strength Index)
 */
function calculateRSI(values: number[], period: number = INDICATOR_PERIODS.RSI): number[] {
  const result: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < values.length; i++) {
    const change = values[i] - values[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  result.push(NaN); // First value has no RSI

  for (let i = 0; i < gains.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else if (i === period - 1) {
      const avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      result.push(100 - (100 / (1 + rs)));
    } else {
      const prevAvgGain = (() => {
        const prevGains = gains.slice(i - period, i);
        return prevGains.reduce((a, b) => a + b, 0) / period;
      })();
      const prevAvgLoss = (() => {
        const prevLosses = losses.slice(i - period, i);
        return prevLosses.reduce((a, b) => a + b, 0) / period;
      })();
      const smoothedGain = (prevAvgGain * (period - 1) + gains[i]) / period;
      const smoothedLoss = (prevAvgLoss * (period - 1) + losses[i]) / period;
      const rs = smoothedLoss === 0 ? 100 : smoothedGain / smoothedLoss;
      result.push(100 - (100 / (1 + rs)));
    }
  }

  return result;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
function calculateMACD(
  values: number[],
  fastPeriod: number = INDICATOR_PERIODS.MACD_FAST,
  slowPeriod: number = INDICATOR_PERIODS.MACD_SLOW,
  signalPeriod: number = INDICATOR_PERIODS.MACD_SIGNAL
): { macd: number[]; signal: number[]; histogram: number[] } {
  const fastEMA = calculateEMA(values, fastPeriod);
  const slowEMA = calculateEMA(values, slowPeriod);

  const macdLine: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (isNaN(fastEMA[i]) || isNaN(slowEMA[i])) {
      macdLine.push(NaN);
    } else {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }
  }

  const validMacd = macdLine.filter(v => !isNaN(v));
  const signalLine = calculateEMA(validMacd, signalPeriod);

  // Align signal line with macd
  const alignedSignal: number[] = [];
  let signalIdx = 0;
  for (let i = 0; i < macdLine.length; i++) {
    if (isNaN(macdLine[i])) {
      alignedSignal.push(NaN);
    } else {
      alignedSignal.push(signalIdx < signalLine.length ? signalLine[signalIdx] : NaN);
      signalIdx++;
    }
  }

  const histogram: number[] = macdLine.map((m, i) =>
    isNaN(m) || isNaN(alignedSignal[i]) ? NaN : m - alignedSignal[i]
  );

  return { macd: macdLine, signal: alignedSignal, histogram };
}

/**
 * Calculate Bollinger Bands
 */
function calculateBollingerBands(
  values: number[],
  period: number = INDICATOR_PERIODS.BOLLINGER_PERIOD,
  stdDev: number = INDICATOR_PERIODS.BOLLINGER_STD_DEV
): { upper: number[]; middle: number[]; lower: number[] } {
  const middle = calculateSMA(values, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < values.length; i++) {
    if (isNaN(middle[i])) {
      upper.push(NaN);
      lower.push(NaN);
    } else {
      const slice = values.slice(Math.max(0, i - period + 1), i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / slice.length;
      const sd = Math.sqrt(variance);
      upper.push(middle[i] + stdDev * sd);
      lower.push(middle[i] - stdDev * sd);
    }
  }

  return { upper, middle, lower };
}

/**
 * Calculate ATR (Average True Range)
 */
function calculateATR(
  highs: number[],
  lows: number[],
  closes: number[],
  period: number = INDICATOR_PERIODS.ATR_PERIOD
): number[] {
  const trueRanges: number[] = [highs[0] - lows[0]];

  for (let i = 1; i < highs.length; i++) {
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    trueRanges.push(tr);
  }

  return calculateSMA(trueRanges, period);
}

/**
 * Get the latest valid (non-NaN) value from an array
 */
function lastValid(arr: number[]): number {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (!isNaN(arr[i])) return arr[i];
  }
  return 0;
}

/**
 * Generate complete indicator snapshot from historical price data
 */
export function generateIndicatorSnapshot(
  closes: number[],
  highs: number[],
  lows: number[]
): IndicatorSnapshot {
  // RSI
  const rsiValues = calculateRSI(closes);
  const rsiCurrent = lastValid(rsiValues);
  let rsiSignal: 'overbought' | 'oversold' | 'neutral';
  let rsiDesc: string;
  if (rsiCurrent > 70) {
    rsiSignal = 'overbought';
    rsiDesc = `RSI at ${rsiCurrent.toFixed(1)} — overbought territory. Potential pullback ahead.`;
  } else if (rsiCurrent < 30) {
    rsiSignal = 'oversold';
    rsiDesc = `RSI at ${rsiCurrent.toFixed(1)} — oversold territory. Potential bounce ahead.`;
  } else {
    rsiSignal = 'neutral';
    rsiDesc = `RSI at ${rsiCurrent.toFixed(1)} — healthy momentum range.`;
  }

  // MACD
  const macdResult = calculateMACD(closes);
  const macdCurrent = lastValid(macdResult.macd);
  const signalCurrent = lastValid(macdResult.signal);
  const histCurrent = lastValid(macdResult.histogram);
  const histPrev = macdResult.histogram.length > 1
    ? lastValid(macdResult.histogram.slice(0, -1))
    : 0;
  let crossover: 'bullish' | 'bearish' | 'none' = 'none';
  if (histCurrent > 0 && histPrev <= 0) crossover = 'bullish';
  if (histCurrent < 0 && histPrev >= 0) crossover = 'bearish';

  // EMAs
  const ema9 = lastValid(calculateEMA(closes, INDICATOR_PERIODS.EMA_SHORT));
  const ema20 = lastValid(calculateEMA(closes, INDICATOR_PERIODS.EMA_MEDIUM));
  const ema50 = lastValid(calculateEMA(closes, INDICATOR_PERIODS.EMA_LONG));
  const ema200Arr = calculateEMA(closes, Math.min(INDICATOR_PERIODS.EMA_EXTRA_LONG, closes.length));
  const ema200 = lastValid(ema200Arr);

  // SMAs
  const sma20 = lastValid(calculateSMA(closes, INDICATOR_PERIODS.SMA_SHORT));
  const sma50 = lastValid(calculateSMA(closes, INDICATOR_PERIODS.SMA_MEDIUM));
  const sma200Arr = calculateSMA(closes, Math.min(INDICATOR_PERIODS.SMA_LONG, closes.length));
  const sma200 = lastValid(sma200Arr);

  // Bollinger Bands
  const bb = calculateBollingerBands(closes);
  const bollingerUpper = lastValid(bb.upper);
  const bollingerMiddle = lastValid(bb.middle);
  const bollingerLower = lastValid(bb.lower);

  // ATR
  const atrValues = calculateATR(highs, lows, closes);
  const atr = lastValid(atrValues);

  // Momentum (Rate of Change over 10 periods)
  const rocPeriod = Math.min(10, closes.length - 1);
  const momentum = closes.length > rocPeriod
    ? ((closes[closes.length - 1] - closes[closes.length - 1 - rocPeriod]) / closes[closes.length - 1 - rocPeriod]) * 100
    : 0;

  return {
    rsi: { value: rsiCurrent, signal: rsiSignal, description: rsiDesc },
    macd: { macd: macdCurrent, signal: signalCurrent, histogram: histCurrent, crossover },
    ema9,
    ema20,
    ema50,
    ema200,
    sma20,
    sma50,
    sma200,
    bollingerUpper,
    bollingerMiddle,
    bollingerLower,
    atr,
    momentum,
  };
}

// Export individual calculators for chart overlays
export {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateATR,
};
