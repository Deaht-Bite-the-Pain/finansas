import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import api from '../../api/axios';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import Chip from '../../components/UI/Chip';
import {
  Colors,
  Typography,
  BorderRadius,
  Spacing,
  Shadows,
} from '../../theme/finansasTheme';

const screenWidth = Dimensions.get('window').width;
const CHART_WIDTH = screenWidth - Spacing.lg * 2 - Spacing.lg * 2;

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const PIE_COLORS = [Colors.coral, Colors.gold, Colors.money, Colors.sky, Colors.violet];

const ACCOUNT_ICONS = {
  Efectivo: { bg: Colors.moneySoft, emoji: '💵' },
  Banco: { bg: Colors.skySoft, emoji: '🏦' },
  Tarjeta: { bg: Colors.violetSoft, emoji: '💳' },
  Ahorros: { bg: Colors.goldSoft, emoji: '💰' },
};

const CATEGORY_COLORS = [
  Colors.coral, Colors.gold, Colors.money, Colors.sky, Colors.violet,
  Colors.coral2, Colors.gold, Colors.money2, Colors.sky, Colors.violet,
];

function formatMoney(n) {
  return '$' + Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Animated progress bar component
function CategoryProgressBar({ percentage, color, delay }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.min(percentage, 100),
      duration: 700,
      delay: delay || 0,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const width = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, { width, backgroundColor: color }]} />
    </View>
  );
}

export default function DashboardScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroScale = useRef(new Animated.Value(0.92)).current;

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const mes = now.getMonth() + 1;
      const anio = now.getFullYear();

      const txRes = await api.get('/transactions', {
        params: { mes, anio },
      });

      const transactions = txRes.data;

      let totalIncome = 0;
      let totalExpense = 0;
      const expensesByCategory = {};

      transactions.forEach((tx) => {
        const amount = Number(tx.monto);
        if (tx.tipo === 'ingreso') {
          totalIncome += amount;
        } else {
          totalExpense += amount;
          const categoryName = tx.categoria_nombre;
          expensesByCategory[categoryName] =
            (expensesByCategory[categoryName] || 0) + amount;
        }
      });

      const balance = totalIncome - totalExpense;

      setSummary({ totalIncome, totalExpense, balance, mes, anio });

      const expensesArray = Object.entries(expensesByCategory)
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      setExpenses(expensesArray);

      const accRes = await api.get('/accounts');
      setAccounts(accRes.data);
    } catch (error) {
      console.log('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
      Animated.parallel([
        Animated.timing(heroOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(heroScale, {
          toValue: 1,
          tension: 60,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.money} />
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No se pudo cargar el dashboard</Text>
      </View>
    );
  }

  const isPositive = summary.balance >= 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola {'👋'}</Text>
        <Text style={styles.monthTitle}>
          {MONTH_NAMES[summary.mes - 1]} {summary.anio}
        </Text>
      </View>

      {/* ── Hero Balance Card ── */}
      <Animated.View
        style={[
          styles.heroCard,
          { opacity: heroOpacity, transform: [{ scale: heroScale }] },
        ]}
      >
        {/* Decorative circles */}
        <View style={styles.heroDecoA} />
        <View style={styles.heroDecoB} />

        <Text style={styles.heroLabel}>SALDO NETO DEL MES</Text>

        <View style={styles.heroChipRow}>
          <View
            style={[
              styles.heroBadge,
              { backgroundColor: isPositive ? Colors.money : Colors.coral },
            ]}
          >
            <Text style={styles.heroBadgeText}>
              {isPositive ? 'Positivo' : 'Negativo'}
            </Text>
          </View>
        </View>

        <Text style={styles.heroAmount}>{formatMoney(summary.balance)}</Text>

        <View style={styles.heroDivider} />

        <View style={styles.heroFooter}>
          <View style={styles.heroFooterCol}>
            <View style={styles.heroFooterLabelRow}>
              <View style={[styles.heroDot, { backgroundColor: Colors.money2 }]} />
              <Text style={styles.heroFooterLabel}>Ingresos</Text>
            </View>
            <Text style={styles.heroFooterAmount}>
              {formatMoney(summary.totalIncome)}
            </Text>
          </View>
          <View style={styles.heroFooterCol}>
            <View style={[styles.heroFooterLabelRow, { justifyContent: 'flex-end' }]}>
              <View style={[styles.heroDot, { backgroundColor: Colors.coral2 }]} />
              <Text style={styles.heroFooterLabel}>Gastos</Text>
            </View>
            <Text style={[styles.heroFooterAmount, { textAlign: 'right' }]}>
              {formatMoney(summary.totalExpense)}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* ── Bar Chart ── */}
      {(summary.totalIncome > 0 || summary.totalExpense > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingresos vs Gastos</Text>
          <Card>
            <BarChart
              data={{
                labels: ['Ingresos', 'Gastos'],
                datasets: [
                  { data: [summary.totalIncome, summary.totalExpense] },
                ],
              }}
              width={CHART_WIDTH}
              height={220}
              yAxisLabel="$"
              chartConfig={{
                backgroundColor: Colors.paper,
                backgroundGradientFrom: Colors.paper,
                backgroundGradientTo: Colors.paper,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(27, 94, 63, ${opacity})`,
                labelColor: () => Colors.muted,
                barPercentage: 0.6,
                style: { borderRadius: BorderRadius.md },
                fillShadowGradientFrom: Colors.money,
                fillShadowGradientTo: Colors.money2,
                fillShadowGradientFromOpacity: 1,
                fillShadowGradientToOpacity: 0.6,
              }}
              style={{ marginVertical: Spacing.sm, borderRadius: BorderRadius.md }}
              fromZero
            />
          </Card>
        </View>
      )}

      {/* ── Accounts Horizontal Scroll ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Saldo por Cuenta</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Accounts')}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAll}>Ver todas →</Text>
          </TouchableOpacity>
        </View>

        {accounts.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.accountsRow}
          >
            {accounts.map((account) => {
              const saldo = Number(account.saldo);
              const isNeg = saldo < 0;
              const iconInfo =
                ACCOUNT_ICONS[account.tipo] || ACCOUNT_ICONS.Banco;

              return (
                <View key={account.id} style={styles.accountCard}>
                  <View
                    style={[
                      styles.accountIconBox,
                      { backgroundColor: iconInfo.bg },
                    ]}
                  >
                    <Text style={styles.accountEmoji}>{iconInfo.emoji}</Text>
                  </View>
                  <Text style={styles.accountName} numberOfLines={1}>
                    {account.nombre}
                  </Text>
                  <Text style={styles.accountType}>
                    {isNeg ? 'Deuda' : 'Disponible'}
                  </Text>
                  <Text
                    style={[
                      styles.accountBalance,
                      { color: isNeg ? Colors.coral : Colors.ink },
                    ]}
                  >
                    {formatMoney(saldo)}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <Card flat>
            <Text style={styles.emptyText}>
              Sin cuentas aún. Crea una para empezar.
            </Text>
          </Card>
        )}
      </View>

      {/* ── Pie Chart ── */}
      {expenses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distribución de Gastos</Text>
          <Card>
            <PieChart
              data={expenses.slice(0, 5).map((exp, i) => ({
                name: exp.category.length > 10
                  ? exp.category.substring(0, 10) + '…'
                  : exp.category,
                population: parseFloat(exp.amount.toFixed(2)),
                color: PIE_COLORS[i % PIE_COLORS.length],
                legendFontColor: Colors.ink,
                legendFontSize: 12,
              }))}
              width={CHART_WIDTH}
              height={220}
              chartConfig={{
                color: () => Colors.muted,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft={0}
              style={{ marginVertical: Spacing.sm, borderRadius: BorderRadius.md }}
            />
          </Card>
          {expenses.length > 5 && (
            <Text style={styles.chartNote}>
              Mostrando top 5 de {expenses.length} categorías
            </Text>
          )}
        </View>
      )}

      {/* ── Category Breakdown ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gastos por Categoría</Text>
        {expenses.length > 0 ? (
          expenses.map((exp, i) => {
            const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
            return (
              <Card key={i} flat style={styles.categoryCard}>
                <View style={styles.categoryRow}>
                  <View style={styles.categoryLeft}>
                    <View style={[styles.categoryDot, { backgroundColor: color }]} />
                    <Text style={styles.categoryName}>{exp.category}</Text>
                  </View>
                  <View style={styles.categoryRight}>
                    <Text style={styles.categoryAmount}>
                      {formatMoney(exp.amount)}
                    </Text>
                    <Text style={styles.categoryPct}>
                      {exp.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
                <CategoryProgressBar
                  percentage={exp.percentage}
                  color={color}
                  delay={i * 80}
                />
              </Card>
            );
          })
        ) : (
          <Card flat>
            <Text style={styles.emptyText}>Sin gastos registrados este mes</Text>
          </Card>
        )}
      </View>

      {/* ── Navigation Buttons ── */}
      <View style={styles.buttonsRow}>
        <View style={styles.buttonHalf}>
          <Button
            title="Ver Transacciones"
            variant="primary"
            onPress={() => navigation.navigate('Transactions')}
            fullWidth
          />
        </View>
        <View style={styles.buttonHalf}>
          <Button
            title="Ver Presupuestos"
            variant="money"
            onPress={() => navigation.navigate('Budgets')}
            fullWidth
          />
        </View>
      </View>

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.muted,
    marginBottom: Spacing.xs,
  },
  monthTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.ink,
  },

  // Hero Card
  heroCard: {
    backgroundColor: Colors.ink,
    borderRadius: 24,
    padding: 22,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  heroDecoA: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  heroDecoB: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  heroChipRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  heroBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  heroAmount: {
    fontSize: 38,
    fontWeight: '600',
    color: '#fff',
    fontVariant: ['tabular-nums'],
    marginBottom: Spacing.lg,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: Spacing.md,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroFooterCol: {
    flex: 1,
  },
  heroFooterLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  heroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  heroFooterLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  heroFooterAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },

  // Section
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.ink,
    marginBottom: Spacing.md,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.money,
    marginBottom: Spacing.md,
  },

  // Accounts
  accountsRow: {
    paddingRight: Spacing.lg,
    gap: Spacing.md,
  },
  accountCard: {
    width: 170,
    backgroundColor: Colors.paper,
    borderRadius: 18,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  accountIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  accountEmoji: {
    fontSize: 22,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 2,
  },
  accountType: {
    fontSize: 11,
    color: Colors.muted2,
    marginBottom: Spacing.sm,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // Category Breakdown
  categoryCard: {
    marginBottom: Spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.sm,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.ink,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.ink,
    fontVariant: ['tabular-nums'],
  },
  categoryPct: {
    fontSize: 11,
    color: Colors.muted,
  },
  progressTrack: {
    height: 6,
    borderRadius: 4,
    backgroundColor: Colors.backgroundWarm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Charts
  chartNote: {
    fontSize: 11,
    color: Colors.muted,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  // Buttons
  buttonsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  buttonHalf: {
    flex: 1,
  },

  // Empty
  emptyText: {
    color: Colors.muted,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
    fontSize: 14,
  },
});
