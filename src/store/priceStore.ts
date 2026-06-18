// MetalMind AI — Price Store (Zustand)

import { create } from 'zustand';
import type { MarketSummary, HistoricalPrice, MetalType } from '@/types/metals';

interface PriceState {
  market: MarketSummary | null;
  historicalData: Record<string, HistoricalPrice[]>; // key: "gold_30" or "silver_7"
  isLoading: boolean;
  error: string | null;
  lastFetch: number;
  
  // Actions
  setMarket: (market: MarketSummary) => void;
  setHistoricalData: (metal: MetalType, days: number, data: HistoricalPrice[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePriceStore = create<PriceState>((set) => ({
  market: null,
  historicalData: {},
  isLoading: false,
  error: null,
  lastFetch: 0,

  setMarket: (market) => set({ market, lastFetch: Date.now(), error: null }),
  setHistoricalData: (metal, days, data) =>
    set((state) => ({
      historicalData: { ...state.historicalData, [`${metal}_${days}`]: data },
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
