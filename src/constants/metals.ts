// MetalMind AI — Metal Constants & Configurations

export const PURITY_RATIOS = {
  '24K': 0.999,
  '22K': 0.9166,
  '18K': 0.750,
  '14K': 0.5833,
} as const;

// Indian market making charges (percentage of metal value)
export const MAKING_CHARGES = {
  '24K': 0.08,   // 8% - coins/bars
  '22K': 0.12,   // 12% - standard jewelry
  '18K': 0.18,   // 18% - designer jewelry
} as const;

// GST rate on gold jewelry in India
export const GST_RATE = 0.03; // 3%

// GST rate on making charges
export const GST_ON_MAKING = 0.05; // 5% on making charges

export interface MetalConfig {
  id: string;
  name: string;
  symbol: string;
  emoji: string;
  apiSymbol: string;
  decimalPlaces: number;
  unit: string;
  dipThreshold: number; // % drop to trigger dip alert
  color: string;
  gradientColors: [string, string];
}

export const METALS: Record<string, MetalConfig> = {
  gold: {
    id: 'gold',
    name: 'Gold',
    symbol: 'XAU',
    emoji: '🥇',
    apiSymbol: 'XAU',
    decimalPlaces: 2,
    unit: 'oz',
    dipThreshold: 2,
    color: '#FFD700',
    gradientColors: ['#FFD700', '#FFA500'],
  },
  silver: {
    id: 'silver',
    name: 'Silver',
    symbol: 'XAG',
    emoji: '🥈',
    apiSymbol: 'XAG',
    decimalPlaces: 2,
    unit: 'oz',
    dipThreshold: 3,
    color: '#C0C0C0',
    gradientColors: ['#E8E8E8', '#A0A0A0'],
  },
};

// Gold-Silver ratio historical data
export const RATIO_HISTORY = {
  historicalAverage: 65,     // Long-term average
  recentAverage: 80,         // 5-year average
  allTimeHigh: 126.43,       // March 2020
  allTimeLow: 14,            // ~1980
  normalRange: { low: 60, high: 80 },
} as const;

// Conversion constants
export const TROY_OUNCE_TO_GRAMS = 31.1035;
export const USD_TO_INR_FALLBACK = 83.5; // Fallback rate if API fails

// Timeframes for charts and analysis
export const TIMEFRAMES = [
  { key: '1D', label: '1 Day', days: 1 },
  { key: '7D', label: '7 Days', days: 7 },
  { key: '30D', label: '30 Days', days: 30 },
  { key: '90D', label: '90 Days', days: 90 },
  { key: '1Y', label: '1 Year', days: 365 },
  { key: '5Y', label: '5 Years', days: 1825 },
] as const;

// Technical Indicator Periods
export const INDICATOR_PERIODS = {
  RSI: 14,
  MACD_FAST: 12,
  MACD_SLOW: 26,
  MACD_SIGNAL: 9,
  EMA_SHORT: 9,
  EMA_MEDIUM: 20,
  EMA_LONG: 50,
  EMA_EXTRA_LONG: 200,
  SMA_SHORT: 20,
  SMA_MEDIUM: 50,
  SMA_LONG: 200,
  BOLLINGER_PERIOD: 20,
  BOLLINGER_STD_DEV: 2,
  ATR_PERIOD: 14,
} as const;
