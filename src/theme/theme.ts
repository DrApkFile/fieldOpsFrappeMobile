import { Platform, StatusBar } from 'react-native';

export type ThemeMode = 'light' | 'dark';

// Note: several keys below keep their historical "dark*"/"light-ish" names
// (darkBg, darkText, cardWhite, textDark, ...) even though their values now
// flip with the active mode — the whole app was originally built dark-only
// and every screen already reads these exact keys, so remapping the values
// per mode (instead of renaming ~650 call sites) is what makes theme
// switching safe to do in one pass.
export interface ThemeColors {
  darkBg: string; darkSurface: string; darkCard: string; darkBorder: string;
  darkText: string; darkMuted: string; darkInputBg: string;

  primary: string; primaryLight: string; primaryDark: string; primaryBg: string; primaryText: string;

  limePrimary: string; limePrimaryDark: string; limeText: string; limeBg: string;

  appBg: string; cardWhite: string; cardBorder: string;
  textDark: string; textMuted: string; textLight: string;

  tintBeige: string; tintBeigeIcon: string;
  tintMint: string; tintMintIcon: string;
  tintPeach: string; tintPeachIcon: string;
  tintBlue: string; tintBlueIcon: string;
  tintPurple: string; tintPurpleIcon: string;
  tintGray: string; tintGrayIcon: string;
  tintGold: string; tintGoldIcon: string;
  tintTeal: string; tintTealIcon: string;

  visitedBg: string; visitedText: string;
  skippedBg: string; skippedText: string;
  pendingBg: string; pendingText: string;

  teal: string; tealLight: string;
  emerald: string; emeraldLight: string;
  amber: string; amberLight: string;
  red: string; redLight: string;

  campaignCardBg: string; campaignCardBorder: string;
}

// ─── Brand navy — fixed across both themes ───────────────────────────────────
const BRAND_NAVY = '#1E3A8A';

export const darkColors: ThemeColors = {
  darkBg:       '#0C0D16',
  darkSurface:  '#131422',
  darkCard:     '#171828',
  darkBorder:   '#25273C',
  darkText:     '#F3F4F6',
  darkMuted:    '#8B95A5',
  darkInputBg:  '#12131F',

  primary:      BRAND_NAVY,
  primaryLight: '#5B7FDB',
  primaryDark:  '#14265C',
  primaryBg:    '#1B2340',
  primaryText:  '#C7D2FE',

  limePrimary:     '#84CC16',
  limePrimaryDark: '#65A30D',
  limeText:        '#0E1008',
  limeBg:          '#1D2A12',

  appBg:       '#0C0D16',
  cardWhite:   '#171828',
  cardBorder:  '#25273C',
  textDark:    '#F3F4F6',
  textMuted:   '#8B95A5',
  textLight:   '#6B7280',

  tintBeige:       '#241E15',  tintBeigeIcon:  '#D97706',
  tintMint:        '#064E3B',  tintMintIcon:   '#34D399',
  tintPeach:       '#3A1C1A',  tintPeachIcon:  '#F87171',
  tintBlue:        '#1E293B',  tintBlueIcon:   '#60A5FA',
  tintPurple:      '#1E2A5E',  tintPurpleIcon: '#93A5F0',
  tintGray:        '#1F2937',  tintGrayIcon:   '#9CA3AF',
  tintGold:        '#35260A',  tintGoldIcon:   '#FBBF24',
  tintTeal:        '#134E4A',  tintTealIcon:   '#2DD4BF',

  visitedBg:     '#064E3B',  visitedText:   '#34D399',
  skippedBg:     '#451A03',  skippedText:   '#F59E0B',
  pendingBg:     '#1F2937',  pendingText:   '#9CA3AF',

  teal:        '#10B981',
  tealLight:   '#064E3B',
  emerald:     '#10B981',
  emeraldLight:'#064E3B',
  amber:       '#F59E0B',
  amberLight:  '#451A03',
  red:         '#EF4444',
  redLight:    '#451212',

  campaignCardBg:     '#171828',
  campaignCardBorder: '#25273C',
};

export const lightColors: ThemeColors = {
  darkBg:       '#F7F8FC',
  darkSurface:  '#EEF0F6',
  darkCard:     '#FFFFFF',
  darkBorder:   '#E2E5EE',
  darkText:     '#1E2233',
  darkMuted:    '#67708A',
  darkInputBg:  '#F4F5F9',

  primary:      BRAND_NAVY,
  primaryLight: '#3B5BC4',
  primaryDark:  '#132A66',
  primaryBg:    '#E7EBFA',
  primaryText:  '#1E3A8A',

  limePrimary:     '#65A30D',
  limePrimaryDark: '#4D7C0F',
  limeText:        '#1A2E05',
  limeBg:          '#ECFCCB',

  appBg:       '#F7F8FC',
  cardWhite:   '#FFFFFF',
  cardBorder:  '#E2E5EE',
  textDark:    '#1E2233',
  textMuted:   '#67708A',
  textLight:   '#94A0B8',

  tintBeige:       '#FEF3E2',  tintBeigeIcon:  '#B45309',
  tintMint:        '#D1FAE5',  tintMintIcon:   '#059669',
  tintPeach:       '#FEE2E2',  tintPeachIcon:  '#DC2626',
  tintBlue:        '#DBEAFE',  tintBlueIcon:   '#2563EB',
  tintPurple:      '#E0E7FF',  tintPurpleIcon: '#3730A3',
  tintGray:        '#F1F5F9',  tintGrayIcon:   '#64748B',
  tintGold:        '#FEF3C7',  tintGoldIcon:   '#B45309',
  tintTeal:        '#CCFBF1',  tintTealIcon:   '#0F766E',

  visitedBg:     '#D1FAE5',  visitedText:   '#059669',
  skippedBg:     '#FEF3C7',  skippedText:   '#B45309',
  pendingBg:     '#F1F5F9',  pendingText:   '#64748B',

  teal:        '#0D9488',
  tealLight:   '#CCFBF1',
  emerald:     '#059669',
  emeraldLight:'#D1FAE5',
  amber:       '#D97706',
  amberLight:  '#FEF3C7',
  red:         '#DC2626',
  redLight:    '#FEE2E2',

  campaignCardBg:     '#FFFFFF',
  campaignCardBorder: '#E2E5EE',
};

export const fonts = {
  regular:  'SourceSans3_400Regular',
  semibold: 'SourceSans3_600SemiBold',
  bold:     'SourceSans3_700Bold',
  display:  'SourceSans3_700Bold',
};

export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 28,
};

export const safeTopPadding = Platform.OS === 'ios' ? 48 : (StatusBar.currentHeight || 24) + 8;

export const radius = {
  sm:   8,
  md:   14,
  lg:   20,
  xl:   26,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
};

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  fonts: typeof fonts;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
  safeTopPadding: number;
}

export function buildTheme(mode: ThemeMode): Theme {
  return {
    mode,
    colors: mode === 'dark' ? darkColors : lightColors,
    fonts,
    spacing,
    radius,
    shadows,
    safeTopPadding,
  };
}

// Static default (dark) kept only for the brief pre-ThemeProvider render in App.tsx.
export const theme: Theme = buildTheme('dark');
