import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing } from '../theme/finansasTheme';

const ALERT_COLORS = {
  ok: { bar: Colors.money, chipBg: Colors.moneySoft, chipColor: '#0d3d28' },
  advertencia: { bar: Colors.gold2, chipBg: Colors.goldSoft, chipColor: '#5C4612' },
  excedido: { bar: Colors.coral, chipBg: Colors.coralSoft, chipColor: '#6C2418' },
};

const ALERT_LABELS = {
  ok: 'Dentro del presupuesto',
  advertencia: 'Alerta: 80% del limite',
  excedido: 'Limite superado (100%+)',
};

export default function BudgetProgressBar({ gastado, limite, porcentaje, nivel_alerta }) {
  const colors = ALERT_COLORS[nivel_alerta] || ALERT_COLORS.ok;
  const pct = Math.min(Number(porcentaje) || 0, 100);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct,
      duration: 900,
      delay: 100,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const width = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.chipBg }]}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.chipColor }]}>
          {ALERT_LABELS[nivel_alerta]}
        </Text>
        <Text style={[styles.percent, { color: colors.chipColor }]}>
          {porcentaje}%
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[styles.fill, { width, backgroundColor: colors.bar }]}
        />
      </View>
      <Text style={styles.amounts}>
        ${Number(gastado).toFixed(2)} / ${Number(limite).toFixed(2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 14,
    borderRadius: 14,
    marginTop: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  percent: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
  amounts: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: Spacing.sm,
    fontVariant: ['tabular-nums'],
  },
});
