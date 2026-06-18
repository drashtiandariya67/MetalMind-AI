// MetalMind AI — Portfolio Types

import { MetalType } from './metals';

export interface Holding {
  id: string;
  metal: MetalType;
  quantity: number;           // in grams
  purchasePrice: number;      // per gram in INR
  purchaseDate: string;
  karat?: '24K' | '22K' | '18K'; // Gold karat
  notes?: string;
}

export interface HoldingWithValue extends Holding {
  currentPrice: number;
  currentValue: number;
  investedValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export interface PortfolioSummary {
  totalInvested: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
  totalROI: number;
  goldAllocation: number;     // percentage
  silverAllocation: number;   // percentage
  goldValue: number;
  silverValue: number;
  holdings: HoldingWithValue[];
}
