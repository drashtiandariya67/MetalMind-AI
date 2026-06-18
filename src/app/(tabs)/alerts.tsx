// MetalMind AI — Alerts Screen
// Smart alert management with all 10 alert types

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, Switch, Alert as RNAlert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { useAlertStore } from '@/store/alertStore';
import { ALERT_TYPE_CONFIG, type AlertType, type Alert } from '@/types/alerts';
import type { MetalType } from '@/types/metals';
import { formatPrice, formatRelativeTime } from '@/utils/formatters';

export default function AlertsScreen() {
  const { alerts, addAlert, removeAlert, toggleAlert, triggeredAlerts } = useAlertStore();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>🔔 Smart Alerts</Text>
          <PremiumButton
            title="+ New Alert"
            onPress={() => setShowCreate(true)}
            size="sm"
          />
        </View>

        {/* Active Alerts */}
        {alerts.length === 0 ? (
          <GlassCard>
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔔</Text>
              <Text style={styles.emptyTitle}>No alerts yet</Text>
              <Text style={styles.emptyDesc}>Create alerts to get notified about price changes, breakouts, and AI signals.</Text>
            </View>
          </GlassCard>
        ) : (
          alerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onToggle={() => toggleAlert(alert.id)}
              onDelete={() => {
                RNAlert.alert('Delete Alert', 'Are you sure?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => removeAlert(alert.id) },
                ]);
              }}
            />
          ))
        )}

        {/* Triggered Alerts History */}
        {triggeredAlerts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>📋 Recent Triggers</Text>
            {triggeredAlerts.slice(0, 10).map((trigger, i) => (
              <GlassCard key={`trigger-${i}`} style={styles.triggerCard}>
                <Text style={styles.triggerMsg}>{trigger.message}</Text>
                <Text style={styles.triggerTime}>{formatRelativeTime(trigger.triggeredAt)}</Text>
              </GlassCard>
            ))}
          </>
        )}

        {/* Create Alert Modal */}
        {showCreate && (
          <CreateAlertForm
            onClose={() => setShowCreate(false)}
            onSave={(alert) => {
              addAlert(alert);
              setShowCreate(false);
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Alert Card ─────────────────────────────────────────────────
function AlertCard({
  alert,
  onToggle,
  onDelete,
}: {
  alert: Alert;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const config = ALERT_TYPE_CONFIG[alert.type];
  const metalEmoji = alert.metal === 'gold' ? '🥇' : '🥈';

  return (
    <GlassCard>
      <View style={styles.alertHeader}>
        <View style={styles.alertLeft}>
          <Text style={styles.alertEmoji}>{config.emoji}</Text>
          <View style={styles.alertInfo}>
            <Text style={styles.alertType}>{config.label}</Text>
            <Text style={styles.alertMetal}>{metalEmoji} {alert.metal === 'gold' ? 'Gold' : 'Silver'}</Text>
          </View>
        </View>
        <Switch
          value={alert.enabled}
          onValueChange={onToggle}
          trackColor={{ false: Colors.glass, true: Colors.goldMuted }}
          thumbColor={alert.enabled ? Colors.gold : Colors.textTertiary}
        />
      </View>
      {config.needsThreshold && (
        <Text style={styles.alertThreshold}>
          {config.thresholdUnit === 'price' ? formatPrice(alert.threshold) : `${alert.threshold}%`}
        </Text>
      )}
      <View style={styles.alertFooter}>
        <Text style={styles.alertTriggers}>Triggered: {alert.triggerCount}x</Text>
        <Pressable onPress={onDelete}>
          <Text style={styles.alertDelete}>Delete</Text>
        </Pressable>
      </View>
    </GlassCard>
  );
}

// ─── Create Alert Form ──────────────────────────────────────────
function CreateAlertForm({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (alert: Alert) => void;
}) {
  const [metal, setMetal] = useState<MetalType>('gold');
  const [alertType, setAlertType] = useState<AlertType>('price_above');
  const [threshold, setThreshold] = useState('');

  const config = ALERT_TYPE_CONFIG[alertType];

  const handleSave = () => {
    const newAlert: Alert = {
      id: Date.now().toString(),
      metal,
      type: alertType,
      threshold: parseFloat(threshold) || 0,
      enabled: true,
      channels: ['push'],
      createdAt: new Date().toISOString(),
      triggerCount: 0,
    };
    onSave(newAlert);
  };

  return (
    <GlassCard variant="elevated" style={styles.createForm}>
      <View style={styles.createHeader}>
        <Text style={styles.createTitle}>Create Alert</Text>
        <Pressable onPress={onClose}>
          <Text style={styles.closeBtn}>✕</Text>
        </Pressable>
      </View>

      {/* Metal Selection */}
      <Text style={styles.formLabel}>Metal</Text>
      <View style={styles.metalSelector}>
        {(['gold', 'silver'] as MetalType[]).map(m => (
          <Pressable
            key={m}
            style={[styles.formOption, metal === m && styles.formOptionActive]}
            onPress={() => setMetal(m)}
          >
            <Text style={[styles.formOptionText, metal === m && styles.formOptionTextActive]}>
              {m === 'gold' ? '🥇 Gold' : '🥈 Silver'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Alert Type */}
      <Text style={styles.formLabel}>Alert Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
        {(Object.keys(ALERT_TYPE_CONFIG) as AlertType[]).map(type => (
          <Pressable
            key={type}
            style={[styles.typeChip, alertType === type && styles.typeChipActive]}
            onPress={() => setAlertType(type)}
          >
            <Text style={styles.typeEmoji}>{ALERT_TYPE_CONFIG[type].emoji}</Text>
            <Text style={[styles.typeText, alertType === type && styles.typeTextActive]}>
              {ALERT_TYPE_CONFIG[type].label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Threshold */}
      {config.needsThreshold && (
        <>
          <Text style={styles.formLabel}>
            {config.thresholdUnit === 'price' ? 'Price (₹)' : 'Percentage (%)'}
          </Text>
          <TextInput
            style={styles.input}
            value={threshold}
            onChangeText={setThreshold}
            placeholder={config.thresholdUnit === 'price' ? 'e.g. 7500' : 'e.g. 2'}
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
          />
        </>
      )}

      <PremiumButton title="Create Alert" onPress={handleSave} style={styles.saveBtn} />
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: Spacing.base, gap: Spacing.base, paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: Typography.sizes['2xl'], fontFamily: Typography.fonts.bold, color: Colors.textPrimary },
  sectionTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.bold, color: Colors.textPrimary, marginTop: Spacing.md },

  // Empty
  emptyState: { alignItems: 'center', padding: Spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  emptyDesc: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.regular, color: Colors.textTertiary, textAlign: 'center' },

  // Alert Card
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  alertEmoji: { fontSize: 24 },
  alertInfo: {},
  alertType: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.semiBold, color: Colors.textPrimary },
  alertMetal: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.regular, color: Colors.textTertiary, marginTop: 2 },
  alertThreshold: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.mono, color: Colors.gold, marginTop: Spacing.sm },
  alertFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  alertTriggers: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.regular, color: Colors.textTertiary },
  alertDelete: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.medium, color: Colors.bearish },

  // Trigger
  triggerCard: { marginBottom: 0 },
  triggerMsg: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.regular, color: Colors.textSecondary, lineHeight: 18 },
  triggerTime: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.regular, color: Colors.textMuted, marginTop: Spacing.sm },

  // Create Form
  createForm: { marginTop: Spacing.md },
  createHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.base },
  createTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.bold, color: Colors.gold },
  closeBtn: { fontSize: Typography.sizes.lg, color: Colors.textTertiary },
  formLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.semiBold, color: Colors.textSecondary, marginBottom: Spacing.sm, marginTop: Spacing.md },
  metalSelector: { flexDirection: 'row', gap: Spacing.sm },
  formOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  formOptionActive: { backgroundColor: Colors.goldMuted, borderColor: Colors.gold + '40' },
  formOptionText: { fontFamily: Typography.fonts.medium, color: Colors.textTertiary },
  formOptionTextActive: { color: Colors.gold },
  typeScroll: { marginBottom: Spacing.sm },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginRight: Spacing.sm,
  },
  typeChipActive: { backgroundColor: Colors.goldMuted, borderColor: Colors.gold + '40' },
  typeEmoji: { fontSize: 14 },
  typeText: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.medium, color: Colors.textTertiary },
  typeTextActive: { color: Colors.gold },
  input: {
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontFamily: Typography.fonts.mono,
    fontSize: Typography.sizes.md,
  },
  saveBtn: { marginTop: Spacing.lg },
});
