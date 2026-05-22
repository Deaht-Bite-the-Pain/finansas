import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme/finansasTheme';

export const globalStyles = StyleSheet.create({
  // Container base
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Spacing.lg,
  },

  scrollContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
  },

  // Buttons
  btnPrimary: {
    height: 52,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.ink,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.sm,
    ...Shadows.sm,
  },

  btnPrimaryText: {
    color: Colors.paper,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Typography.fontSans,
  },

  btnMoney: {
    height: 52,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.money,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.sm,
    ...Shadows.sm,
  },

  btnMoneyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Typography.fontSans,
  },

  btnDanger: {
    height: 52,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },

  btnGhost: {
    height: 52,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.hairline,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },

  // Inputs
  inputField: {
    height: 54,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.paper,
    borderWidth: 1.5,
    borderColor: Colors.hairline,
    borderRadius: BorderRadius.md,
    fontSize: 16,
    fontWeight: '500',
    fontFamily: Typography.fontSans,
    color: Colors.ink,
    marginVertical: Spacing.sm,
  },

  inputFieldError: {
    borderColor: Colors.coral,
    backgroundColor: '#FBF1EE',
  },

  // Cards
  card: {
    backgroundColor: Colors.paper,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.hairline2,
    padding: Spacing.lg,
    marginVertical: Spacing.sm,
    ...Shadows.sm,
  },

  cardFlat: {
    backgroundColor: Colors.backgroundWarm,
    borderWidth: 0,
    padding: Spacing.lg,
  },

  // Chips
  chip: {
    height: 30,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundWarm,
    borderWidth: 1,
    borderColor: Colors.hairline2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },

  chipActive: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },

  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.ink,
    fontFamily: Typography.fontSans,
  },

  chipTextActive: {
    color: Colors.paper,
  },

  // Typography
  h1: {
    fontSize: Typography.h1.fontSize,
    fontWeight: Typography.h1.fontWeight,
    color: Colors.ink,
    fontFamily: Typography.fontSans,
  },

  h2: {
    fontSize: Typography.h2.fontSize,
    fontWeight: Typography.h2.fontWeight,
    color: Colors.ink,
    fontFamily: Typography.fontSans,
  },

  h3: {
    fontSize: Typography.h3.fontSize,
    fontWeight: Typography.h3.fontWeight,
    color: Colors.ink,
    fontFamily: Typography.fontSans,
  },

  label: {
    fontSize: Typography.lbl.fontSize,
    fontWeight: Typography.lbl.fontWeight,
    color: Colors.muted,
    fontFamily: Typography.fontSans,
    textTransform: 'uppercase',
  },

  caption: {
    fontSize: Typography.cap.fontSize,
    fontWeight: Typography.cap.fontWeight,
    color: Colors.muted,
    fontFamily: Typography.fontSans,
  },

  body: {
    fontSize: Typography.body.fontSize,
    color: Colors.ink,
    fontFamily: Typography.fontSans,
    lineHeight: 21,
  },

  tiny: {
    fontSize: Typography.tiny.fontSize,
    color: Colors.muted2,
    fontFamily: Typography.fontSans,
  },

  // Money/Amounts (mono font)
  amountMono: {
    fontFamily: Typography.fontMono,
    fontWeight: '600',
    fontSize: 18,
    letterSpacing: -0.02,
  },

  amountMonoLarge: {
    fontFamily: Typography.fontMono,
    fontWeight: '700',
    fontSize: 32,
    letterSpacing: -0.03,
  },

  // Text colors
  textIncome: {
    color: Colors.money,
  },

  textExpense: {
    color: Colors.coral,
  },

  textDanger: {
    color: Colors.coral,
  },

  textMuted: {
    color: Colors.muted2,
  },

  // Dividers
  divider: {
    height: 1,
    backgroundColor: Colors.hairline,
    marginVertical: Spacing.md,
  },

  // Helpers
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  fullWidth: {
    width: '100%',
  },

  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default globalStyles;
