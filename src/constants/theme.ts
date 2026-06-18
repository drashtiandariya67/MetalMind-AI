// MetalMind AI — Design System Theme
// Premium dark fintech aesthetic with gold/silver accents

import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Color Palette ───────────────────────────────────────────────
export const Colors = {
  // Base (Deep Navy / Charcoal)
  background: '#0A0E1A',
  surface: '#111827',
  surfaceElevated: '#1A2138',
  surfaceHighlight: '#1F2A45',
  card: '#141B2D',
  cardElevated: '#1C2541',

  // Glass Effect
  glass: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassHighlight: 'rgba(255, 255, 255, 0.12)',

  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  textMuted: '#475569',

  // Gold Accent
  gold: '#FFD700',
  goldLight: '#FFE44D',
  goldDark: '#C8A200',
  goldMuted: 'rgba(255, 215, 0, 0.15)',
  goldGradientStart: '#FFD700',
  goldGradientEnd: '#FFA500',

  // Silver Accent
  silver: '#C0C0C0',
  silverLight: '#E8E8E8',
  silverDark: '#808080',
  silverMuted: 'rgba(192, 192, 192, 0.15)',
  silverGradientStart: '#E8E8E8',
  silverGradientEnd: '#A0A0A0',

  // Trend Indicators
  bullish: '#00E676',
  bullishLight: '#69F0AE',
  bullishDark: '#00C853',
  bullishMuted: 'rgba(0, 230, 118, 0.12)',
  bullishBg: 'rgba(0, 230, 118, 0.08)',

  bearish: '#FF5252',
  bearishLight: '#FF8A80',
  bearishDark: '#D50000',
  bearishMuted: 'rgba(255, 82, 82, 0.12)',
  bearishBg: 'rgba(255, 82, 82, 0.08)',

  neutral: '#FFD740',
  neutralLight: '#FFE57F',
  neutralDark: '#FFC400',
  neutralMuted: 'rgba(255, 215, 64, 0.12)',
  neutralBg: 'rgba(255, 215, 64, 0.08)',

  // Semantic
  primary: '#FFD700',
  primaryMuted: 'rgba(255, 215, 0, 0.2)',
  info: '#42A5F5',
  infoMuted: 'rgba(66, 165, 245, 0.12)',
  warning: '#FFA726',
  warningMuted: 'rgba(255, 167, 38, 0.12)',
  error: '#EF5350',
  errorMuted: 'rgba(239, 83, 80, 0.12)',
  success: '#66BB6A',
  successMuted: 'rgba(102, 187, 106, 0.12)',

  // Borders
  border: 'rgba(255, 255, 255, 0.06)',
  borderLight: 'rgba(255, 255, 255, 0.10)',
  borderActive: 'rgba(255, 215, 0, 0.3)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Chart
  chartGrid: 'rgba(255, 255, 255, 0.04)',
  chartLine: '#FFD700',
  chartFill: 'rgba(255, 215, 0, 0.08)',
} as const;

// ─── Gradients ───────────────────────────────────────────────────
export const Gradients = {
  goldShimmer: ['#FFD700', '#FFA500', '#FF8C00'],
  silverShimmer: ['#E8E8E8', '#C0C0C0', '#A0A0A0'],
  cardBackground: ['rgba(26, 33, 56, 0.9)', 'rgba(20, 27, 45, 0.95)'],
  surfaceGlow: ['rgba(255, 215, 0, 0.05)', 'rgba(255, 215, 0, 0)'],
  bullishGlow: ['rgba(0, 230, 118, 0.15)', 'rgba(0, 230, 118, 0)'],
  bearishGlow: ['rgba(255, 82, 82, 0.15)', 'rgba(255, 82, 82, 0)'],
  darkFade: ['#0A0E1A', 'rgba(10, 14, 26, 0)'],
  headerOverlay: ['rgba(10, 14, 26, 0.95)', 'rgba(10, 14, 26, 0.6)', 'transparent'],
} as const;

// ─── Typography ──────────────────────────────────────────────────
export const Typography = {
  fonts: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    extraBold: 'Inter_800ExtraBold',
    mono: 'JetBrainsMono_400Regular',
    monoBold: 'JetBrainsMono_700Bold',
  },
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  lineHeights: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

// ─── Spacing ─────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

// ─── Border Radius ───────────────────────────────────────────────
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

// ─── Shadows ─────────────────────────────────────────────────────
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  }),
} as const;

// ─── Glass Effect ────────────────────────────────────────────────
export const GlassStyles = {
  card: {
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: BorderRadius.lg,
  },
  cardElevated: {
    backgroundColor: Colors.glassHighlight,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: BorderRadius.lg,
  },
  input: {
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: BorderRadius.md,
  },
} as const;

// ─── Animation ───────────────────────────────────────────────────
export const Animation = {
  fast: 150,
  normal: 300,
  slow: 500,
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  springBouncy: {
    damping: 10,
    stiffness: 200,
    mass: 0.8,
  },
} as const;

// ─── Layout ──────────────────────────────────────────────────────
export const Layout = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_WIDTH < 375,
  contentPadding: Spacing.base,
  tabBarHeight: Platform.OS === 'ios' ? 85 : 65,
  headerHeight: Platform.OS === 'ios' ? 100 : 80,
} as const;

// ─── Recommendation Colors ──────────────────────────────────────
export const RecommendationColors: Record<string, string> = {
  strong_buy: '#00E676',
  buy: '#66BB6A',
  accumulate: '#81C784',
  hold: '#FFD740',
  wait: '#FFA726',
  reduce: '#FF7043',
  sell: '#FF5252',
};

export const RecommendationLabels: Record<string, string> = {
  strong_buy: 'Strong Buy',
  buy: 'Buy',
  accumulate: 'Accumulate',
  hold: 'Hold',
  wait: 'Wait',
  reduce: 'Reduce',
  sell: 'Sell',
};
