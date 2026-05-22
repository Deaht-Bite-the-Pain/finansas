import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '../../theme/finansasTheme';

export default function FinanzasInput({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  keyboardType = 'default',
  secureTextEntry = false,
  editable = true,
  multiline = false,
  numberOfLines = 1,
}) {
  const styles = StyleSheet.create({
    container: {
      marginBottom: Spacing.lg,
    },

    labelText: {
      fontSize: Typography.lbl.fontSize,
      fontWeight: Typography.lbl.fontWeight,
      color: Colors.muted,
      fontFamily: Typography.fontSans,
      textTransform: 'uppercase',
      marginBottom: Spacing.sm,
      paddingLeft: Spacing.sm,
    },

    input: {
      height: multiline ? 100 : 54,
      paddingHorizontal: Spacing.md,
      paddingVertical: multiline ? Spacing.md : 0,
      backgroundColor: Colors.paper,
      borderWidth: 1.5,
      borderColor: error ? Colors.coral : Colors.hairline,
      borderRadius: BorderRadius.md,
      fontSize: 16,
      fontWeight: '500',
      fontFamily: Typography.fontSans,
      color: Colors.ink,
      ...(error && { backgroundColor: '#FBF1EE' }),
    },

    errorText: {
      color: Colors.coral,
      fontSize: Typography.tiny.fontSize,
      fontWeight: '500',
      fontFamily: Typography.fontSans,
      marginTop: Spacing.sm,
      paddingLeft: Spacing.sm,
    },
  });

  return (
    <View style={styles.container}>
      {label && <Text style={styles.labelText}>{label}</Text>}
      <TextInput
        style={[styles.input, multiline && { textAlignVertical: 'top' }]}
        placeholder={placeholder}
        placeholderTextColor={Colors.muted2}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
