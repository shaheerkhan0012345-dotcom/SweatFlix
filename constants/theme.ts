export const Colors = {
  background: '#FFFFFF',
  primary: '#E5252A',
  primaryLight: '#FFF0F0',
  accent: '#FF8A1F',
  textDark: '#1A1A1A',
  textGrey: '#6B6B6B',
  cardLight: '#F5F5F5',
  cardBg: '#F5F5F5',
  cardBorder: '#EEEEEE',
  white: '#FFFFFF',
  tabActive: '#E5252A',
  tabInactive: '#6B6B6B',
  border: '#E0E0E0',
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  card: 18,
  button: 16,
  circle: 9999,
  full: 9999,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 30,
    header: 34,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
  h1: {
    fontSize: 28,
    fontWeight: '800' as const,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  h3: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
};

export const Theme = {
  colors: Colors,
  borderRadius: BorderRadius,
  spacing: Spacing,
  typography: Typography,
};

export default Theme;
