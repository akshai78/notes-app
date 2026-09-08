import { Platform } from 'react-native';

import type { NoteColorId } from '@/lib/types';

export const Colors = {
  bg: '#F5F6FB',
  surface: '#FFFFFF',
  text: '#14151A',
  textMuted: '#8B8E98',
  textSoft: '#5C5F6B',
  border: '#EAECF2',
  primary: '#6D5EF5',
  primarySoft: '#EEEDFE',
  ink: '#171717',
  danger: '#E25C5C',
  dangerSoft: '#FDECEC',
  success: '#3DAB84',
  overlay: 'rgba(16, 18, 28, 0.38)',
} as const;

export const Pastels: Record<
  NoteColorId,
  { bg: string; accent: string; tagBg: string; icon: string }
> = {
  blue: { bg: '#D7ECFF', accent: '#4F95D0', tagBg: 'rgba(255,255,255,0.55)', icon: '#3B7AB5' },
  pink: { bg: '#FFD7D3', accent: '#E07A74', tagBg: 'rgba(255,255,255,0.55)', icon: '#C45C56' },
  yellow: { bg: '#FFF1B8', accent: '#D1B03D', tagBg: 'rgba(255,255,255,0.55)', icon: '#B3942A' },
  lavender: { bg: '#E7DCFF', accent: '#8B74D4', tagBg: 'rgba(255,255,255,0.55)', icon: '#6F58B8' },
  mint: { bg: '#D3F3E7', accent: '#4EAE8A', tagBg: 'rgba(255,255,255,0.55)', icon: '#2F8F6E' },
  peach: { bg: '#FFE1C4', accent: '#E09A56', tagBg: 'rgba(255,255,255,0.55)', icon: '#C47A38' },
};

export const PASTEL_ORDER: NoteColorId[] = ['blue', 'pink', 'yellow', 'lavender', 'mint', 'peach'];

export const Radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
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
      shadowColor: '#1A1C2E',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.06,
      shadowRadius: 18,
    },
    fab: {
      shadowColor: '#171717',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.22,
      shadowRadius: 16,
    },
  },
  android: {
    card: { elevation: 3 },
    fab: { elevation: 8 },
  },
  default: {
    card: {
      shadowColor: '#1A1C2E',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.07,
      shadowRadius: 16,
    },
    fab: {
      shadowColor: '#171717',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.2,
      shadowRadius: 14,
    },
  },
}) ?? { card: {}, fab: {} };

export const Layout = {
  sidebarWidth: 248,
  maxContent: 1120,
  tabBarHeight: 64,
} as const;
