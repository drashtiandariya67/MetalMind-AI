// MetalMind AI — Alert Store (Zustand)

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Alert, AlertTrigger } from '@/types/alerts';

const ALERTS_STORAGE_KEY = 'metalmind_alerts';

interface AlertState {
  alerts: Alert[];
  triggeredAlerts: AlertTrigger[];
  isLoading: boolean;

  // Actions
  addAlert: (alert: Alert) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
  updateAlertTriggered: (id: string) => void;
  addTriggeredAlert: (trigger: AlertTrigger) => void;
  loadAlerts: () => Promise<void>;
  saveAlerts: () => Promise<void>;
  setAlerts: (alerts: Alert[]) => void;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  triggeredAlerts: [],
  isLoading: false,

  addAlert: (alert) => {
    set((state) => ({ alerts: [...state.alerts, alert] }));
    get().saveAlerts();
  },

  removeAlert: (id) => {
    set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) }));
    get().saveAlerts();
  },

  toggleAlert: (id) => {
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, enabled: !a.enabled } : a
      ),
    }));
    get().saveAlerts();
  },

  updateAlertTriggered: (id) => {
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id
          ? { ...a, lastTriggered: new Date().toISOString(), triggerCount: a.triggerCount + 1 }
          : a
      ),
    }));
    get().saveAlerts();
  },

  addTriggeredAlert: (trigger) => {
    set((state) => ({
      triggeredAlerts: [trigger, ...state.triggeredAlerts].slice(0, 50), // Keep last 50
    }));
  },

  setAlerts: (alerts) => set({ alerts }),

  loadAlerts: async () => {
    try {
      const stored = await AsyncStorage.getItem(ALERTS_STORAGE_KEY);
      if (stored) {
        set({ alerts: JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  },

  saveAlerts: async () => {
    try {
      await AsyncStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(get().alerts));
    } catch (error) {
      console.error('Failed to save alerts:', error);
    }
  },
}));
