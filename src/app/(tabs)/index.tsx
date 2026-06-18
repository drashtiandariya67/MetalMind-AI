// MetalMind AI — Dashboard Screen (Home Tab)
// Market overview with prices, trends, ratio, and AI insights

import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Gradients } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { TrendBadge } from '@/components/ui/TrendBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { usePriceStore } from '@/store/priceStore';
import { useSettingsStore } from '@/store/settingsStore';
import { fetchCurrentPrices, fetchHistoricalPrices } from '@/services/api/priceService';
import { generateAllPredictions } from '@/services/analysis/predictionEngine';
import { detectOpportunities } from '@/services/analysis/opportunityDetector';
import { generateIndicatorSnapshot } from '@/services/analysis/technicalAnalysis';
import { formatPrice, formatPercent, formatRelativeTime } from '@/utils/formatters';
import { REGIONAL_DATA } from '@/constants/regionalData';
import { StatePickerModal } from '@/components/ui/StatePickerModal';
import { generateMockNews } from '@/app/news';
import type { MetalPrice, MarketSummary } from '@/types/metals';
import type { Prediction } from '@/types/predictions';
import type { Opportunity } from '@/services/analysis/opportunityDetector';

export default function DashboardScreen() {
  const router = useRouter();
  const { market, setMarket, isLoading, setLoading } = usePriceStore();
  const { currency, showMakingCharges, selectedStateId, setSelectedStateId } = useSettingsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [predictions, setPredictions] = useState<{ gold?: Prediction; silver?: Prediction }>({});
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isStatePickerVisible, setStatePickerVisible] = useState(false);
  const [liveNews, setLiveNews] = useState(generateMockNews().slice(0, 2));

  const regionData = REGIONAL_DATA[selectedStateId] || REGIONAL_DATA['gujarat'];
  
  const baseGold1g = market?.gold.pricePerGramINR || 0;
  const base22K1g = market?.gold.price22K || 0;
  
  const regionMonthHigh = (baseGold1g * 10) * regionData.monthHighMultiplier;
  const regionMonthLow = (baseGold1g * 10) * regionData.monthLowMultiplier;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCurrentPrices();
      setMarket(data);

      // Generate predictions in background
      const [goldHistory, silverHistory] = await Promise.all([
        fetchHistoricalPrices('gold', 90),
        fetchHistoricalPrices('silver', 90),
      ]);

      const goldPred = generateAllPredictions('gold', goldHistory, data.gold.pricePerGramINR, data.ratio);
      const silverPred = generateAllPredictions('silver', silverHistory, data.silver.pricePerGramINR, data.ratio);
      setPredictions({ gold: goldPred['1d'], silver: silverPred['1d'] });

      // Detect opportunities
      const goldIndicators = generateIndicatorSnapshot(
        goldHistory.map(d => d.close),
        goldHistory.map(d => d.high),
        goldHistory.map(d => d.low)
      );
      const goldOpps = detectOpportunities('gold', data.gold.pricePerGramINR, goldHistory, goldIndicators);
      const silverIndicators = generateIndicatorSnapshot(
        silverHistory.map(d => d.close),
        silverHistory.map(d => d.high),
        silverHistory.map(d => d.low)
      );
      const silverOpps = detectOpportunities('silver', data.silver.pricePerGramINR, silverHistory, silverIndicators);
      setOpportunities([...goldOpps, ...silverOpps]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [setMarket, setLoading]);

  useEffect(() => {
    loadData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (!market && isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size={50} />
          <Text style={styles.loadingText}>Fetching market data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.gold}
            colors={[Colors.gold]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>MetalMind AI</Text>
            <Pressable onPress={() => setStatePickerVisible(true)} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Text style={styles.subtitle}>📍 {regionData.name}</Text>
              <Text style={{ color: Colors.gold, fontSize: 12, marginLeft: 4 }}>▼</Text>
            </Pressable>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={() => router.push('/assistant')} style={styles.headerBtn}>
              <Text style={styles.headerBtnText}>🤖</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/news')} style={styles.headerBtn}>
              <Text style={styles.headerBtnText}>📰</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/settings')} style={styles.headerBtn}>
              <Text style={styles.headerBtnText}>⚙️</Text>
            </Pressable>
          </View>
        </View>

        {/* Regional Detailed Widget */}
        <View style={styles.rwContainer}>
          <View style={styles.rwHeader}>
            <View style={styles.rwPill}>
              <Text style={styles.rwPillText}>{regionData.name} · {regionData.primaryCity}</Text>
            </View>
            <Text style={styles.rwHeaderText}>24K gold · Live</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rwMetricsRow}>
            <View style={styles.rwMetricCard}>
              <Text style={styles.rwMetricTitle}>Today - {regionData.primaryCity}</Text>
              <Text style={[styles.rwMetricValue, { color: Colors.textPrimary }]}>{formatPrice((baseGold1g * 10) * regionData.cities[0].premiumMultiplier, 'INR')}</Text>
              <Text style={styles.rwMetricSub}>{formatPrice(baseGold1g * regionData.cities[0].premiumMultiplier, 'INR')}/gram - 24K</Text>
            </View>

            <View style={styles.rwMetricCard}>
              <Text style={styles.rwMetricTitle}>Month open</Text>
              <Text style={[styles.rwMetricValue, { color: '#2196F3' }]}>{formatPrice(regionMonthHigh, 'INR')}</Text>
              <Text style={styles.rwMetricSub}>Month high</Text>
            </View>

            <View style={styles.rwMetricCard}>
              <Text style={styles.rwMetricTitle}>Month low</Text>
              <Text style={[styles.rwMetricValue, { color: '#FF5252' }]}>{formatPrice(regionMonthLow, 'INR')}</Text>
              <Text style={styles.rwMetricSub}>Best buy point</Text>
            </View>

            <View style={styles.rwMetricCard}>
              <Text style={styles.rwMetricTitle}>Month drop</Text>
              <Text style={[styles.rwMetricValue, { color: '#FF5252' }]}>{regionData.monthDropPct}</Text>
              <Text style={styles.rwMetricSub}>High → low</Text>
            </View>
          </ScrollView>
        </View>

        {/* Region Hub Section */}
        <Text style={styles.sectionTitle}>{regionData.name} cities · 24K per 10g</Text>
        <View style={styles.cityGrid}>
          {regionData.cities.map((city, idx) => (
            <View key={idx} style={styles.cityCard}>
              <Text style={styles.cityLabel}>{city.name}</Text>
              <Text style={styles.cityPrice}>{formatPrice((baseGold1g * 10) * city.premiumMultiplier, 'INR')}</Text>
              <Text style={styles.citySub}>{formatPrice(baseGold1g * city.premiumMultiplier, 'INR')}/g</Text>
            </View>
          ))}
          
          {/* Default 22K entry for primary city */}
          <View style={styles.cityCard}>
            <Text style={styles.cityLabel}>22K ({regionData.primaryCity})</Text>
            <Text style={styles.cityPrice}>{formatPrice((base22K1g * 10) * regionData.cities[0].premiumMultiplier, 'INR')}</Text>
            <Text style={styles.citySub}>{formatPrice(base22K1g * regionData.cities[0].premiumMultiplier, 'INR')}/g</Text>
          </View>
        </View>

        {/* Live Web Intelligence */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>Live Web Intelligence</Text>
        {liveNews.map(news => (
          <GlassCard key={news.id} style={{ marginBottom: Spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
              <Text style={{ fontSize: 16, marginRight: 8 }}>{news.category === 'gold' ? '🥇' : '🥈'}</Text>
              <Text style={{ fontFamily: Typography.fonts.bold, fontSize: Typography.sizes.sm, color: Colors.textPrimary, flex: 1 }}>{news.title}</Text>
            </View>
            <Text style={{ fontFamily: Typography.fonts.regular, fontSize: Typography.sizes.sm, color: Colors.textSecondary, lineHeight: 20 }}>{news.summary}</Text>
            <View style={{ marginTop: Spacing.md, padding: Spacing.sm, backgroundColor: Colors.glass, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.glassBorder }}>
              <Text style={{ fontFamily: Typography.fonts.bold, fontSize: Typography.sizes.xs, color: Colors.gold, marginBottom: 2 }}>🤖 AI Analysis</Text>
              <Text style={{ fontFamily: Typography.fonts.regular, fontSize: Typography.sizes.xs, color: Colors.textSecondary }}>{news.aiAnalysis}</Text>
            </View>
          </GlassCard>
        ))}

        {market && (
          <>
            {/* Opportunity Banner */}
            {opportunities.length > 0 && (
              <GlassCard variant="highlight" style={styles.opportunityBanner}>
                <View style={styles.oppHeader}>
                  <Text style={styles.oppEmoji}>{opportunities[0].emoji}</Text>
                  <View style={styles.oppContent}>
                    <Text style={styles.oppTitle}>{opportunities[0].title}</Text>
                    <Text style={styles.oppDesc}>{opportunities[0].description}</Text>
                  </View>
                </View>
              </GlassCard>
            )}

            {/* Gold Card */}
            <PriceCard
              metal={market.gold}
              currency={currency}
              showCharges={showMakingCharges}
              prediction={predictions.gold}
              onPress={() => {}}
            />

            {/* Silver Card */}
            <PriceCard
              metal={market.silver}
              currency={currency}
              showCharges={showMakingCharges}
              prediction={predictions.silver}
              onPress={() => {}}
            />

            {/* Gold-Silver Ratio */}
            <GlassCard style={styles.ratioCard}>
              <View style={styles.ratioHeader}>
                <Text style={styles.ratioTitle}>📏 Gold/Silver Ratio</Text>
                <Text style={styles.ratioValue}>{market.ratio.current.toFixed(1)}</Text>
              </View>
              <View style={styles.ratioMeta}>
                <Text style={styles.ratioAvg}>Avg: {market.ratio.historicalAverage}</Text>
                <TrendBadge
                  trend={market.ratio.silverValuation === 'undervalued' ? 'bullish' : market.ratio.silverValuation === 'overvalued' ? 'bearish' : 'neutral'}
                  value={`Silver ${market.ratio.silverValuation}`}
                  size="sm"
                />
              </View>
              <Text style={styles.ratioInterpretation}>{market.ratio.interpretation}</Text>
            </GlassCard>

            {/* AI Quick Insight */}
            {predictions.gold && (
              <GlassCard variant="gold" style={styles.insightCard}>
                <Text style={styles.insightTitle}>🤖 AI Quick Insight</Text>
                <Text style={styles.insightText}>{predictions.gold.explanation}</Text>
                <Pressable
                  style={styles.insightButton}
                  onPress={() => router.push('/assistant')}
                >
                  <Text style={styles.insightButtonText}>Ask AI Assistant →</Text>
                </Pressable>
              </GlassCard>
            )}

            {/* Last Updated */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Last updated: {formatRelativeTime(market.lastUpdated)}
              </Text>
              <Text style={styles.footerSource}>Source: {market.gold.source}</Text>
            </View>
          </>
        )}
      </ScrollView>

      <StatePickerModal 
        visible={isStatePickerVisible}
        selectedStateId={selectedStateId}
        onSelect={(id) => setSelectedStateId(id)}
        onClose={() => setStatePickerVisible(false)}
      />
    </SafeAreaView>
  );
}

// ─── Price Card Component ───────────────────────────────────────
function PriceCard({
  metal,
  currency,
  showCharges,
  prediction,
  onPress,
}: {
  metal: MetalPrice;
  currency: string;
  showCharges: boolean;
  prediction?: Prediction;
  onPress: () => void;
}) {
  const isGold = metal.metal === 'gold';
  const variant = isGold ? 'gold' : 'silver';
  const emoji = isGold ? '🥇' : '🥈';
  const name = isGold ? 'Gold' : 'Silver';
  const mainColor = isGold ? Colors.gold : Colors.silver;

  return (
    <Pressable onPress={onPress}>
      <GlassCard variant={variant as 'gold' | 'silver'} style={styles.priceCard}>
        {/* Header */}
        <View style={styles.priceHeader}>
          <View style={styles.priceHeaderLeft}>
            <Text style={styles.priceEmoji}>{emoji}</Text>
            <View>
              <Text style={[styles.priceName, { color: mainColor }]}>{name}</Text>
              <Text style={styles.priceUnit}>per gram</Text>
            </View>
          </View>
          <TrendBadge trend={metal.trend} value={formatPercent(metal.dailyChangePercent)} />
        </View>

        {/* Main Price */}
        <View style={{ marginBottom: Spacing.md }}>
          <Text style={[styles.mainPrice, { color: mainColor, marginBottom: 2 }]}>
            {formatPrice(metal.pricePerGramINR, currency === 'USD' ? 'USD' : 'INR')}
          </Text>
          <Text style={styles.bulkPrice}>
            {isGold ? '10 Grams: ' : '1 Kilogram: '}
            <Text style={{ color: Colors.textPrimary, fontFamily: Typography.fonts.semiBold }}>
              {formatPrice(isGold ? metal.pricePerGramINR * 10 : metal.pricePerGramINR * 1000, currency === 'USD' ? 'USD' : 'INR')}
            </Text>
          </Text>
        </View>

        {/* Karat Prices (Gold only) */}
        {isGold && (
          <View style={styles.karatRow}>
            <KaratBadge label="24K" price={showCharges ? metal.price24KWithCharges! * 10 : metal.price24K! * 10} color={mainColor} unit="/10g" />
            <KaratBadge label="22K" price={showCharges ? metal.price22KWithCharges! * 10 : metal.price22K! * 10} color={mainColor} unit="/10g" />
            <KaratBadge label="18K" price={showCharges ? metal.price18KWithCharges! * 10 : metal.price18K! * 10} color={mainColor} unit="/10g" />
          </View>
        )}
        {isGold && showCharges && (
          <Text style={styles.chargesNote}>Incl. making charges + 3% GST</Text>
        )}

        {/* Change Row */}
        <View style={styles.changeRow}>
          <ChangeItem label="Daily" value={metal.dailyChangePercent} />
          <ChangeItem label="Weekly" value={metal.weeklyChangePercent} />
          <ChangeItem label="Monthly" value={metal.monthlyChangePercent} />
        </View>

        {/* AI Prediction Quick View */}
        {prediction && (
          <View style={styles.predictionRow}>
            <Text style={styles.predLabel}>AI Signal:</Text>
            <Text style={[styles.predValue, { color: getRecommendationColor(prediction.recommendation) }]}>
              {formatRecommendation(prediction.recommendation)} ({prediction.probability}%)
            </Text>
          </View>
        )}
      </GlassCard>
    </Pressable>
  );
}

function KaratBadge({ label, price, color, unit }: { label: string; price: number; color: string; unit?: string }) {
  return (
    <View style={styles.karatBadge}>
      <Text style={[styles.karatLabel, { color }]}>{label}</Text>
      <Text style={styles.karatPrice}>{formatPrice(price)}{unit ? <Text style={{ fontSize: 10, color: Colors.textTertiary }}>{unit}</Text> : null}</Text>
    </View>
  );
}

function ChangeItem({ label, value }: { label: string; value: number }) {
  const color = value >= 0 ? Colors.bullish : Colors.bearish;
  return (
    <View style={styles.changeItem}>
      <Text style={styles.changeLabel}>{label}</Text>
      <Text style={[styles.changeValue, { color }]}>{formatPercent(value)}</Text>
    </View>
  );
}

function getRecommendationColor(rec: string): string {
  const colors: Record<string, string> = {
    strong_buy: Colors.bullish,
    buy: Colors.bullish,
    accumulate: '#81C784',
    hold: Colors.neutral,
    wait: Colors.warning,
    reduce: '#FF7043',
    sell: Colors.bearish,
  };
  return colors[rec] || Colors.textSecondary;
}

function formatRecommendation(rec: string): string {
  return rec.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ─── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.base,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.base,
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.base,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  appTitle: {
    fontSize: Typography.sizes['3xl'],
    fontFamily: Typography.fonts.extraBold,
    color: Colors.gold,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.medium,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  headerBtnText: {
    fontSize: 18,
  },

  gujaratBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.3)',
    marginBottom: Spacing.md,
  },

  // Opportunity Banner
  opportunityBanner: {
    marginBottom: 0,
  },
  oppHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  oppEmoji: {
    fontSize: 28,
    marginTop: 2,
  },
  oppContent: {
    flex: 1,
  },
  oppTitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  oppDesc: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  // Price Card
  priceCard: {
    marginBottom: 0,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  priceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  priceEmoji: {
    fontSize: 32,
  },
  priceName: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.bold,
  },
  priceUnit: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    color: Colors.textTertiary,
  },
  mainPrice: {
    fontSize: Typography.sizes['4xl'],
    fontFamily: Typography.fonts.extraBold,
    letterSpacing: -1,
  },
  bulkPrice: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.regular,
    color: Colors.textTertiary,
  },
  karatRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  karatBadge: {
    flex: 1,
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  karatLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bold,
    marginBottom: 2,
  },
  karatPrice: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.mono,
    color: Colors.textPrimary,
  },
  chargesNote: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
  },
  changeItem: {
    alignItems: 'center',
    flex: 1,
  },
  changeLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  changeValue: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.mono,
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  predLabel: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.medium,
    color: Colors.textTertiary,
  },
  predValue: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bold,
  },

  // Ratio Card
  ratioCard: {
    marginBottom: 0,
  },
  ratioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  ratioTitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bold,
    color: Colors.textPrimary,
  },
  ratioValue: {
    fontSize: Typography.sizes['2xl'],
    fontFamily: Typography.fonts.mono,
    color: Colors.gold,
  },
  ratioMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  ratioAvg: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.regular,
    color: Colors.textTertiary,
  },
  ratioInterpretation: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: Spacing.sm,
  },

  // Insight Card
  insightCard: {
    marginBottom: 0,
  },
  insightTitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.bold,
    color: Colors.gold,
    marginBottom: Spacing.sm,
  },
  insightText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  insightButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.goldMuted,
    borderRadius: BorderRadius.full,
  },
  insightButtonText: {
    color: Colors.gold,
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.sm,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: 4,
  },
  footerText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    color: Colors.textMuted,
  },
  footerSource: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    color: Colors.textMuted,
    opacity: 0.6,
  },

  sectionTitle: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bold, color: Colors.textPrimary, marginBottom: Spacing.md, marginTop: Spacing.md },
  cityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  cityCard: { 
    width: '48%', backgroundColor: Colors.surfaceElevated, 
    borderRadius: BorderRadius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border 
  },
  cityLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.medium, color: Colors.textSecondary, marginBottom: 4 },
  cityPrice: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.bold, color: Colors.gold, marginBottom: 2 },
  citySub: { fontSize: 11, fontFamily: Typography.fonts.regular, color: Colors.textTertiary },

  alertCard: { borderColor: Colors.gold + '40', borderWidth: 1, marginBottom: Spacing.lg },
  alertTitle: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.bold, color: Colors.gold, marginBottom: Spacing.xs },
  alertBody: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.regular, color: Colors.textSecondary, lineHeight: 20 },
  boldText: { fontFamily: Typography.fonts.bold, color: Colors.textPrimary },

  sgbScroll: { paddingBottom: Spacing.sm, gap: Spacing.md, marginBottom: Spacing.lg },
  sgbCard: { 
    width: 260, backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.sm, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
    marginRight: Spacing.md
  },
  sgbTitle: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bold, marginBottom: Spacing.sm },
  sgbBody: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.regular, color: Colors.textSecondary, lineHeight: 20 },

  calcLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.medium, color: Colors.textSecondary, marginBottom: Spacing.sm },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  currencyPrefix: { fontSize: Typography.sizes.lg, color: Colors.textPrimary, fontFamily: Typography.fonts.medium, marginRight: 4 },
  calcInput: { flex: 1, height: 50, color: Colors.textPrimary, fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.bold },
  
  calcResults: { marginTop: Spacing.sm },
  resultRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  resultEmoji: { fontSize: 24 },
  resultTextCol: { flex: 1 },
  resultTitle: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bold, color: Colors.textPrimary, marginBottom: 2 },
  resultDesc: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.regular, color: Colors.textSecondary, lineHeight: 18 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },

  rwContainer: { marginBottom: Spacing.md, marginTop: Spacing.lg },
  rwHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  rwPill: { backgroundColor: '#FFFFFF', paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: BorderRadius.full },
  rwPillText: { color: '#111827', fontFamily: Typography.fonts.bold, fontSize: Typography.sizes.sm },
  rwHeaderText: { color: Colors.textSecondary, fontFamily: Typography.fonts.medium, fontSize: Typography.sizes.sm },
  rwMetricsRow: { gap: Spacing.sm },
  rwMetricCard: { width: 140, backgroundColor: Colors.surfaceElevated, padding: Spacing.md, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border, marginRight: Spacing.sm },
  rwMetricTitle: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.medium, color: Colors.textSecondary, marginBottom: Spacing.xs },
  rwMetricValue: { fontSize: Typography.sizes.xl, fontFamily: Typography.fonts.bold, marginBottom: Spacing.xs },
  rwMetricSub: { fontSize: 11, fontFamily: Typography.fonts.regular, color: Colors.textTertiary },

  adviceContainer: { marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border },
  adviceHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.lg },
  adviceEmoji: { fontSize: 28 },
  adviceHeadline: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.bold, color: Colors.gold, marginBottom: 4 },
  adviceBody: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.regular, color: Colors.textSecondary, lineHeight: 20 },
  adviceCardsContainer: { gap: Spacing.md },
  actionCard: { backgroundColor: Colors.background, padding: Spacing.md, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border, borderLeftWidth: 4 },
  actionCardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  actionCardIcon: { fontSize: 20 },
  actionCardTitle: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bold },
  actionCardDesc: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.regular, color: Colors.textSecondary, lineHeight: 18 },
});
