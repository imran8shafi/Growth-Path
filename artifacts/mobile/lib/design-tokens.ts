import { Easing } from 'react-native-reanimated';

export type ColorScheme = 'light' | 'dark';

export const designTokens = {
  colors: {
    light: {
      background: '#F4F0E8',
      backgroundElevated: '#FCFAF5',
      backgroundSubtle: '#EDE8DF',
      foreground: '#1B1D1A',
      foregroundMuted: '#687067',
      foregroundSubtle: '#9A9E96',

      primary: '#D97745',
      primaryHover: '#C4683B',
      primaryLight: '#F5E0D0',
      primaryForeground: '#1B1D1A',
      primaryGlow: 'rgba(217, 119, 69, 0.35)',

      secondary: '#8FA58A',
      secondaryHover: '#7D9079',
      secondaryLight: '#E8F0E6',
      secondaryForeground: '#1B1D1A',
      secondaryGlow: 'rgba(143, 165, 138, 0.35)',

      accent: '#E8B45B',
      accentHover: '#D4A04F',
      accentLight: '#FEF3E0',
      accentForeground: '#1B1D1A',
      accentGlow: 'rgba(232, 180, 91, 0.4)',

      success: '#2E8B57',
      successLight: '#E8F5E9',
      successForeground: '#FFFFFF',

      warning: '#D97745',
      warningLight: '#FFF3E0',
      warningForeground: '#1B1D1A',

      error: '#B8493D',
      errorLight: '#FDEDEC',
      errorForeground: '#FFFFFF',

      border: '#D8D1C3',
      borderLight: '#E8E3D8',
      borderFocus: '#D97745',

      card: '#FCFAF5',
      cardHover: '#F5F0E8',
      cardBorder: '#E8E3D8',

      sidebar: '#1B1D1A',
      sidebarForeground: '#F4F0E8',

      xp: '#E8B45B',
      xpGlow: 'rgba(232, 180, 91, 0.5)',
      streak: '#E7A07B',
      streakGlow: 'rgba(231, 160, 123, 0.5)',

      trackMind: '#D97745',
      trackBody: '#8FA58A',
      trackSoul: '#E8B45B',
      trackFreedom: '#D97745',

      overlay: 'rgba(27, 29, 26, 0.5)',
      scrim: 'rgba(27, 29, 26, 0.3)',
    },
    dark: {
      background: '#171A19',
      backgroundElevated: '#202521',
      backgroundSubtle: '#1E221F',
      foreground: '#F4F0E8',
      foregroundMuted: '#B7BBAF',
      foregroundSubtle: '#8A8E86',

      primary: '#E7A07B',
      primaryHover: '#F0B89A',
      primaryLight: '#3D2A1F',
      primaryForeground: '#171A19',
      primaryGlow: 'rgba(231, 160, 123, 0.4)',

      secondary: '#8FA58A',
      secondaryHover: '#A3BB9D',
      secondaryLight: '#1F2D1E',
      secondaryForeground: '#171A19',
      secondaryGlow: 'rgba(143, 165, 138, 0.4)',

      accent: '#E8B45B',
      accentHover: '#F0C87F',
      accentLight: '#3D331F',
      accentForeground: '#171A19',
      accentGlow: 'rgba(232, 180, 91, 0.5)',

      success: '#4CAF50',
      successLight: '#1B3D23',
      successForeground: '#171A19',

      warning: '#E7A07B',
      warningLight: '#3D2A1F',
      warningForeground: '#171A19',

      error: '#E26B5E',
      errorLight: '#3D1F1C',
      errorForeground: '#F4F0E8',

      border: '#3B4039',
      borderLight: '#2D332D',
      borderFocus: '#E7A07B',

      card: '#202521',
      cardHover: '#2A2F2A',
      cardBorder: '#333833',

      sidebar: '#101211',
      sidebarForeground: '#F4F0E8',

      xp: '#E8B45B',
      xpGlow: 'rgba(232, 180, 91, 0.6)',
      streak: '#E7A07B',
      streakGlow: 'rgba(231, 160, 123, 0.6)',

      trackMind: '#E7A07B',
      trackBody: '#8FA58A',
      trackSoul: '#E8B45B',
      trackFreedom: '#E7A07B',

      overlay: 'rgba(0, 0, 0, 0.6)',
      scrim: 'rgba(0, 0, 0, 0.4)',
    },
  },

  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    full: 999,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 40,
    xxxxl: 48,
  },

  typography: {
    sans: {
      regular: 'Inter_400Regular',
      medium: 'Inter_500Medium',
      semibold: 'Inter_600SemiBold',
      bold: 'Inter_700Bold',
    },
    mono: 'Menlo',
    scale: {
      xs: 11,
      sm: 13,
      base: 15,
      lg: 17,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
    },
    lineHeight: {
      tight: 1.1,
      normal: 1.5,
      relaxed: 1.7,
    },
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.5,
      wider: 1.5,
      widest: 2.5,
    },
  },

  animation: {
    duration: {
      instant: 0,
      fast: 120,
      normal: 200,
      slow: 300,
      slower: 400,
      slowest: 600,
      celebration: 800,
    },
    easing: {
      linear: Easing.linear,
      easeIn: Easing.in(Easing.cubic),
      easeOut: Easing.out(Easing.cubic),
      easeInOut: Easing.inOut(Easing.cubic),
      spring: Easing.out(Easing.cubic),
      bounce: Easing.out(Easing.cubic),
      smooth: Easing.out(Easing.cubic),
    },
    spring: {
      gentle: { damping: 20, stiffness: 150 },
      normal: { damping: 18, stiffness: 180 },
      snappy: { damping: 15, stiffness: 220 },
      bouncy: { damping: 12, stiffness: 180 },
      stiff: { damping: 25, stiffness: 280 },
    },
  },

  breakpoints: {
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1280,
  },

  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    modal: 300,
    popover: 400,
    tooltip: 500,
    toast: 600,
  },
} as const;

export type DesignTokens = typeof designTokens;

export function getTokens(scheme: ColorScheme) {
  return {
    colors: designTokens.colors[scheme],
    radius: designTokens.radius,
    spacing: designTokens.spacing,
    typography: designTokens.typography,
    animation: designTokens.animation,
    breakpoints: designTokens.breakpoints,
    zIndex: designTokens.zIndex,
  };
}