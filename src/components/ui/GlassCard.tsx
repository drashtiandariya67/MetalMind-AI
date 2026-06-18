// MetalMind AI — GlassCard Component
// Premium glassmorphism card with blur effect

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Spacing, Shadows } from '@/constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'highlight' | 'gold' | 'silver';
  padding?: number;
  noPadding?: boolean;
}

export function GlassCard({ children, style, variant = 'default', padding, noPadding }: GlassCardProps) {
  const gradientColors = getGradientColors(variant);
  const borderColor = getBorderColor(variant);

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          { borderColor },
          noPadding ? {} : { padding: padding ?? Spacing.base },
        ]}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

function getGradientColors(variant: string): readonly [string, string, ...string[]] {
  switch (variant) {
    case 'elevated':
      return ['rgba(28, 37, 65, 0.95)', 'rgba(20, 27, 45, 0.98)'];
    case 'highlight':
      return ['rgba(31, 42, 69, 0.9)', 'rgba(26, 33, 56, 0.95)'];
    case 'gold':
      return ['rgba(255, 215, 0, 0.08)', 'rgba(255, 165, 0, 0.04)'];
    case 'silver':
      return ['rgba(192, 192, 192, 0.08)', 'rgba(160, 160, 160, 0.04)'];
    default:
      return ['rgba(20, 27, 45, 0.85)', 'rgba(17, 24, 39, 0.9)'];
  }
}

function getBorderColor(variant: string): string {
  switch (variant) {
    case 'gold':
      return 'rgba(255, 215, 0, 0.15)';
    case 'silver':
      return 'rgba(192, 192, 192, 0.15)';
    case 'elevated':
      return 'rgba(255, 255, 255, 0.10)';
    default:
      return Colors.glassBorder;
  }
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  gradient: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
});
