// MetalMind AI — Charts Screen
// Interactive price charts with technical indicators

import { GlassCard } from '@/components/ui/GlassCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TIMEFRAMES } from '@/constants/metals';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { calculateBollingerBands, calculateEMA, calculateRSI, calculateSMA } from '@/services/analysis/technicalAnalysis';
import { fetchHistoricalPrices } from '@/services/api/priceService';
import type { HistoricalPrice, MetalType } from '@/types/metals';
import { formatPrice } from '@/utils/formatters';
import { useCallback, useEffect, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 64;

const INDICATORS = [
  { key: 'sma', label: 'SMA 20', color: '#42A5F5' },
  { key: 'ema', label: 'EMA 20', color: '#AB47BC' },
  { key: 'bb', label: 'Bollinger', color: '#26A69A' },
  { key: 'rsi', label: 'RSI', color: '#FFA726' },
];

export default function ChartsScreen() {
  const [selectedMetal, setSelectedMetal] = useState<MetalType>('gold');
  const [selectedTimeframe, setSelectedTimeframe] = useState<typeof TIMEFRAMES[number]>(TIMEFRAMES[2]); // 30D
  const [data, setData] = useState<HistoricalPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndicators, setActiveIndicators] = useState<Set<string>>(new Set());

  const loadChart = useCallback(async () => {
    setLoading(true);
    try {
      const history = await fetchHistoricalPrices(selectedMetal, selectedTimeframe.days);
      setData(history);
    } catch (error) {
      console.error('Failed to load chart:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedMetal, selectedTimeframe]);

  useEffect(() => {
    loadChart();
  }, [loadChart]);

  const toggleIndicator = (key: string) => {
    setActiveIndicators(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Prepare chart data
  const closes = data.map(d => d.close);
  const chartData = data.map((d, i) => {
    const label = i % Math.max(1, Math.floor(data.length / 6)) === 0
      ? new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      : '';
    return {
      value: d.close,
      label,
      dateStr: new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      labelTextStyle: { color: Colors.textMuted, fontSize: 9, fontFamily: Typography.fonts.mono },
    };
  });

  // Calculate indicator overlays
  const smaData = activeIndicators.has('sma')
    ? calculateSMA(closes, 20).map(v => ({ value: isNaN(v) ? closes[0] : v }))
    : undefined;

  const emaData = activeIndicators.has('ema')
    ? calculateEMA(closes, 20).map(v => ({ value: isNaN(v) ? closes[0] : v }))
    : undefined;

  const rsiData = activeIndicators.has('rsi') ? calculateRSI(closes) : undefined;

  const bbData = activeIndicators.has('bb') ? calculateBollingerBands(closes) : undefined;

  const mainColor = selectedMetal === 'gold' ? Colors.gold : Colors.silver;
  const currentPrice = closes[closes.length - 1] || 0;
  const startPrice = closes[0] || 0;
  const priceChange = currentPrice - startPrice;
  const priceChangePct = startPrice > 0 ? (priceChange / startPrice) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Text style={styles.title}>📈 Interactive Charts</Text>

        {/* Metal Selector */}
        <View style={styles.metalSelector}>
          <Pressable
            style={[styles.metalBtn, selectedMetal === 'gold' && styles.metalBtnActive]}
            onPress={() => setSelectedMetal('gold')}
          >
            <Text style={[styles.metalBtnText, selectedMetal === 'gold' && styles.metalBtnTextActive]}>
              🥇 Gold
            </Text>
          </Pressable>
          <Pressable
            style={[styles.metalBtn, selectedMetal === 'silver' && styles.metalBtnActiveSlv]}
            onPress={() => setSelectedMetal('silver')}
          >
            <Text style={[styles.metalBtnText, selectedMetal === 'silver' && styles.metalBtnTextActiveSlv]}>
              🥈 Silver
            </Text>
          </Pressable>
        </View>

        {/* Price Summary */}
        <GlassCard variant={selectedMetal === 'gold' ? 'gold' : 'silver'}>
          <View style={styles.priceSummary}>
            <View>
              <Text style={styles.priceLabel}>Current Price</Text>
              <Text style={[styles.currentPrice, { color: mainColor }]}>
                {formatPrice(currentPrice)}
                <Text style={styles.priceUnit}>/g</Text>
              </Text>
            </View>
            <View style={styles.priceChangeBox}>
              <Text style={[styles.priceChangeValue, { color: priceChange >= 0 ? Colors.bullish : Colors.bearish }]}>
                {priceChange >= 0 ? '+' : ''}{formatPrice(priceChange)}
              </Text>
              <Text style={[styles.priceChangePct, { color: priceChange >= 0 ? Colors.bullish : Colors.bearish }]}>
                ({priceChangePct >= 0 ? '+' : ''}{priceChangePct.toFixed(2)}%)
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Timeframe Selector */}
        <View style={styles.timeframeRow}>
          {TIMEFRAMES.map(tf => (
            <Pressable
              key={tf.key}
              style={[styles.tfBtn, selectedTimeframe.key === tf.key && styles.tfBtnActive]}
              onPress={() => setSelectedTimeframe(tf)}
            >
              <Text style={[styles.tfBtnText, selectedTimeframe.key === tf.key && styles.tfBtnTextActive]}>
                {tf.key}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Chart */}
        <GlassCard noPadding>
          <View style={styles.chartContainer}>
            {loading ? (
              <LoadingSpinner />
            ) : chartData.length > 0 ? (
              <LineChart
                data={chartData}
                data2={smaData}
                data3={emaData}
                width={CHART_WIDTH}
                height={250}
                color={mainColor}
                color2="#42A5F5"
                color3="#AB47BC"
                thickness={3}
                thickness2={2}
                thickness3={2}
                dataPointsRadius={3}
                dataPointsColor={mainColor}
                dataPointsColor2="#42A5F5"
                dataPointsColor3="#AB47BC"
                hideDataPoints={false}
                hideDataPoints2={!smaData}
                hideDataPoints3={!emaData}
                curved
                areaChart
                startFillColor={mainColor}
                startOpacity={0.4}
                endFillColor={mainColor}
                endOpacity={0.05}
                backgroundColor="transparent"
                rulesColor={Colors.chartGrid}
                rulesType="dashed"
                yAxisTextStyle={{ color: Colors.textMuted, fontSize: 9, fontFamily: Typography.fonts.mono }}
                xAxisLabelTextStyle={{ color: Colors.textMuted, fontSize: 9 }}
                yAxisColor="transparent"
                xAxisColor={Colors.border}
                noOfSections={5}
                animateOnDataChange
                animationDuration={500}
                pointerConfig={{
                  pointerStripUptoDataPoint: true,
                  pointerStripColor: Colors.gold,
                  pointerStripWidth: 2,
                  strokeDashArray: [2, 5],
                  pointerColor: Colors.textPrimary,
                  radius: 6,
                  pointerLabelWidth: 140,
                  pointerLabelHeight: 50,
                  activatePointersOnLongPress: false,
                  autoAdjustPointerLabelPosition: true,
                  pointerLabelComponent: (items: any[]) => {
                    const item = items[0];
                    if (!item) return null;
                    return (
                      <View style={styles.tooltip}>
                        {item.dateStr ? <Text style={styles.tooltipDate}>{item.dateStr}</Text> : null}
                        <Text style={styles.tooltipText}>{formatPrice(item.value || 0)}</Text>
                      </View>
                    );
                  },
                }}
                isAnimated
              />
            ) : (
              <Text style={styles.noData}>No chart data available</Text>
            )}
          </View>
        </GlassCard>

        {/* Indicator Toggles */}
        <View style={styles.indicatorSection}>
          <Text style={styles.indicatorTitle}>Technical Indicators</Text>
          <View style={styles.indicatorRow}>
            {INDICATORS.map(ind => (
              <Pressable
                key={ind.key}
                style={[
                  styles.indicatorBtn,
                  activeIndicators.has(ind.key) && { backgroundColor: ind.color + '20', borderColor: ind.color },
                ]}
                onPress={() => toggleIndicator(ind.key)}
              >
                <View style={[styles.indicatorDot, { backgroundColor: ind.color }]} />
                <Text style={[styles.indicatorLabel, activeIndicators.has(ind.key) && { color: ind.color }]}>
                  {ind.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* RSI Chart (if active) */}
        {activeIndicators.has('rsi') && rsiData && (
          <GlassCard>
            <Text style={styles.rsiTitle}>RSI (14)</Text>
            <LineChart
              data={rsiData.map(v => ({ value: isNaN(v) ? 50 : v }))}
              width={CHART_WIDTH - 32}
              height={120}
              color="#FFA726"
              thickness={1.5}
              hideDataPoints
              curved
              backgroundColor="transparent"
              rulesColor={Colors.chartGrid}
              yAxisTextStyle={{ color: Colors.textMuted, fontSize: 9 }}
              yAxisColor="transparent"
              xAxisColor={Colors.border}
              noOfSections={3}
              maxValue={100}
              isAnimated
              showReferenceLine1
              referenceLine1Config={{ color: Colors.bearish + '50', dashWidth: 4, dashGap: 3 }}
              referenceLine1Position={70}
              showReferenceLine2
              referenceLine2Config={{ color: Colors.bullish + '50', dashWidth: 4, dashGap: 3 }}
              referenceLine2Position={30}
            />
            <View style={styles.rsiLabels}>
              <Text style={[styles.rsiLabel, { color: Colors.bearish }]}>Overbought (70)</Text>
              <Text style={[styles.rsiLabel, { color: Colors.bullish }]}>Oversold (30)</Text>
            </View>
          </GlassCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.base,
    paddingBottom: 120,
  },
  title: {
    fontSize: Typography.sizes['2xl'],
    fontFamily: Typography.fonts.bold,
    color: Colors.textPrimary,
  },
  metalSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  metalBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  metalBtnActive: {
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.gold + '40',
  },
  metalBtnActiveSlv: {
    backgroundColor: Colors.silverMuted,
    borderColor: Colors.silver + '40',
  },
  metalBtnText: {
    fontFamily: Typography.fonts.semiBold,
    fontSize: Typography.sizes.base,
    color: Colors.textTertiary,
  },
  metalBtnTextActive: {
    color: Colors.gold,
  },
  metalBtnTextActiveSlv: {
    color: Colors.silver,
  },
  priceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.regular,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: Typography.sizes['3xl'],
    fontFamily: Typography.fonts.extraBold,
    letterSpacing: -0.5,
  },
  priceUnit: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.regular,
  },
  priceChangeBox: {
    alignItems: 'flex-end',
  },
  priceChangeValue: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.mono,
  },
  priceChangePct: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.mono,
    marginTop: 2,
  },
  timeframeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tfBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  tfBtnActive: {
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.gold + '40',
  },
  tfBtnText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.semiBold,
    color: Colors.textTertiary,
  },
  tfBtnTextActive: {
    color: Colors.gold,
  },
  chartContainer: {
    paddingVertical: Spacing.base,
    paddingLeft: Spacing.sm,
    minHeight: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltip: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.gold + '50',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  tooltipDate: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: Typography.fonts.medium,
    marginBottom: 2,
  },
  tooltipText: {
    color: Colors.gold,
    fontFamily: Typography.fonts.bold,
    fontSize: Typography.sizes.sm,
  },
  noData: {
    color: Colors.textTertiary,
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.base,
  },
  indicatorSection: {
    gap: Spacing.sm,
  },
  indicatorTitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.semiBold,
    color: Colors.textPrimary,
  },
  indicatorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  indicatorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  indicatorLabel: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.medium,
    color: Colors.textTertiary,
  },
  rsiTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  rsiLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  rsiLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.medium,
  },
});
