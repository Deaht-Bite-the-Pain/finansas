import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Typography, BorderRadius, Shadows, Spacing } from '../../theme/finansasTheme';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  disabled = false,
  loading = false,
  icon = null,
}) {
  const styles = StyleSheet.create({
    button: {
      height: size === 'sm' ? 36 : 52,
      paddingHorizontal: Spacing.lg,
      borderRadius: size === 'sm' ? BorderRadius.sm : BorderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      gap: Spacing.sm,
      ...(fullWidth && { width: '100%' }),
      ...(variant === 'primary' && {
        backgroundColor: Colors.ink,
        ...Shadows.sm,
      }),
      ...(variant === 'money' && {
        backgroundColor: Colors.money,
        ...Shadows.sm,
      }),
      ...(variant === 'danger' && {
        backgroundColor: Colors.coral,
      }),
      ...(variant === 'ghost' && {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: Colors.hairline,
      }),
      ...(variant === 'soft' && {
        backgroundColor: Colors.backgroundWarm,
      }),
      ...(disabled && { opacity: 0.5 }),
    },

    text: {
      fontSize: size === 'sm' ? 13 : 16,
      fontWeight: '600',
      fontFamily: Typography.fontSans,
      ...(variant === 'primary' && { color: Colors.paper }),
      ...(variant === 'money' && { color: '#fff' }),
      ...(variant === 'danger' && { color: '#fff' }),
      ...(variant === 'ghost' && { color: Colors.ink }),
      ...(variant === 'soft' && { color: Colors.ink }),
    },
  });

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'money' ? Colors.paper : Colors.ink}
          size={size === 'sm' ? 'small' : 'small'}
        />
      ) : (
        <>
          {icon && icon}
          <Text style={styles.text}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
