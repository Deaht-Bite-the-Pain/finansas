import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/axios';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import { Colors, Typography, BorderRadius, Spacing, Shadows } from '../../theme/finansasTheme';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function formatMoney(n) {
  return '$' + Math.abs(Number(n)).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Animated progress bar with shimmer
function BudgetBar({ percentage, status }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.min(percentage, 100),
      duration: 900,
      delay: 100,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const width = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const barColor =
    status === 'excedido' ? Colors.coral :
    status === 'advertencia' ? Colors.gold2 :
    Colors.money;

  return (
    <View style={styles.barTrack}>
      <Animated.View style={[styles.barFill, { width, backgroundColor: barColor }]} />
    </View>
  );
}

// Budget card with status coloring
function BudgetCard({ item, onPress, onLongPress }) {
  const pct = Number(item.porcentaje) || 0;
  const gastado = Number(item.gastado) || 0;
  const limite = Number(item.limite) || 0;
  const status = item.nivel_alerta || 'ok';

  const statusConfig = {
    ok: {
      label: 'Dentro del presupuesto',
      chipBg: Colors.moneySoft,
      chipColor: '#0d3d28',
    },
    advertencia: {
      label: 'Alerta · 80% del limite',
      chipBg: Colors.goldSoft,
      chipColor: '#5C4612',
    },
    excedido: {
      label: 'Limite superado!',
      chipBg: Colors.coralSoft,
      chipColor: '#6C2418',
    },
  };

  const cfg = statusConfig[status] || statusConfig.ok;
  const pctColor =
    status === 'excedido' ? Colors.coral :
    status === 'advertencia' ? Colors.gold :
    Colors.money;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <Card style={styles.budgetCard}>
        <View style={styles.budgetHeader}>
          <Text style={styles.budgetName}>{item.categoria_nombre}</Text>
          <View style={[styles.statusChip, { backgroundColor: cfg.chipBg }]}>
            <Text style={[styles.statusText, { color: cfg.chipColor }]}>
              {cfg.label}
            </Text>
          </View>
        </View>
        <Text style={styles.budgetLimit}>
          Limite: {formatMoney(limite)}
        </Text>

        <BudgetBar percentage={pct} status={status} />

        <View style={styles.budgetFooter}>
          <Text style={styles.budgetSpent}>
            {formatMoney(gastado)}
            <Text style={styles.budgetSpentTotal}> / {formatMoney(limite)}</Text>
          </Text>
          <Text style={[styles.budgetPct, { color: pctColor }]}>
            {pct.toFixed(1)}%
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export default function BudgetsScreen({ navigation }) {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [anio, setAnio] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/budgets', { params: { mes, anio } });
      setBudgets(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (delta) => {
    let newMes = mes + delta;
    let newAnio = anio;
    if (newMes > 12) { newMes = 1; newAnio += 1; }
    else if (newMes < 1) { newMes = 12; newAnio -= 1; }
    setMes(newMes);
    setAnio(newAnio);
  };

  const handleDelete = (id) => {
    Alert.alert('Eliminar', '¿Eliminar este presupuesto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/budgets/${id}`);
            fetchBudgets();
          } catch {
            Alert.alert('Error', 'No se pudo eliminar');
          }
        },
      },
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      fetchBudgets();
    }, [mes, anio])
  );

  const totalLimite = budgets.reduce((s, b) => s + Number(b.limite), 0);
  const totalGastado = budgets.reduce((s, b) => s + Number(b.gastado || 0), 0);
  const globalPct = totalLimite > 0 ? (totalGastado / totalLimite) * 100 : 0;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.money} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={budgets}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <Text style={styles.backText}>{'‹'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.title}>Presupuestos</Text>
            <Text style={styles.subtitle}>Controla tus limites mensuales</Text>

            {/* Month Navigator */}
            <View style={styles.monthNav}>
              <TouchableOpacity
                style={styles.monthBtn}
                onPress={() => changeMonth(-1)}
                activeOpacity={0.7}
              >
                <Text style={styles.monthBtnText}>{'‹'}</Text>
              </TouchableOpacity>
              <View style={styles.monthCenter}>
                <Text style={styles.monthLabel}>MES ACTUAL</Text>
                <Text style={styles.monthValue}>{MONTHS[mes - 1]} {anio}</Text>
              </View>
              <TouchableOpacity
                style={styles.monthBtn}
                onPress={() => changeMonth(1)}
                activeOpacity={0.7}
              >
                <Text style={styles.monthBtnText}>{'›'}</Text>
              </TouchableOpacity>
            </View>

            {/* Overall Progress */}
            {budgets.length > 0 && (
              <Card style={styles.overviewCard}>
                <View style={styles.overviewRow}>
                  <View>
                    <Text style={styles.overviewLabel}>CONSUMIDO</Text>
                    <Text style={styles.overviewAmount}>
                      {formatMoney(totalGastado)}
                      <Text style={styles.overviewTotal}> / {formatMoney(totalLimite)}</Text>
                    </Text>
                  </View>
                  <View style={styles.overviewRight}>
                    <Text style={styles.overviewLabel}>DISPONIBLE</Text>
                    <Text style={[styles.overviewAvailable, { color: Colors.money }]}>
                      {formatMoney(Math.max(0, totalLimite - totalGastado))}
                    </Text>
                  </View>
                </View>
                <BudgetBar percentage={globalPct} status={globalPct >= 100 ? 'excedido' : globalPct >= 80 ? 'advertencia' : 'ok'} />
              </Card>
            )}

            {/* Create Button */}
            <View style={styles.createBtn}>
              <Button
                title="＋ Configurar presupuesto"
                variant="primary"
                onPress={() => navigation.navigate('BudgetForm', { mes, anio })}
                fullWidth
              />
            </View>
          </>
        }
        renderItem={({ item }) => (
          <BudgetCard
            item={item}
            onPress={() => navigation.navigate('BudgetForm', { budgetId: item.id, mes, anio })}
            onLongPress={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          <Card flat style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📈</Text>
            <Text style={styles.emptyTitle}>Sin presupuestos</Text>
            <Text style={styles.emptySub}>
              No hay presupuestos para este mes. Crea uno por categoria de gasto.
            </Text>
          </Card>
        }
        ListFooterComponent={
          budgets.length > 0 ? (
            <Text style={styles.hint}>
              Toca para editar · Manten presionado para eliminar
            </Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingHorizontal: Spacing.lg + 4,
    paddingTop: 60,
    paddingBottom: Spacing.xxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.backgroundWarm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 24,
    fontWeight: '300',
    color: Colors.ink,
    marginTop: -2,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: Colors.ink,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.muted,
    marginTop: 4,
    marginBottom: Spacing.xl,
  },

  // Month Nav
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.paper,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.hairline2,
    padding: 6,
    marginBottom: Spacing.xl,
  },
  monthBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.backgroundWarm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthBtnText: {
    fontSize: 22,
    fontWeight: '300',
    color: Colors.ink,
  },
  monthCenter: {
    alignItems: 'center',
  },
  monthLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  monthValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.ink,
    marginTop: 2,
  },

  // Overview
  overviewCard: {
    padding: 16,
    marginBottom: Spacing.xl,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  overviewLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  overviewAmount: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.ink,
    fontVariant: ['tabular-nums'],
    marginTop: 4,
  },
  overviewTotal: {
    fontSize: 14,
    color: Colors.muted,
    fontWeight: '500',
  },
  overviewRight: {
    alignItems: 'flex-end',
  },
  overviewAvailable: {
    fontSize: 18,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    marginTop: 4,
  },

  // Budget Card
  budgetCard: {
    padding: 16,
    marginBottom: Spacing.md,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  budgetName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.ink,
    flex: 1,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  budgetLimit: {
    fontSize: 12,
    color: Colors.muted,
    marginBottom: Spacing.md,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: Spacing.md,
  },
  budgetSpent: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.ink,
    fontVariant: ['tabular-nums'],
  },
  budgetSpentTotal: {
    color: Colors.muted,
    fontWeight: '500',
  },
  budgetPct: {
    fontSize: 18,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // Progress bar
  barTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.backgroundWarm,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },

  // Create button
  createBtn: {
    marginBottom: Spacing.lg,
  },

  // Empty
  emptyCard: {
    alignItems: 'center',
    padding: 28,
  },
  emptyEmoji: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontWeight: '600',
    color: Colors.ink,
    fontSize: 16,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.muted,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 260,
  },

  hint: {
    fontSize: 11,
    color: Colors.muted2,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
});
