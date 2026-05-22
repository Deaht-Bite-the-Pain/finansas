/**
 * FINANSAS · Design Tokens
 * Sistema de colores, tipografía y espaciamiento
 */

export const Colors = {
  // Surfaces
  background: '#F2EDE2',     // Crema cálida
  backgroundWarm: '#ECE5D5',
  paper: '#FFFEFB',          // Blanco hueso

  // Text
  ink: '#0E1A1F',            // Negro principal
  ink2: '#1C2A30',
  muted: '#6B7A82',
  muted2: '#9AA6AC',

  // Borders
  hairline: 'rgba(14,26,31,0.10)',
  hairline2: 'rgba(14,26,31,0.06)',

  // Brand
  primary: '#0E1A1F',        // Negro principal
  primary2: '#1A2B33',

  // Money (Income/Green)
  money: '#1B5E3F',          // Verde dinero profundo
  money2: '#2D8F5F',
  moneySoft: '#C6E3D2',

  // Danger/Expense (Coral)
  coral: '#C95543',          // Coral para gastos
  coral2: '#E07863',
  coralSoft: '#F1CFC4',

  // Secondary (Gold/Savings)
  gold: '#C7912A',
  gold2: '#E0A93A',
  goldSoft: '#F0DDA8',

  // Tertiary
  sky: '#2F5E8A',
  skySoft: '#CBDCEB',
  violet: '#5A4781',
  violetSoft: '#DAD0E6',
};

export const Typography = {
  // Fonts
  fontSans: 'Geist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  fontMono: 'Geist Mono, ui-monospace, SFMono-Regular, monospace',

  // Sizes
  h1: { fontSize: 32, fontWeight: '600', lineHeight: 1.05 },
  h2: { fontSize: 26, fontWeight: '600', lineHeight: 1.1 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 1.15 },
  lbl: { fontSize: 12, fontWeight: '500' },
  cap: { fontSize: 13, fontWeight: '500' },
  body: { fontSize: 15, lineHeight: 1.4 },
  tiny: { fontSize: 11 },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  full: 999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
};

export default theme;
