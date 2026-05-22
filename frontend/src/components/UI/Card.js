import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows } from '../../theme/finansasTheme';

export default function Card({ children, flat = false, style }) {
  const styles = StyleSheet.create({
    card: {
      backgroundColor: flat ? Colors.backgroundWarm : Colors.paper,
      borderRadius: BorderRadius.md,
      borderWidth: flat ? 0 : 1,
      borderColor: flat ? 'transparent' : Colors.hairline2,
      padding: Spacing.lg,
      marginVertical: Spacing.sm,
      ...(flat ? {} : Shadows.sm),
    },
  });

  return <View style={[styles.card, style]}>{children}</View>;
}
