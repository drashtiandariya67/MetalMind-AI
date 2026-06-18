// MetalMind AI — Alert Types

import { MetalType } from './metals';

export type AlertType =
  | 'price_above'
  | 'price_below'
  | 'pct_increase'
  | 'pct_decrease'
  | 'daily_high'
  | 'weekly_high'
  | 'monthly_high'
  | 'trend_change'
  | 'ai_buy_signal'
  | 'ai_sell_signal';

export type NotificationChannel = 'push' | 'telegram';

export interface Alert {
  id: string;
  metal: MetalType;
  type: AlertType;
  threshold: number;            // Price or percentage
  enabled: boolean;
  channels: NotificationChannel[];
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
  label?: string;               // User-defined label
}

export interface AlertTrigger {
  alertId: string;
  metal: MetalType;
  type: AlertType;
  triggeredAt: string;
  currentPrice: number;
  threshold: number;
  message: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  channels: NotificationChannel[];
}

export const ALERT_TYPE_CONFIG: Record<AlertType, {
  label: string;
  emoji: string;
  description: string;
  needsThreshold: boolean;
  thresholdUnit: 'price' | 'percent' | 'none';
}> = {
  price_above: {
    label: 'Price Above',
    emoji: '📈',
    description: 'Notify when price goes above threshold',
    needsThreshold: true,
    thresholdUnit: 'price',
  },
  price_below: {
    label: 'Price Below',
    emoji: '📉',
    description: 'Notify when price drops below threshold',
    needsThreshold: true,
    thresholdUnit: 'price',
  },
  pct_increase: {
    label: '% Increase',
    emoji: '🔼',
    description: 'Notify on percentage increase',
    needsThreshold: true,
    thresholdUnit: 'percent',
  },
  pct_decrease: {
    label: '% Decrease',
    emoji: '🔽',
    description: 'Notify on percentage decrease',
    needsThreshold: true,
    thresholdUnit: 'percent',
  },
  daily_high: {
    label: 'Daily High',
    emoji: '⬆️',
    description: 'Notify on new daily high',
    needsThreshold: false,
    thresholdUnit: 'none',
  },
  weekly_high: {
    label: 'Weekly High',
    emoji: '🏔️',
    description: 'Notify on new weekly high',
    needsThreshold: false,
    thresholdUnit: 'none',
  },
  monthly_high: {
    label: 'Monthly High',
    emoji: '🗻',
    description: 'Notify on new monthly high',
    needsThreshold: false,
    thresholdUnit: 'none',
  },
  trend_change: {
    label: 'Trend Change',
    emoji: '🔄',
    description: 'Notify when trend direction changes',
    needsThreshold: false,
    thresholdUnit: 'none',
  },
  ai_buy_signal: {
    label: 'AI Buy Signal',
    emoji: '🤖📈',
    description: 'Notify on AI-generated buy signal',
    needsThreshold: false,
    thresholdUnit: 'none',
  },
  ai_sell_signal: {
    label: 'AI Sell Signal',
    emoji: '🤖📉',
    description: 'Notify on AI-generated sell signal',
    needsThreshold: false,
    thresholdUnit: 'none',
  },
};
