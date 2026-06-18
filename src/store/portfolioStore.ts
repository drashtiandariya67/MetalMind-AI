// MetalMind AI — Portfolio Store (Zustand)

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Holding, HoldingWithValue, PortfolioSummary } from '@/types/portfolio';

const PORTFOLIO_STORAGE_KEY = 'metalmind_portfolio';

interface PortfolioState {
  holdings: Holding[];
  isLoading: boolean;

  // Actions
  addHolding: (holding: Holding) => void;
  removeHolding: (id: string) => void;
  updateHolding: (id: string, updates: Partial<Holding>) => void;
  loadHoldings: () => Promise<void>;
  saveHoldings: () => Promise<void>;
  setHoldings: (holdings: Holding[]) => void;

  // Computed
  calculateSummary: (goldPricePerGram: number, silverPricePerGram: number) => PortfolioSummary;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  holdings: [],
  isLoading: false,

  addHolding: (holding) => {
    set((state) => ({ holdings: [...state.holdings, holding] }));
    get().saveHoldings();
  },

  removeHolding: (id) => {
    set((state) => ({ holdings: state.holdings.filter((h) => h.id !== id) }));
    get().saveHoldings();
  },

  updateHolding: (id, updates) => {
    set((state) => ({
      holdings: state.holdings.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    }));
    get().saveHoldings();
  },

  setHoldings: (holdings) => set({ holdings }),

  loadHoldings: async () => {
    try {
      const stored = await AsyncStorage.getItem(PORTFOLIO_STORAGE_KEY);
      if (stored) {
        set({ holdings: JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    }
  },

  saveHoldings: async () => {
    try {
      await AsyncStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(get().holdings));
    } catch (error) {
      console.error('Failed to save portfolio:', error);
    }
  },

  calculateSummary: (goldPricePerGram: number, silverPricePerGram: number): PortfolioSummary => {
    const holdings = get().holdings;
    const holdingsWithValue: HoldingWithValue[] = holdings.map((h) => {
      const currentPrice = h.metal === 'gold' ? goldPricePerGram : silverPricePerGram;
      const currentValue = h.quantity * currentPrice;
      const investedValue = h.quantity * h.purchasePrice;
      const profitLoss = currentValue - investedValue;
      const profitLossPercent = investedValue > 0 ? (profitLoss / investedValue) * 100 : 0;

      return { ...h, currentPrice, currentValue, investedValue, profitLoss, profitLossPercent };
    });

    const totalInvested = holdingsWithValue.reduce((s, h) => s + h.investedValue, 0);
    const totalCurrentValue = holdingsWithValue.reduce((s, h) => s + h.currentValue, 0);
    const totalProfitLoss = totalCurrentValue - totalInvested;
    const totalROI = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    const goldValue = holdingsWithValue.filter((h) => h.metal === 'gold').reduce((s, h) => s + h.currentValue, 0);
    const silverValue = holdingsWithValue.filter((h) => h.metal === 'silver').reduce((s, h) => s + h.currentValue, 0);
    const totalValue = goldValue + silverValue;

    return {
      totalInvested,
      totalCurrentValue,
      totalProfitLoss,
      totalROI,
      goldAllocation: totalValue > 0 ? (goldValue / totalValue) * 100 : 0,
      silverAllocation: totalValue > 0 ? (silverValue / totalValue) * 100 : 0,
      goldValue,
      silverValue,
      holdings: holdingsWithValue,
    };
  },
}));
