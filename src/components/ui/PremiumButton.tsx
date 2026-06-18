// MetalMind AI — PremiumButton Component
// Gradient button with press feedback

import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, BorderRadius, Spacing, Shadows } from '@/constants/theme';

interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'gold' | 'silver' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function PremiumButton({
  title,
  onPress,
  variant = 'gold',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
}: PremiumButtonProps) {
  const sizeStyle = SIZE_STYLES[size];

  if (variant === 'outline' || variant === 'ghost') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.button,
          sizeStyle.button,
          variant === 'outline' ? styles.outline : styles.ghost,
          pressed && styles.pressed,
          disabled && styles.disabled,
          style,
        ]}
      >
        {icon}
        {loading ? (
          <ActivityIndicator color={Colors.gold} size="small" />
        ) : (
          <Text style={[styles.text, sizeStyle.text, variant === 'outline' ? styles.outlineText : styles.ghostText]}>
            {title}
          </Text>
        )}
      </Pressable>
    );
  }

  const colors = VARIANT_COLORS[variant] || VARIANT_COLORS.gold;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, sizeStyle.button]}
      >
        {icon}
        {loading ? (
          <ActivityIndicator color={Colors.background} size="small" />
        ) : (
          <Text style={[styles.text, sizeStyle.text, styles.solidText]}>{title}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const VARIANT_COLORS: Record<string, readonly [string, string, ...string[]]> = {
  gold: ['#FFD700', '#FFA500'],
  silver: ['#E0E0E0', '#A0A0A0'],
  danger: ['#FF5252', '#D50000'],
};

const SIZE_STYLES = {
  sm: {
    button: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm },
    text: { fontSize: Typography.sizes.sm },
  },
  md: {
    button: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
    text: { fontSize: Typography.sizes.base },
  },
  lg: {
    button: { paddingHorizontal: Spacing['2xl'], paddingVertical: Spacing.base, borderRadius: BorderRadius.lg },
    text: { fontSize: Typography.sizes.md },
  },
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: Typography.fonts.bold,
    textAlign: 'center',
  },
  solidText: {
    color: '#0A0E1A',
  },
  outline: {
    borderWidth: 1.5,
    borderColor: Colors.gold,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  outlineText: {
    color: Colors.gold,
  },
  ghost: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  ghostText: {
    color: Colors.textSecondary,
  },
});
