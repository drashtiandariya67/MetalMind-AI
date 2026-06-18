// MetalMind AI — Settings Store (Zustand)

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_STORAGE_KEY = 'metalmind_settings';

export type CurrencyType = 'INR' | 'USD';

interface SettingsState {
  currency: CurrencyType;
  pushNotifications: boolean;
  telegramNotifications: boolean;
  biometricLock: boolean;
  refreshInterval: number; // minutes
  telegramBotToken: string;
  telegramChatId: string;
  showMakingCharges: boolean;
  selectedStateId: string;
  
  // Actions
  setCurrency: (currency: CurrencyType) => void;
  togglePushNotifications: () => void;
  toggleTelegramNotifications: () => void;
  toggleBiometricLock: () => void;
  setRefreshInterval: (minutes: number) => void;
  setTelegramConfig: (token: string, chatId: string) => void;
  toggleMakingCharges: () => void;
  setSelectedStateId: (id: string) => void;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  currency: 'INR',
  pushNotifications: true,
  telegramNotifications: false,
  biometricLock: false,
  refreshInterval: 5,
  telegramBotToken: '',
  telegramChatId: '',
  showMakingCharges: true,
  selectedStateId: 'gujarat',

  setCurrency: (currency) => { set({ currency }); get().saveSettings(); },
  togglePushNotifications: () => { set((s) => ({ pushNotifications: !s.pushNotifications })); get().saveSettings(); },
  toggleTelegramNotifications: () => { set((s) => ({ telegramNotifications: !s.telegramNotifications })); get().saveSettings(); },
  toggleBiometricLock: () => { set((s) => ({ biometricLock: !s.biometricLock })); get().saveSettings(); },
  setRefreshInterval: (refreshInterval) => { set({ refreshInterval }); get().saveSettings(); },
  setTelegramConfig: (telegramBotToken, telegramChatId) => { set({ telegramBotToken, telegramChatId }); get().saveSettings(); },
  toggleMakingCharges: () => { set((s) => ({ showMakingCharges: !s.showMakingCharges })); get().saveSettings(); },
  setSelectedStateId: (selectedStateId) => { set({ selectedStateId }); get().saveSettings(); },

  loadSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set(parsed);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },

  saveSettings: async () => {
    try {
      const state = get();
      const settingsToSave = {
        currency: state.currency,
        pushNotifications: state.pushNotifications,
        telegramNotifications: state.telegramNotifications,
        biometricLock: state.biometricLock,
        refreshInterval: state.refreshInterval,
        telegramBotToken: state.telegramBotToken,
        telegramChatId: state.telegramChatId,
        showMakingCharges: state.showMakingCharges,
        selectedStateId: state.selectedStateId,
      };
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsToSave));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },
}));
