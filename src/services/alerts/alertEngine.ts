// MetalMind AI — Alert Engine
// Evaluates user alerts against current prices and generates notifications

import type { Alert, AlertTrigger, AlertType } from '@/types/alerts';
import type { MetalPrice } from '@/types/metals';
import type { Prediction } from '@/types/predictions';

const ALERT_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour cooldown per alert

/**
 * Evaluate all user alerts against current market data
 */
export function evaluateAlerts(
  alerts: Alert[],
  goldPrice: MetalPrice,
  silverPrice: MetalPrice,
  predictions?: { gold?: Prediction; silver?: Prediction },
  previousPrices?: { gold?: MetalPrice; silver?: MetalPrice }
): AlertTrigger[] {
  const triggers: AlertTrigger[] = [];

  for (const alert of alerts) {
    if (!alert.enabled) continue;

    // Check cooldown
    if (alert.lastTriggered) {
      const timeSinceLast = Date.now() - new Date(alert.lastTriggered).getTime();
      if (timeSinceLast < ALERT_COOLDOWN_MS) continue;
    }

    const price = alert.metal === 'gold' ? goldPrice : silverPrice;
    const prevPrice = previousPrices?.[alert.metal];
    const prediction = predictions?.[alert.metal];

    const trigger = evaluateSingleAlert(alert, price, prevPrice, prediction);
    if (trigger) triggers.push(trigger);
  }

  return triggers;
}

/**
 * Evaluate a single alert
 */
function evaluateSingleAlert(
  alert: Alert,
  price: MetalPrice,
  prevPrice?: MetalPrice,
  prediction?: Prediction
): AlertTrigger | null {
  const currentPrice = price.pricePerGramINR;
  const metalName = alert.metal === 'gold' ? 'Gold' : 'Silver';

  switch (alert.type) {
    case 'price_above':
      if (currentPrice >= alert.threshold) {
        return createTrigger(alert, currentPrice,
          `${metalName} is now ₹${currentPrice.toFixed(2)}/g — above your target of ₹${alert.threshold.toFixed(2)}/g`);
      }
      break;

    case 'price_below':
      if (currentPrice <= alert.threshold) {
        return createTrigger(alert, currentPrice,
          `${metalName} dropped to ₹${currentPrice.toFixed(2)}/g — below your target of ₹${alert.threshold.toFixed(2)}/g`);
      }
      break;

    case 'pct_increase':
      if (price.dailyChangePercent >= alert.threshold) {
        return createTrigger(alert, currentPrice,
          `${metalName} surged ${price.dailyChangePercent.toFixed(1)}% today! Currently ₹${currentPrice.toFixed(2)}/g`);
      }
      break;

    case 'pct_decrease':
      if (price.dailyChangePercent <= -alert.threshold) {
        return createTrigger(alert, currentPrice,
          `${metalName} dropped ${Math.abs(price.dailyChangePercent).toFixed(1)}% today. Potential accumulation opportunity.`);
      }
      break;

    case 'daily_high':
      if (prevPrice && currentPrice > prevPrice.pricePerGramINR) {
        return createTrigger(alert, currentPrice,
          `${metalName} hit new daily high at ₹${currentPrice.toFixed(2)}/g`);
      }
      break;

    case 'weekly_high':
      if (price.weeklyChangePercent > 0 && price.dailyChangePercent > 0.5) {
        return createTrigger(alert, currentPrice,
          `${metalName} broke weekly high. Currently ₹${currentPrice.toFixed(2)}/g (+${price.weeklyChangePercent.toFixed(1)}% this week)`);
      }
      break;

    case 'monthly_high':
      if (price.monthlyChangePercent > 0 && price.dailyChangePercent > 0.5) {
        return createTrigger(alert, currentPrice,
          `${metalName} broke monthly resistance! Currently ₹${currentPrice.toFixed(2)}/g`);
      }
      break;

    case 'trend_change':
      if (prevPrice && prevPrice.trend !== price.trend) {
        return createTrigger(alert, currentPrice,
          `${metalName} trend changed from ${prevPrice.trend} to ${price.trend}. Currently ₹${currentPrice.toFixed(2)}/g`);
      }
      break;

    case 'ai_buy_signal':
      if (prediction && ['strong_buy', 'buy'].includes(prediction.recommendation)) {
        return createTrigger(alert, currentPrice,
          `${metalName} AI Signal: BUY. Confidence ${prediction.probability}%. ${prediction.explanation}`);
      }
      break;

    case 'ai_sell_signal':
      if (prediction && ['sell', 'reduce'].includes(prediction.recommendation)) {
        return createTrigger(alert, currentPrice,
          `${metalName} AI Signal: SELL. Confidence ${prediction.probability}%. ${prediction.explanation}`);
      }
      break;
  }

  return null;
}

/**
 * Create an alert trigger
 */
function createTrigger(alert: Alert, currentPrice: number, message: string): AlertTrigger {
  return {
    alertId: alert.id,
    metal: alert.metal,
    type: alert.type,
    triggeredAt: new Date().toISOString(),
    currentPrice,
    threshold: alert.threshold,
    message,
  };
}
