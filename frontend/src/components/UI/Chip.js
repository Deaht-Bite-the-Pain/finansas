import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '../../theme/finansasTheme';

export default function Chip({ label, active = false, onPress }) {
  const styles = StyleSheet.create({
    chip: {
      height: 30,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.full,
      backgroundColor: active ? Colors.ink : Colors.backgroundWarm,
      borderWidth: 1,
      borderColor: active ? Colors.ink : Colors.hairline2,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.sm,
      marginBottom: Spacing.sm,
    },

    text: {
      fontSize: 13,
      fontWeight: '500',
      color: active ? Colors.paper : Colors.ink,
      fontFamily: Typography.fontSans,
    },
  });

  return (
    <TouchableOpacity style={styles.chip} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}
