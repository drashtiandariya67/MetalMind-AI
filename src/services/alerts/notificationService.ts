// MetalMind AI — Notification Service
// Push notifications + Telegram bot integration

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { API_CONFIG } from '@/constants/api';
import type { NotificationPayload, NotificationChannel } from '@/types/alerts';

// ─── Push Notification Setup ────────────────────────────────────

/**
 * Register for push notifications and get token
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Push notification permission not granted');
    return null;
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId || undefined,
    });
    return tokenData.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

/**
 * Configure notification handler
 */
export function setupNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// ─── Send Notifications ─────────────────────────────────────────

/**
 * Send a notification through specified channels
 */
export async function sendNotification(payload: NotificationPayload): Promise<void> {
  const promises: Promise<void>[] = [];

  for (const channel of payload.channels) {
    switch (channel) {
      case 'push':
        promises.push(sendLocalPushNotification(payload));
        break;
      case 'telegram':
        promises.push(sendTelegramNotification(payload));
        break;
    }
  }

  await Promise.allSettled(promises);
}

/**
 * Send local push notification
 */
async function sendLocalPushNotification(payload: NotificationPayload): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        sound: 'default',
      },
      trigger: null, // Immediate
    });
  } catch (error) {
    console.error('Failed to send push notification:', error);
  }
}

/**
 * Send Telegram notification
 */
async function sendTelegramNotification(payload: NotificationPayload): Promise<void> {
  const { botToken, chatId } = API_CONFIG.telegram;

  if (!botToken || !chatId) {
    console.warn('Telegram not configured');
    return;
  }

  try {
    const message = `*${payload.title}*\n\n${payload.body}`;
    const url = `${API_CONFIG.telegram.baseUrl}${botToken}/sendMessage`;

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }
}

// ─── Android Channel ────────────────────────────────────────────

/**
 * Set up Android notification channel
 */
export async function setupAndroidChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('metal-alerts', {
      name: 'Metal Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFD700',
    });
  }
}
