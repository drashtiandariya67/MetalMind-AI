// MetalMind AI — Metal & Price Types

export type MetalType = 'gold' | 'silver';
export type TrendDirection = 'bullish' | 'bearish' | 'neutral';
export type KaratType = '24K' | '22K' | '18K';

export interface MetalPrice {
  metal: MetalType;
  pricePerOunceUSD: number;
  pricePerGramUSD: number;
  pricePerGramINR: number;
  pricePerOunceINR: number;
  
  // Karat prices (Gold only, in INR per gram)
  price24K?: number;
  price22K?: number;
  price18K?: number;
  
  // With making charges + GST (Indian market)
  price24KWithCharges?: number;
  price22KWithCharges?: number;
  price18KWithCharges?: number;
  
  // Changes
  dailyChange: number;
  dailyChangePercent: number;
  weeklyChangePercent: number;
  monthlyChangePercent: number;
  
  // Trend
  trend: TrendDirection;
  
  // Metadata
  lastUpdated: string;
  source: string;
}

export interface HistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface PriceDataPoint {
  value: number;
  date: string;
  label?: string;
}

export interface GoldSilverRatio {
  current: number;
  historicalAverage: number;
  interpretation: string;
  silverValuation: 'undervalued' | 'overvalued' | 'fair';
  percentFromAverage: number;
}

export interface ExchangeRate {
  usdToInr: number;
  lastUpdated: string;
}

export interface MarketSummary {
  gold: MetalPrice;
  silver: MetalPrice;
  ratio: GoldSilverRatio;
  lastUpdated: string;
}
