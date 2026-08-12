import { Platform, StatusBar } from 'react-native';

export const theme = {
  colors: {
    // ─── Rich Soulful Dark Theme (Matches Screenshots) ─────────────────
    darkBg:       '#0C0D16',   // deep dark night background
    darkSurface:  '#131422',   // raised dark surface
    darkCard:     '#171828',   // card container background
    darkBorder:   '#25273C',   // clean subtle divider border
    darkText:     '#F3F4F6',   // crisp off-white text
    darkMuted:    '#8B95A5',   // soulful slate grey
    darkInputBg:  '#12131F',   // dark input field bg

    // ─── Core Soulful Accent (Violet / Lilac / Indigo) ───────────────────
    primary:         '#8B5CF6',   // soulful rich violet
    primaryLight:    '#B084F9',   // soft periwinkle / lilac (matches FAB button)
    primaryDark:     '#6D28D9',   // deep royal indigo
    primaryBg:       '#221F38',   // dark violet tint background
    primaryText:     '#DDD6FE',

    // ─── Secondary Accent (Warm Olive-Lime — subtle & grounded) ─────────
    limePrimary:     '#84CC16',   // warm olive-lime
    limePrimaryDark: '#65A30D',
    limeText:        '#0E1008',
    limeBg:          '#1D2A12',

    // ─── App Light/Dark Surface System ──────────────────────────────────
    appBg:       '#0C0D16',
    cardWhite:   '#171828',
    cardBorder:  '#25273C',
    textDark:    '#F3F4F6',
    textMuted:   '#8B95A5',
    textLight:   '#6B7280',

    // ─── Category Tints (Soulful Muted Shades) ──────────────────────────
    tintBeige:       '#241E15',  tintBeigeIcon:  '#D97706',
    tintMint:        '#064E3B',  tintMintIcon:   '#34D399',
    tintPeach:       '#3A1C1A',  tintPeachIcon:  '#F87171',
    tintBlue:        '#1E293B',  tintBlueIcon:   '#60A5FA',
    tintPurple:      '#2E1065',  tintPurpleIcon: '#C4B5FD',
    tintGray:        '#1F2937',  tintGrayIcon:   '#9CA3AF',
    tintGold:        '#35260A',  tintGoldIcon:   '#FBBF24',
    tintTeal:        '#134E4A',  tintTealIcon:   '#2DD4BF',

    // ─── Status & Badges ────────────────────────────────────────────────
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

    // ─── Campaign card dark bg ──────────────────────────────────────────
    campaignCardBg:     '#171828',
    campaignCardBorder: '#25273C',
  },

  fonts: {
    regular:  'SourceSans3_400Regular',
    semibold: 'SourceSans3_600SemiBold',
    bold:     'SourceSans3_700Bold',
    display:  'SourceSans3_700Bold',
  },

  spacing: {
    xs:  4,
    sm:  8,
    md:  12,
    lg:  16,
    xl:  20,
    xxl: 28,
  },

  safeTopPadding: Platform.OS === 'ios' ? 48 : (StatusBar.currentHeight || 24) + 8,

  radius: {
    sm:   8,
    md:   14,
    lg:   20,
    xl:   26,
    full: 9999,
  },

  shadows: {
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
  },
};
