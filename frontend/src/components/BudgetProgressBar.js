import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ALERT_COLORS = {
  ok: { bar: '#22c55e', bg: '#dcfce7', text: '#166534' },
  advertencia: { bar: '#f59e0b', bg: '#fef3c7', text: '#92400e' },
  excedido: { bar: '#ef4444', bg: '#fee2e2', text: '#991b1b' },
};

const ALERT_LABELS = {
  ok: 'Dentro del presupuesto',
  advertencia: 'Alerta: 80% del límite',
  excedido: 'Límite superado (100%+)',
};

export default function BudgetProgressBar({ gastado, limite, porcentaje, nivel_alerta }) {
  const colors = ALERT_COLORS[nivel_alerta] || ALERT_COLORS.ok;
  const width = Math.min(porcentaje, 100);

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.text }]}>{ALERT_LABELS[nivel_alerta]}</Text>
        <Text style={[styles.percent, { color: colors.text }]}>{porcentaje}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${width}%`, backgroundColor: colors.bar }]} />
      </View>
      <Text style={styles.amounts}>
        ${Number(gastado).toFixed(2)} / ${Number(limite).toFixed(2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { padding: 12, borderRadius: 8, marginTop: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 12, fontWeight: '600' },
  percent: { fontSize: 12, fontWeight: 'bold' },
  track: { height: 8, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  amounts: { fontSize: 11, color: '#555', marginTop: 6 },
});
