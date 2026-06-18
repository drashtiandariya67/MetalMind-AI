// MetalMind AI — Predictions Screen
// AI forecasts for 1D, 7D, 30D with recommendation engine

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, RecommendationColors } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { TrendBadge } from '@/components/ui/TrendBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { fetchCurrentPrices, fetchHistoricalPrices } from '@/services/api/priceService';
import { generateAllPredictions } from '@/services/analysis/predictionEngine';
import { formatPrice, formatPercent } from '@/utils/formatters';
import type { MetalType } from '@/types/metals';
import type { Prediction, PredictionTimeframe } from '@/types/predictions';

export default function PredictionsScreen() {
  const [selectedMetal, setSelectedMetal] = useState<MetalType>('gold');
  const [predictions, setPredictions] = useState<Record<PredictionTimeframe, Prediction> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPredictions = useCallback(async () => {
    try {
      setLoading(true);
      const market = await fetchCurrentPrices();
      const history = await fetchHistoricalPrices(selectedMetal, 90);
      const currentPrice = selectedMetal === 'gold' ? market.gold.pricePerGramINR : market.silver.pricePerGramINR;
      const preds = generateAllPredictions(selectedMetal, history, currentPrice, market.ratio);
      setPredictions(preds);
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedMetal]);

  useEffect(() => { loadPredictions(); }, [loadPredictions]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPredictions();
    setRefreshing(false);
  };

  const metalColor = selectedMetal === 'gold' ? Colors.gold : Colors.silver;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />}
      >
        <Text style={styles.title}>🤖 AI Predictions</Text>

        {/* Metal Selector */}
        <View style={styles.metalSelector}>
          {(['gold', 'silver'] as MetalType[]).map(m => (
            <Pressable
              key={m}
              style={[styles.metalBtn, selectedMetal === m && { backgroundColor: (m === 'gold' ? Colors.goldMuted : Colors.silverMuted), borderColor: (m === 'gold' ? Colors.gold : Colors.silver) + '40' }]}
              onPress={() => setSelectedMetal(m)}
            >
              <Text style={[styles.metalBtnText, selectedMetal === m && { color: m === 'gold' ? Colors.gold : Colors.silver }]}>
                {m === 'gold' ? '🥇 Gold' : '🥈 Silver'}
              </Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <LoadingSpinner size={50} />
        ) : predictions ? (
          <>
            {/* Tomorrow Forecast */}
            <ForecastCard
              prediction={predictions['1d']}
              label="Tomorrow Forecast"
              emoji="📅"
              metalColor={metalColor}
            />

            {/* 7-Day Forecast */}
            <ForecastCard
              prediction={predictions['7d']}
              label="7-Day Forecast"
              emoji="📆"
              metalColor={metalColor}
            />

            {/* 30-Day Forecast */}
            <ForecastCard
              prediction={predictions['30d']}
              label="30-Day Forecast"
              emoji="🗓️"
              metalColor={metalColor}
            />

            {/* AI Recommendation */}
            <GlassCard variant="gold">
              <Text style={styles.recTitle}>💡 AI Recommendation</Text>
              <View style={styles.recBadgeRow}>
                <View style={[styles.recBadge, { backgroundColor: RecommendationColors[predictions['1d'].recommendation] + '20' }]}>
                  <Text style={[styles.recBadgeText, { color: RecommendationColors[predictions['1d'].recommendation] }]}>
                    {formatRec(predictions['1d'].recommendation)}
                  </Text>
                </View>
                <Text style={styles.recConfidence}>
                  {predictions['1d'].probability}% confidence
                </Text>
              </View>
              <Text style={styles.recExplanation}>{predictions['1d'].explanation}</Text>
            </GlassCard>

            {/* Indicator Snapshot */}
            <GlassCard>
              <Text style={styles.indTitle}>📊 Indicator Dashboard</Text>
              <View style={styles.indGrid}>
                <IndicatorItem
                  label="RSI (14)"
                  value={predictions['1d'].indicators.rsi.value.toFixed(1)}
                  signal={predictions['1d'].indicators.rsi.signal}
                />
                <IndicatorItem
                  label="MACD"
                  value={predictions['1d'].indicators.macd.histogram > 0 ? 'Positive' : 'Negative'}
                  signal={predictions['1d'].indicators.macd.histogram > 0 ? 'bullish' : 'bearish'}
                />
                <IndicatorItem
                  label="EMA 20"
                  value={formatPrice(predictions['1d'].indicators.ema20)}
                  signal="neutral"
                />
                <IndicatorItem
                  label="Momentum"
                  value={predictions['1d'].indicators.momentum.toFixed(1) + '%'}
                  signal={predictions['1d'].indicators.momentum > 0 ? 'bullish' : 'bearish'}
                />
                <IndicatorItem
                  label="BB Width"
                  value={((predictions['1d'].indicators.bollingerUpper - predictions['1d'].indicators.bollingerLower) / predictions['1d'].indicators.bollingerMiddle * 100).toFixed(1) + '%'}
                  signal="neutral"
                />
                <IndicatorItem
                  label="ATR"
                  value={predictions['1d'].indicators.atr.toFixed(2)}
                  signal="neutral"
                />
              </View>
            </GlassCard>
          </>
        ) : (
          <Text style={styles.errorText}>Failed to generate predictions</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Forecast Card ──────────────────────────────────────────────
function ForecastCard({
  prediction,
  label,
  emoji,
  metalColor,
}: {
  prediction: Prediction;
  label: string;
  emoji: string;
  metalColor: string;
}) {
  return (
    <GlassCard>
      <View style={styles.forecastHeader}>
        <Text style={styles.forecastLabel}>{emoji} {label}</Text>
        <TrendBadge trend={prediction.direction} />
      </View>

      <View style={styles.rangeRow}>
        <View style={styles.rangeItem}>
          <Text style={styles.rangeLabel}>Low</Text>
          <Text style={[styles.rangeValue, { color: Colors.bearish }]}>
            {formatPrice(prediction.expectedRange.low)}
          </Text>
        </View>
        <View style={styles.rangeItem}>
          <Text style={styles.rangeLabel}>Expected</Text>
          <Text style={[styles.rangeValue, { color: metalColor }]}>
            {formatPrice(prediction.expectedRange.midpoint)}
          </Text>
        </View>
        <View style={styles.rangeItem}>
          <Text style={styles.rangeLabel}>High</Text>
          <Text style={[styles.rangeValue, { color: Colors.bullish }]}>
            {formatPrice(prediction.expectedRange.high)}
          </Text>
        </View>
      </View>

      {/* Probability Bar */}
      <View style={styles.probRow}>
        <Text style={styles.probLabel}>
          {prediction.direction === 'bullish' ? 'Bullish' : prediction.direction === 'bearish' ? 'Bearish' : 'Neutral'} Probability
        </Text>
        <Text style={[styles.probValue, { color: getDirectionColor(prediction.direction) }]}>
          {prediction.probability}%
        </Text>
      </View>
      <View style={styles.probBarBg}>
        <View
          style={[
            styles.probBarFill,
            {
              width: `${prediction.probability}%` as unknown as number,
              backgroundColor: getDirectionColor(prediction.direction),
            },
          ]}
        />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Confidence</Text>
          <Text style={styles.metaValue}>{prediction.confidence.toUpperCase()}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Sentiment</Text>
          <Text style={styles.metaValue}>{prediction.sentiment}</Text>
        </View>
      </View>
    </GlassCard>
  );
}

// ─── Indicator Item ─────────────────────────────────────────────
function IndicatorItem({ label, value, signal }: { label: string; value: string; signal: string }) {
  let color: string = Colors.textSecondary;
  if (signal === 'bullish' || signal === 'oversold') color = Colors.bullish;
  else if (signal === 'bearish' || signal === 'overbought') color = Colors.bearish;

  return (
    <View style={styles.indItem}>
      <Text style={styles.indLabel}>{label}</Text>
      <Text style={[styles.indValue, { color }]}>{value}</Text>
    </View>
  );
}

function getDirectionColor(direction: string): string {
  return direction === 'bullish' ? Colors.bullish : direction === 'bearish' ? Colors.bearish : Colors.neutral;
}

function formatRec(rec: string): string {
  return rec.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: Spacing.base, gap: Spacing.base, paddingBottom: 120 },
  title: {
    fontSize: Typography.sizes['2xl'],
    fontFamily: Typography.fonts.bold,
    color: Colors.textPrimary,
  },
  metalSelector: { flexDirection: 'row', gap: Spacing.sm },
  metalBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  metalBtnText: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.base,
    color: Colors.textTertiary,
  },
  errorText: { color: Colors.textTertiary, textAlign: 'center', marginTop: 40 },

  // Forecast
  forecastHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  forecastLabel: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.bold, color: Colors.textPrimary },
  rangeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  rangeItem: { alignItems: 'center', flex: 1 },
  rangeLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.regular, color: Colors.textTertiary, marginBottom: 4 },
  rangeValue: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.mono },
  probRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  probLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.medium, color: Colors.textSecondary },
  probValue: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.bold },
  probBarBg: { height: 6, backgroundColor: Colors.glass, borderRadius: 3, overflow: 'hidden', marginBottom: Spacing.md },
  probBarFill: { height: '100%', borderRadius: 3 },
  metaRow: { flexDirection: 'row', gap: Spacing.base },
  metaItem: { flex: 1 },
  metaLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.regular, color: Colors.textTertiary, marginBottom: 2 },
  metaValue: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.semiBold, color: Colors.textPrimary },

  // Recommendation
  recTitle: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.bold, color: Colors.gold, marginBottom: Spacing.md },
  recBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  recBadge: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full },
  recBadgeText: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.bold },
  recConfidence: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.medium, color: Colors.textTertiary },
  recExplanation: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.regular, color: Colors.textSecondary, lineHeight: 20 },

  // Indicators
  indTitle: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  indGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  indItem: {
    width: '31%',
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  indLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.regular, color: Colors.textTertiary, marginBottom: 4 },
  indValue: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.mono },
});
