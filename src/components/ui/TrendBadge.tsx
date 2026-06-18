// MetalMind AI — TrendBadge Component
// Color-coded directional badge

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '@/constants/theme';
import type { TrendDirection } from '@/types/metals';

interface TrendBadgeProps {
  trend: TrendDirection;
  value?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TrendBadge({ trend, value, size = 'md' }: TrendBadgeProps) {
  const config = TREND_CONFIG[trend];
  const sizeStyles = SIZE_STYLES[size];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, sizeStyles.badge]}>
      <Text style={[styles.arrow, { color: config.color }, sizeStyles.text]}>{config.arrow}</Text>
      {value && (
        <Text style={[styles.value, { color: config.color }, sizeStyles.text]}>{value}</Text>
      )}
    </View>
  );
}

const TREND_CONFIG = {
  bullish: { arrow: '▲', color: Colors.bullish, bg: Colors.bullishBg },
  bearish: { arrow: '▼', color: Colors.bearish, bg: Colors.bearishBg },
  neutral: { arrow: '●', color: Colors.neutral, bg: Colors.neutralBg },
};

const SIZE_STYLES = {
  sm: {
    badge: { paddingHorizontal: Spacing.sm, paddingVertical: 2 },
    text: { fontSize: Typography.sizes.xs },
  },
  md: {
    badge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
    text: { fontSize: Typography.sizes.sm },
  },
  lg: {
    badge: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm },
    text: { fontSize: Typography.sizes.base },
  },
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  arrow: {
    fontFamily: Typography.fonts.bold,
  },
  value: {
    fontFamily: Typography.fonts.semiBold,
  },
});
