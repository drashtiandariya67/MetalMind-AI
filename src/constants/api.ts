// MetalMind AI — API Configuration

export const API_CONFIG = {
  // GoldAPI.io (Primary)
  goldApi: {
    baseUrl: 'https://www.goldapi.io/api',
    key: process.env.EXPO_PUBLIC_GOLD_API_KEY || '',
  },

  // Metals.dev (Fallback)
  metalsDev: {
    baseUrl: 'https://api.metals.dev/v1',
    key: process.env.EXPO_PUBLIC_METALS_DEV_KEY || '',
  },

  // Telegram Bot
  telegram: {
    baseUrl: 'https://api.telegram.org/bot',
    botToken: process.env.EXPO_PUBLIC_TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.EXPO_PUBLIC_TELEGRAM_CHAT_ID || '',
  },

  // News RSS Feeds
  newsFeeds: [
    { name: 'Kitco Gold', url: 'https://www.kitco.com/rss/gold.xml', category: 'gold' },
    { name: 'Kitco Silver', url: 'https://www.kitco.com/rss/silver.xml', category: 'silver' },
  ],
} as const;

// Refresh intervals (milliseconds)
export const REFRESH_INTERVALS = {
  prices: 5 * 60 * 1000,         // 5 minutes
  predictions: 15 * 60 * 1000,    // 15 minutes
  news: 30 * 60 * 1000,           // 30 minutes
  alerts: 5 * 60 * 1000,          // 5 minutes
  portfolio: 5 * 60 * 1000,       // 5 minutes
} as const;

// Cache TTLs (milliseconds)
export const CACHE_TTL = {
  prices: 60 * 1000,              // 1 minute
  historical: 5 * 60 * 1000,      // 5 minutes
  news: 15 * 60 * 1000,           // 15 minutes
  predictions: 10 * 60 * 1000,    // 10 minutes
} as const;
