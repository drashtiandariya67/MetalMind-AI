// MetalMind AI — Portfolio Screen
// Track gold and silver holdings with P&L

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert as RNAlert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-gifted-charts';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { usePortfolioStore } from '@/store/portfolioStore';
import { usePriceStore } from '@/store/priceStore';
import { fetchCurrentPrices } from '@/services/api/priceService';
import { formatPrice, formatPercent } from '@/utils/formatters';
import type { Holding, PortfolioSummary } from '@/types/portfolio';
import type { MetalType } from '@/types/metals';

export default function PortfolioScreen() {
  const { holdings, addHolding, removeHolding, calculateSummary, loadHoldings } = usePortfolioStore();
  const { market, setMarket } = usePriceStore();
  const [showAdd, setShowAdd] = useState(false);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);

  useEffect(() => {
    loadHoldings();
    loadPrices();
  }, []);

  const loadPrices = async () => {
    try {
      const data = await fetchCurrentPrices();
      setMarket(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (market) {
      const s = calculateSummary(market.gold.pricePerGramINR, market.silver.pricePerGramINR);
      setSummary(s);
    }
  }, [market, holdings, calculateSummary]);

  const pieData = summary ? [
    { value: summary.goldAllocation || 1, color: Colors.gold, text: `${summary.goldAllocation.toFixed(0)}%` },
    { value: summary.silverAllocation || 1, color: Colors.silver, text: `${summary.silverAllocation.toFixed(0)}%` },
  ] : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>💼 Portfolio</Text>
          <PremiumButton title="+ Add" onPress={() => setShowAdd(true)} size="sm" />
        </View>

        {holdings.length === 0 && !showAdd ? (
          <GlassCard>
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>💰</Text>
              <Text style={styles.emptyTitle}>Track Your Metals</Text>
              <Text style={styles.emptyDesc}>Add your Gold and Silver holdings to track portfolio value, P&L, and ROI in real-time.</Text>
            </View>
          </GlassCard>
        ) : summary && (
          <>
            {/* Summary Card */}
            <GlassCard variant="gold">
              <View style={styles.summaryGrid}>
                <SummaryItem label="Invested" value={formatPrice(summary.totalInvested)} />
                <SummaryItem label="Current Value" value={formatPrice(summary.totalCurrentValue)} />
                <SummaryItem
                  label="P&L"
                  value={formatPrice(summary.totalProfitLoss)}
                  color={summary.totalProfitLoss >= 0 ? Colors.bullish : Colors.bearish}
                />
                <SummaryItem
                  label="ROI"
                  value={formatPercent(summary.totalROI)}
                  color={summary.totalROI >= 0 ? Colors.bullish : Colors.bearish}
                />
              </View>
            </GlassCard>

            {/* Allocation Chart */}
            {holdings.length > 0 && (
              <GlassCard>
                <Text style={styles.sectionTitle}>📊 Allocation</Text>
                <View style={styles.allocationRow}>
                  <PieChart
                    data={pieData}
                    donut
                    radius={60}
                    innerRadius={40}
                    innerCircleColor={Colors.card}
                    centerLabelComponent={() => (
                      <Text style={styles.pieCenter}>{holdings.length}</Text>
                    )}
                  />
                  <View style={styles.allocationLegend}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: Colors.gold }]} />
                      <Text style={styles.legendLabel}>Gold {summary.goldAllocation.toFixed(0)}%</Text>
                      <Text style={styles.legendValue}>{formatPrice(summary.goldValue)}</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: Colors.silver }]} />
                      <Text style={styles.legendLabel}>Silver {summary.silverAllocation.toFixed(0)}%</Text>
                      <Text style={styles.legendValue}>{formatPrice(summary.silverValue)}</Text>
                    </View>
                  </View>
                </View>
              </GlassCard>
            )}

            {/* Holdings */}
            <Text style={styles.sectionTitle}>Holdings</Text>
            {summary.holdings.map(h => (
              <GlassCard key={h.id} variant={h.metal === 'gold' ? 'gold' : 'silver'}>
                <View style={styles.holdingHeader}>
                  <View>
                    <Text style={styles.holdingMetal}>
                      {h.metal === 'gold' ? '🥇 Gold' : '🥈 Silver'}
                      {h.karat ? ` (${h.karat})` : ''}
                    </Text>
                    <Text style={styles.holdingQty}>{h.quantity}g</Text>
                  </View>
                  <Pressable onPress={() => {
                    RNAlert.alert('Delete Holding', 'Remove this holding?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => removeHolding(h.id) },
                    ]);
                  }}>
                    <Text style={styles.deleteBtn}>🗑️</Text>
                  </Pressable>
                </View>
                <View style={styles.holdingRow}>
                  <View>
                    <Text style={styles.holdingLabel}>Bought at</Text>
                    <Text style={styles.holdingVal}>{formatPrice(h.purchasePrice)}/g</Text>
                  </View>
                  <View>
                    <Text style={styles.holdingLabel}>Current</Text>
                    <Text style={styles.holdingVal}>{formatPrice(h.currentPrice)}/g</Text>
                  </View>
                  <View>
                    <Text style={styles.holdingLabel}>P&L</Text>
                    <Text style={[styles.holdingVal, { color: h.profitLoss >= 0 ? Colors.bullish : Colors.bearish }]}>
                      {formatPercent(h.profitLossPercent)}
                    </Text>
                  </View>
                </View>
                <View style={styles.holdingTotal}>
                  <Text style={styles.holdingLabel}>Total Value</Text>
                  <Text style={[styles.holdingTotalValue, { color: h.metal === 'gold' ? Colors.gold : Colors.silver }]}>
                    {formatPrice(h.currentValue)}
                  </Text>
                </View>
              </GlassCard>
            ))}
          </>
        )}

        {/* Add Holding Form */}
        {showAdd && (
          <AddHoldingForm
            onClose={() => setShowAdd(false)}
            onSave={(holding) => {
              addHolding(holding);
              setShowAdd(false);
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, color ? { color } : {}]}>{value}</Text>
    </View>
  );
}

function AddHoldingForm({ onClose, onSave }: { onClose: () => void; onSave: (h: Holding) => void }) {
  const [metal, setMetal] = useState<MetalType>('gold');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [karat, setKarat] = useState<'24K' | '22K' | '18K'>('24K');

  return (
    <GlassCard variant="elevated" style={styles.addForm}>
      <View style={styles.addHeader}>
        <Text style={styles.addTitle}>Add Holding</Text>
        <Pressable onPress={onClose}><Text style={styles.closeBtn}>✕</Text></Pressable>
      </View>

      <Text style={styles.formLabel}>Metal</Text>
      <View style={styles.row}>
        {(['gold', 'silver'] as MetalType[]).map(m => (
          <Pressable key={m} style={[styles.chip, metal === m && styles.chipActive]} onPress={() => setMetal(m)}>
            <Text style={[styles.chipText, metal === m && styles.chipTextActive]}>
              {m === 'gold' ? '🥇 Gold' : '🥈 Silver'}
            </Text>
          </Pressable>
        ))}
      </View>

      {metal === 'gold' && (
        <>
          <Text style={styles.formLabel}>Karat</Text>
          <View style={styles.row}>
            {(['24K', '22K', '18K'] as const).map(k => (
              <Pressable key={k} style={[styles.chip, karat === k && styles.chipActive]} onPress={() => setKarat(k)}>
                <Text style={[styles.chipText, karat === k && styles.chipTextActive]}>{k}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <Text style={styles.formLabel}>Quantity (grams)</Text>
      <TextInput
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
        placeholder="e.g. 10"
        placeholderTextColor={Colors.textMuted}
        keyboardType="numeric"
      />

      <Text style={styles.formLabel}>Purchase Price (₹/gram)</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="e.g. 7200"
        placeholderTextColor={Colors.textMuted}
        keyboardType="numeric"
      />

      <PremiumButton
        title="Add Holding"
        onPress={() => {
          onSave({
            id: Date.now().toString(),
            metal,
            quantity: parseFloat(quantity) || 0,
            purchasePrice: parseFloat(price) || 0,
            purchaseDate: new Date().toISOString(),
            karat: metal === 'gold' ? karat : undefined,
          });
        }}
        style={styles.saveBtn}
      />
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: Spacing.base, gap: Spacing.base, paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: Typography.sizes['2xl'], fontFamily: Typography.fonts.bold, color: Colors.textPrimary },
  sectionTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.bold, color: Colors.textPrimary, marginTop: Spacing.sm },

  emptyState: { alignItems: 'center', padding: Spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.bold, color: Colors.textPrimary },
  emptyDesc: { fontSize: Typography.sizes.sm, color: Colors.textTertiary, textAlign: 'center', marginTop: Spacing.sm },

  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  summaryItem: { width: '46%' },
  summaryLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.regular, color: Colors.textTertiary, marginBottom: 2 },
  summaryValue: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.bold, color: Colors.textPrimary },

  allocationRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl, marginTop: Spacing.md },
  allocationLegend: { flex: 1, gap: Spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.medium, color: Colors.textSecondary, flex: 1 },
  legendValue: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.mono, color: Colors.textPrimary },

  pieCenter: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.bold, color: Colors.textPrimary },

  holdingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  holdingMetal: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.bold, color: Colors.textPrimary },
  holdingQty: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.mono, color: Colors.textTertiary, marginTop: 2 },
  deleteBtn: { fontSize: 16, opacity: 0.6 },
  holdingRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  holdingLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.regular, color: Colors.textTertiary, marginBottom: 2 },
  holdingVal: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.mono, color: Colors.textPrimary },
  holdingTotal: { marginTop: Spacing.md, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border, flexDirection: 'row', justifyContent: 'space-between' },
  holdingTotalValue: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.bold },

  addForm: { marginTop: Spacing.md },
  addHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  addTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.bold, color: Colors.gold },
  closeBtn: { fontSize: Typography.sizes.lg, color: Colors.textTertiary },
  formLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.semiBold, color: Colors.textSecondary, marginBottom: Spacing.sm, marginTop: Spacing.md },
  row: { flexDirection: 'row', gap: Spacing.sm },
  chip: { flex: 1, paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm, alignItems: 'center', backgroundColor: Colors.glass, borderWidth: 1, borderColor: Colors.glassBorder },
  chipActive: { backgroundColor: Colors.goldMuted, borderColor: Colors.gold + '40' },
  chipText: { fontFamily: Typography.fonts.medium, color: Colors.textTertiary, fontSize: Typography.sizes.sm },
  chipTextActive: { color: Colors.gold },
  input: { backgroundColor: Colors.glass, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.glassBorder, padding: Spacing.md, color: Colors.textPrimary, fontFamily: Typography.fonts.mono, fontSize: Typography.sizes.md },
  saveBtn: { marginTop: Spacing.lg },
});
