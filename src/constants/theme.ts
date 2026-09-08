import { Platform } from 'react-native';

import type { NoteColorId } from '@/lib/types';

export const Colors = {
  bg: '#F4F5F7',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#9CA3AF',
  textSoft: '#6B7280',
  border: '#E8EAED',
  borderLight: '#F0F1F3',
  primary: '#1A1A1A',
  primarySoft: '#F0F1F3',
  ink: '#1A1A1A',
  danger: '#E25C5C',
  dangerSoft: '#FDECEC',
  success: '#3DAB84',
  overlay: 'rgba(26, 26, 26, 0.32)',
} as const;

export const Pastels: Record<
  NoteColorId,
  { bg: string; accent: string; tagBg: string; icon: string }
> = {
  blue: { bg: '#D1E9FF', accent: '#5A9FD4', tagBg: 'rgba(255,255,255,0.6)', icon: '#3B7AB5' },
  pink: { bg: '#FFD1D1', accent: '#E07A74', tagBg: 'rgba(255,255,255,0.6)', icon: '#C45C56' },
  yellow: { bg: '#FFF9C4', accent: '#C9B03D', tagBg: 'rgba(255,255,255,0.6)', icon: '#A8942A' },
  lavender: { bg: '#E7DCFF', accent: '#8B74D4', tagBg: 'rgba(255,255,255,0.6)', icon: '#6F58B8' },
  mint: { bg: '#D3F3E7', accent: '#4EAE8A', tagBg: 'rgba(255,255,255,0.6)', icon: '#2F8F6E' },
  peach: { bg: '#FFE1C4', accent: '#E09A56', tagBg: 'rgba(255,255,255,0.6)', icon: '#C47A38' },
};

export const PASTEL_ORDER: NoteColorId[] = ['blue', 'pink', 'yellow', 'lavender', 'mint', 'peach'];

export const AccentDots = {
  yellow: '#F2E786',
  blue: '#86BEEF',
  red: '#F4B1B1',
} as const;

export const Radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const Spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Typography = {
  display: {
    fontSize: 28,
    fontWeight: '800' as const,
    letterSpacing: 0.6,
    lineHeight: 34,
  },
  section: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: 0,
    lineHeight: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 16,
  },
  tab: {
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0,
    lineHeight: 18,
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto-Medium',
    semibold: 'Roboto-Medium',
    bold: 'Roboto-Bold',
  },
  default: {
    regular: 'Inter, system-ui, sans-serif',
    medium: 'Inter, system-ui, sans-serif',
    semibold: 'Inter, system-ui, sans-serif',
    bold: 'Inter, system-ui, sans-serif',
  },
}) ?? {
  regular: 'system-ui',
  medium: 'system-ui',
  semibold: 'system-ui',
  bold: 'system-ui',
};

export const Shadow = Platform.select({
  ios: {
    card: {
      shadowColor: '#1A1A1A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
    },
    fab: {
      shadowColor: '#1A1A1A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
    },
  },
  android: {
    card: { elevation: 1 },
    fab: { elevation: 6 },
  },
  default: {
    card: {
      shadowColor: '#1A1A1A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
    },
    fab: {
      shadowColor: '#1A1A1A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 14,
    },
  },
}) ?? { card: {}, fab: {} };

export const Layout = {
  sidebarWidth: 260,
  maxContent: 1200,
  tabBarHeight: 64,
} as const;
