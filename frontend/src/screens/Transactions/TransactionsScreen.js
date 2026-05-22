import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/axios';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import Chip from '../../components/UI/Chip';
import FinanzasInput from '../../components/UI/TextInput';
import { Colors, Typography, BorderRadius, Spacing, Shadows } from '../../theme/finansasTheme';

function formatMoney(n) {
  return '$' + Math.abs(Number(n)).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function prettyDate(dateStr) {
  if (!dateStr) return '';
  const d = dateStr.slice(0, 10);
  const [y, m, day] = d.split('-').map(Number);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dt = new Date(y, m - 1, day);
  const diff = Math.round((today - dt) / 86400000);
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff < 7) return `Hace ${diff} dias`;
  return `${day} ${months[m - 1]}`;
}

export default function TransactionsScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    categoria_id: null,
    cuenta_id: null,
    startDate: null,
    endDate: null,
  });
  const [filterCat, setFilterCat] = useState(null);
  const [filterAcc, setFilterAcc] = useState(null);
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  const fetchTransactions = async (appliedFilters = {}) => {
    try {
      const params = {};
      if (appliedFilters.categoria_id) params.categoria_id = appliedFilters.categoria_id;
      if (appliedFilters.cuenta_id) params.cuenta_id = appliedFilters.cuenta_id;
      if (appliedFilters.startDate) {
        const mes = appliedFilters.startDate.getMonth() + 1;
        const anio = appliedFilters.startDate.getFullYear();
        params.mes = mes;
        params.anio = anio;
      }
      const res = await api.get('/transactions', { params });
      setTransactions(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCategoriesAndAccounts = async () => {
    try {
      const [catRes, accRes] = await Promise.all([
        api.get('/categories'),
        api.get('/accounts'),
      ]);
      setCategories(catRes.data);
      setAccounts(accRes.data);
    } catch (error) {
      console.log('Error fetching categories/accounts:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      Promise.all([fetchCategoriesAndAccounts(), fetchTransactions(filters)])
        .finally(() => setLoading(false));
    }, [filters])
  );

  const handleDelete = (id) => {
    Alert.alert('Eliminar', '¿Eliminar esta transaccion?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/transactions/${id}`);
            fetchTransactions(filters);
          } catch {
            Alert.alert('Error', 'No se pudo eliminar');
          }
        },
      },
    ]);
  };

  const applyFilters = () => {
    setFilters({
      categoria_id: filterCat,
      cuenta_id: filterAcc,
      startDate: filterFrom ? new Date(filterFrom) : null,
      endDate: filterTo ? new Date(filterTo) : null,
    });
  };

  const clearFilters = () => {
    setFilterCat(null);
    setFilterAcc(null);
    setFilterFrom('');
    setFilterTo('');
    setFilters({ categoria_id: null, cuenta_id: null, startDate: null, endDate: null });
  };

  // Group transactions by date
  const grouped = transactions.reduce((acc, tx) => {
    const date = tx.fecha?.slice?.(0, 10) || tx.fecha;
    if (!acc[date]) acc[date] = [];
    acc[date].push(tx);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  // Summary chips data
  const totalIncome = transactions
    .filter((t) => t.tipo === 'ingreso')
    .reduce((s, t) => s + Number(t.monto), 0);
  const totalExpense = transactions
    .filter((t) => t.tipo === 'gasto')
    .reduce((s, t) => s + Number(t.monto), 0);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.money} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>{'‹'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setShowFilters(!showFilters)}
            activeOpacity={0.7}
          >
            <Text style={styles.filterIcon}>☰</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Transacciones</Text>
        <Text style={styles.subtitle}>{transactions.length} movimientos</Text>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <Card style={styles.filtersCard}>
            <View style={styles.filtersHeader}>
              <Text style={styles.filtersTitle}>FILTROS</Text>
              <TouchableOpacity onPress={clearFilters} activeOpacity={0.7}>
                <Text style={styles.clearText}>Limpiar</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.filterLabel}>CATEGORIA</Text>
            <View style={styles.chipsRow}>
              <Chip
                label="Todas"
                active={!filterCat}
                onPress={() => { setFilterCat(null); applyFilters(); }}
              />
              {categories.slice(0, 6).map((c) => (
                <Chip
                  key={c.id}
                  label={c.nombre}
                  active={filterCat === c.id}
                  onPress={() => { setFilterCat(c.id); }}
                />
              ))}
            </View>

            <Text style={styles.filterLabel}>CUENTA</Text>
            <View style={styles.chipsRow}>
              <Chip
                label="Todas"
                active={!filterAcc}
                onPress={() => { setFilterAcc(null); }}
              />
              {accounts.map((a) => (
                <Chip
                  key={a.id}
                  label={a.nombre}
                  active={filterAcc === a.id}
                  onPress={() => { setFilterAcc(a.id); }}
                />
              ))}
            </View>

            <View style={styles.dateRow}>
              <View style={{ flex: 1 }}>
                <FinanzasInput
                  label="Desde"
                  placeholder="YYYY-MM-DD"
                  value={filterFrom}
                  onChangeText={setFilterFrom}
                />
              </View>
              <View style={{ flex: 1 }}>
                <FinanzasInput
                  label="Hasta"
                  placeholder="YYYY-MM-DD"
                  value={filterTo}
                  onChangeText={setFilterTo}
                />
              </View>
            </View>

            <Button
              title="Aplicar filtros"
              variant="primary"
              size="sm"
              onPress={applyFilters}
              fullWidth
            />
          </Card>
        </View>
      )}

      {/* Quick Summary Chips */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryChip}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryCount}>{transactions.length}</Text>
        </View>
        <View style={[styles.summaryChip, { backgroundColor: Colors.moneySoft }]}>
          <Text style={[styles.summaryAmount, { color: Colors.money }]}>
            +{formatMoney(totalIncome)}
          </Text>
        </View>
        <View style={[styles.summaryChip, { backgroundColor: Colors.coralSoft }]}>
          <Text style={[styles.summaryAmount, { color: Colors.coral }]}>
            -{formatMoney(totalExpense)}
          </Text>
        </View>
      </View>

      {/* Transactions List */}
      <FlatList
        data={sortedDates}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: date }) => (
          <View style={styles.dateGroup}>
            <Text style={styles.dateLabel}>{prettyDate(date)}</Text>
            <Card style={styles.txGroupCard}>
              {grouped[date].map((tx, i) => {
                const isIncome = tx.tipo === 'ingreso';
                return (
                  <TouchableOpacity
                    key={tx.id}
                    style={[
                      styles.txRow,
                      i > 0 && styles.txRowBorder,
                    ]}
                    onPress={() => navigation.navigate('TransactionForm', { transactionId: tx.id })}
                    onLongPress={() => handleDelete(tx.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.txIcon, { backgroundColor: isIncome ? Colors.moneySoft : Colors.coralSoft }]}>
                      <Text style={styles.txIconText}>{isIncome ? '↗' : '↘'}</Text>
                    </View>
                    <View style={styles.txInfo}>
                      <Text style={styles.txDesc} numberOfLines={1}>
                        {tx.descripcion || 'Sin descripcion'}
                      </Text>
                      <Text style={styles.txMeta}>
                        {tx.categoria_nombre} · {tx.cuenta_nombre}
                      </Text>
                    </View>
                    <Text style={[styles.txAmount, { color: isIncome ? Colors.money : Colors.coral }]}>
                      {isIncome ? '+' : '-'}{formatMoney(tx.monto)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </Card>
          </View>
        )}
        ListEmptyComponent={
          <Card flat style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyTitle}>Sin transacciones</Text>
            <Text style={styles.emptySub}>No hay transacciones con estos filtros.</Text>
          </Card>
        }
        ListFooterComponent={
          <Text style={styles.hint}>
            Toca para editar · Manten presionado para eliminar
          </Text>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('TransactionForm')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>
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

  // Header
  header: {
    paddingHorizontal: Spacing.lg + 4,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  filterBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.backgroundWarm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    fontSize: 18,
    color: Colors.ink,
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
  },

  // Filters
  filtersPanel: {
    paddingHorizontal: Spacing.lg + 4,
    marginBottom: Spacing.lg,
  },
  filtersCard: {
    padding: 14,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  filtersTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.muted,
    letterSpacing: 0.8,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.coral,
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: Spacing.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },

  // Summary
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg + 4,
    marginBottom: Spacing.lg,
  },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundWarm,
    borderWidth: 1,
    borderColor: Colors.hairline2,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.ink,
  },
  summaryCount: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.muted,
    fontVariant: ['tabular-nums'],
  },
  summaryAmount: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // List
  listContent: {
    paddingHorizontal: Spacing.lg + 4,
    paddingBottom: 120,
  },
  dateGroup: {
    marginBottom: Spacing.lg,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  txGroupCard: {
    padding: 0,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  txRowBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.hairline2,
  },
  txIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txIconText: {
    fontSize: 18,
    fontWeight: '600',
  },
  txInfo: {
    flex: 1,
    minWidth: 0,
  },
  txDesc: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.ink,
  },
  txMeta: {
    fontSize: 11,
    color: Colors.muted,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
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
  },

  hint: {
    fontSize: 11,
    color: Colors.muted2,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.money,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
    shadowColor: Colors.money,
  },
  fabIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
    marginTop: -2,
  },
});
