// MetalMind AI — News Intelligence Screen

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { NewsArticle, NewsCategory, NewsImpact } from '@/types/news';

// Simulated news data (in production, fetch from RSS/API)
export function generateMockNews(): NewsArticle[] {
  const articles: NewsArticle[] = [
    {
      id: '1',
      title: 'Indian Gold Prices Steady Amid US Fed Uncertainty',
      summary: 'Gold prices in India are trading in a steady to marginally lower range today, with 24K gold hovering around ₹1,51,100 per 10 grams. The market is reacting to uncertainty regarding the US Federal Reserve monetary policy and shifting investor sentiment.',
      source: 'Economic Times',
      url: 'https://economictimes.indiatimes.com',
      publishedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
      category: 'gold',
      impact: 'neutral',
      importanceScore: 8,
      aiAnalysis: 'Rangebound prices indicate market hesitation. The lack of clear direction from the Fed is keeping investors cautious, resulting in sideways movement. Impact Score: 8/10.',
    },
    {
      id: '2',
      title: 'Domestic Silver Declines to ₹2.6L per Kg',
      summary: 'Domestic silver prices have seen a decline today, dropping approximately ₹5,000 per kg in the retail market to hover around ₹2,60,000 per kilogram. The US Federal Reserve\'s decision to hold interest rates steady has pressured dollar-priced metals.',
      source: 'Upstox',
      url: 'https://upstox.com',
      publishedAt: new Date(Date.now() - 4 * 3600_000).toISOString(),
      category: 'silver',
      impact: 'bearish',
      importanceScore: 9,
      aiAnalysis: 'A strengthening US dollar and steady rates are creating strong headwinds for Silver in the short term. The ₹5,000 drop represents a significant correction. Impact Score: 9/10.',
    },
    {
      id: '3',
      title: 'Import Duty Keeps Indian Gold Elevated',
      summary: 'Despite global price corrections, domestic gold prices remain historically elevated compared to earlier in the year, largely due to the structural impact of the mid-May import duty hike and INR depreciation.',
      source: 'World Gold Council',
      url: 'https://gold.org',
      publishedAt: new Date(Date.now() - 8 * 3600_000).toISOString(),
      category: 'central_bank',
      impact: 'bullish',
      importanceScore: 7,
      aiAnalysis: 'Structural premiums (taxes/duties) provide a high floor for domestic prices regardless of international spot price weakness. Impact Score: 7/10.',
    },
    {
      id: '4',
      title: 'Massive Arbitrage: Dubai Gold ₹18K Cheaper Than India',
      summary: 'Data highlights a significant price gap between domestic Indian rates and international markets like Dubai, where gold is currently trading approximately ₹15,000–₹18,500 cheaper per 10 grams (excluding import duties and taxes).',
      source: 'Elite Wealth',
      url: 'https://elitewealth.in',
      publishedAt: new Date(Date.now() - 12 * 3600_000).toISOString(),
      category: 'gold',
      impact: 'bearish',
      importanceScore: 6,
      aiAnalysis: 'Extreme price disparities often lead to increased grey market activity or reduced domestic demand as buyers defer purchases. Impact Score: 6/10.',
    },
  ];
  return articles;
}

const CATEGORIES: { key: NewsCategory | 'all'; label: string; emoji: string }[] = [
  { key: 'all', label: 'All', emoji: '📰' },
  { key: 'gold', label: 'Gold', emoji: '🥇' },
  { key: 'silver', label: 'Silver', emoji: '🥈' },
  { key: 'inflation', label: 'Inflation', emoji: '📊' },
  { key: 'central_bank', label: 'Central Bank', emoji: '🏦' },
  { key: 'interest_rates', label: 'Rates', emoji: '📈' },
];

export default function NewsScreen() {
  const router = useRouter();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    setTimeout(() => {
      setNews(generateMockNews());
      setLoading(false);
    }, 500);
  }, []);

  const filtered = selectedCategory === 'all'
    ? news
    : news.filter(n => n.category === selectedCategory);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>📰 News Intelligence</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Back</Text>
          </Pressable>
        </View>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {CATEGORIES.map(cat => (
            <Pressable
              key={cat.key}
              style={[styles.filterChip, selectedCategory === cat.key && styles.filterChipActive]}
              onPress={() => setSelectedCategory(cat.key)}
            >
              <Text style={styles.filterEmoji}>{cat.emoji}</Text>
              <Text style={[styles.filterText, selectedCategory === cat.key && styles.filterTextActive]}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {loading ? (
          <LoadingSpinner />
        ) : (
          filtered.map(article => (
            <NewsCard key={article.id} article={article} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function NewsCard({ article }: { article: NewsArticle }) {
  const impactConfig = {
    bullish: { color: Colors.bullish, label: '📈 Bullish', bg: Colors.bullishBg },
    bearish: { color: Colors.bearish, label: '📉 Bearish', bg: Colors.bearishBg },
    neutral: { color: Colors.neutral, label: '➡️ Neutral', bg: Colors.neutralBg },
  };
  const impact = impactConfig[article.impact];
  const timeAgo = getTimeAgo(article.publishedAt);

  return (
    <Pressable onPress={() => Linking.openURL(article.url)}>
      <GlassCard>
        <View style={styles.newsHeader}>
          <View style={[styles.impactBadge, { backgroundColor: impact.bg }]}>
            <Text style={[styles.impactText, { color: impact.color }]}>{impact.label}</Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{article.importanceScore}/10</Text>
          </View>
        </View>
        <Text style={styles.newsTitle}>{article.title}</Text>
        <Text style={styles.newsSummary}>{article.summary}</Text>
        <View style={styles.aiBox}>
          <Text style={styles.aiLabel}>🤖 AI Analysis</Text>
          <Text style={styles.aiText}>{article.aiAnalysis}</Text>
        </View>
        <View style={styles.newsFooter}>
          <Text style={styles.newsSource}>{article.source}</Text>
          <Text style={styles.newsTime}>{timeAgo}</Text>
        </View>
      </GlassCard>
    </Pressable>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600_000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: Spacing.base, gap: Spacing.base, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: Typography.sizes['2xl'], fontFamily: Typography.fonts.bold, color: Colors.textPrimary },
  backBtn: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.medium, color: Colors.gold },
  filterRow: { marginBottom: Spacing.sm },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, backgroundColor: Colors.glass,
    borderWidth: 1, borderColor: Colors.glassBorder, marginRight: Spacing.sm,
  },
  filterChipActive: { backgroundColor: Colors.goldMuted, borderColor: Colors.gold + '40' },
  filterEmoji: { fontSize: 14 },
  filterText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.medium, color: Colors.textTertiary },
  filterTextActive: { color: Colors.gold },

  newsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  impactBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full },
  impactText: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.semiBold },
  scoreBadge: { backgroundColor: Colors.glass, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.glassBorder },
  scoreText: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bold, color: Colors.gold },
  newsTitle: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  newsSummary: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.regular, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.md },
  aiBox: { backgroundColor: Colors.glass, borderRadius: BorderRadius.sm, padding: Spacing.md, borderWidth: 1, borderColor: Colors.glassBorder, marginBottom: Spacing.md },
  aiLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bold, color: Colors.gold, marginBottom: 4 },
  aiText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.regular, color: Colors.textSecondary, lineHeight: 18 },
  newsFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  newsSource: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.medium, color: Colors.textTertiary },
  newsTime: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.regular, color: Colors.textMuted },
});
