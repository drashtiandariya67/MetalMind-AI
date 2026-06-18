// MetalMind AI — Settings Screen

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { useSettingsStore, type CurrencyType } from '@/store/settingsStore';

export default function SettingsScreen() {
  const router = useRouter();
  const settings = useSettingsStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Display Settings */}
        <Text style={styles.sectionTitle}>Display</Text>
        <GlassCard style={styles.card}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Currency</Text>
              <Text style={styles.settingDesc}>Base currency for all prices</Text>
            </View>
            <View style={styles.segmentedControl}>
              <Pressable
                style={[styles.segment, settings.currency === 'INR' && styles.segmentActive]}
                onPress={() => settings.setCurrency('INR')}
              >
                <Text style={[styles.segmentText, settings.currency === 'INR' && styles.segmentTextActive]}>INR (₹)</Text>
              </Pressable>
              <Pressable
                style={[styles.segment, settings.currency === 'USD' && styles.segmentActive]}
                onPress={() => settings.setCurrency('USD')}
              >
                <Text style={[styles.segmentText, settings.currency === 'USD' && styles.segmentTextActive]}>USD ($)</Text>
              </Pressable>
            </View>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.textCol}>
              <Text style={styles.settingLabel}>Include Making Charges & GST</Text>
              <Text style={styles.settingDesc}>Add 8-18% making charges + 3% GST to 24K/22K/18K prices for physical gold realism</Text>
            </View>
            <Switch
              value={settings.showMakingCharges}
              onValueChange={settings.toggleMakingCharges}
              trackColor={{ false: Colors.glass, true: Colors.goldMuted }}
              thumbColor={settings.showMakingCharges ? Colors.gold : Colors.textTertiary}
            />
          </View>
        </GlassCard>

        {/* Notification Settings */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <GlassCard style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.textCol}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDesc}>Receive alerts on this device</Text>
            </View>
            <Switch
              value={settings.pushNotifications}
              onValueChange={settings.togglePushNotifications}
              trackColor={{ false: Colors.glass, true: Colors.goldMuted }}
              thumbColor={settings.pushNotifications ? Colors.gold : Colors.textTertiary}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.textCol}>
              <Text style={styles.settingLabel}>Telegram Alerts</Text>
              <Text style={styles.settingDesc}>Forward alerts to Telegram Bot</Text>
            </View>
            <Switch
              value={settings.telegramNotifications}
              onValueChange={settings.toggleTelegramNotifications}
              trackColor={{ false: Colors.glass, true: Colors.goldMuted }}
              thumbColor={settings.telegramNotifications ? Colors.gold : Colors.textTertiary}
            />
          </View>
        </GlassCard>

        {/* Telegram Config (Visible only if enabled) */}
        {settings.telegramNotifications && (
          <GlassCard style={styles.card}>
            <Text style={styles.settingLabel}>Telegram Bot Configuration</Text>
            <Text style={styles.settingDesc}>Enter your bot details to receive alerts.</Text>
            
            <Text style={styles.inputLabel}>Bot Token</Text>
            <TextInput
              style={styles.input}
              value={settings.telegramBotToken}
              onChangeText={(t) => settings.setTelegramConfig(t, settings.telegramChatId)}
              placeholder="e.g. 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
            />

            <Text style={styles.inputLabel}>Chat ID</Text>
            <TextInput
              style={styles.input}
              value={settings.telegramChatId}
              onChangeText={(t) => settings.setTelegramConfig(settings.telegramBotToken, t)}
              placeholder="e.g. 123456789"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
            />
          </GlassCard>
        )}

        {/* Security & Data */}
        <Text style={styles.sectionTitle}>Security & Data</Text>
        <GlassCard style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.textCol}>
              <Text style={styles.settingLabel}>Biometric Lock</Text>
              <Text style={styles.settingDesc}>Require Face ID / Fingerprint to open app</Text>
            </View>
            <Switch
              value={settings.biometricLock}
              onValueChange={settings.toggleBiometricLock}
              trackColor={{ false: Colors.glass, true: Colors.goldMuted }}
              thumbColor={settings.biometricLock ? Colors.gold : Colors.textTertiary}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.textCol}>
              <Text style={styles.settingLabel}>Auto-Refresh Interval</Text>
              <Text style={styles.settingDesc}>Fetch new prices every {settings.refreshInterval} mins</Text>
            </View>
            <View style={styles.segmentedControl}>
              {[5, 15, 60].map(mins => (
                <Pressable
                  key={mins}
                  style={[styles.segment, settings.refreshInterval === mins && styles.segmentActive]}
                  onPress={() => settings.setRefreshInterval(mins)}
                >
                  <Text style={[styles.segmentText, settings.refreshInterval === mins && styles.segmentTextActive]}>
                    {mins}m
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </GlassCard>

        {/* About */}
        <View style={styles.aboutSection}>
          <Text style={styles.version}>MetalMind AI v1.0.0</Text>
          <Text style={styles.disclaimer}>
            Disclaimer: Predictions and AI analysis are for informational purposes only and do not constitute financial advice. All data calculations use Indian market estimates.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.base, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backBtnText: { color: Colors.gold, fontSize: 24 },
  headerTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.bold, color: Colors.textPrimary },
  
  scrollContent: { padding: Spacing.base, paddingBottom: Spacing.xl },
  sectionTitle: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.bold, color: Colors.textPrimary, marginLeft: Spacing.sm, marginBottom: Spacing.sm, marginTop: Spacing.lg },
  
  card: { marginBottom: 0 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.xs },
  textCol: { flex: 1, paddingRight: Spacing.md },
  settingLabel: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.semiBold, color: Colors.textPrimary, marginBottom: 2 },
  settingDesc: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.regular, color: Colors.textTertiary, lineHeight: 18 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },
  
  segmentedControl: { flexDirection: 'row', backgroundColor: Colors.glass, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.glassBorder, padding: 2 },
  segment: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm - 2 },
  segmentActive: { backgroundColor: Colors.goldMuted },
  segmentText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.medium, color: Colors.textTertiary },
  segmentTextActive: { color: Colors.gold, fontFamily: Typography.fonts.bold },

  inputLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.medium, color: Colors.textSecondary, marginTop: Spacing.md, marginBottom: Spacing.xs },
  input: { backgroundColor: Colors.glass, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.glassBorder, padding: Spacing.md, color: Colors.textPrimary, fontFamily: Typography.fonts.mono, fontSize: Typography.sizes.sm },

  aboutSection: { alignItems: 'center', marginTop: Spacing['2xl'], paddingHorizontal: Spacing.xl },
  version: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bold, color: Colors.textSecondary, marginBottom: Spacing.sm },
  disclaimer: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.regular, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
});
