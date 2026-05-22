import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Button,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import api from '../../api/axios';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      // Obtener mes y año actual
      const now = new Date();
      const mes = now.getMonth() + 1;
      const anio = now.getFullYear();

      // Obtener todas las transacciones del mes
      const txRes = await api.get('/transactions', {
        params: { mes, anio },
      });

      const transactions = txRes.data;

      // Calcular ingresos y gastos
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

      setSummary({
        totalIncome,
        totalExpense,
        balance,
        mes,
        anio,
      });

      // Convertir expensesByCategory a array y ordenar
      const expensesArray = Object.entries(expensesByCategory)
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      setExpenses(expensesArray);

      // Obtener cuentas
      const accRes = await api.get('/accounts');
      setAccounts(accRes.data);
    } catch (error) {
      console.log('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard Financiero</Text>
      <Text style={styles.month}>
        {monthNames[summary.mes - 1]} {summary.anio}
      </Text>

      {/* Resumen de ingresos y gastos */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Ingresos</Text>
          <Text style={[styles.summaryAmount, styles.income]}>
            +${summary.totalIncome.toFixed(2)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Gastos</Text>
          <Text style={[styles.summaryAmount, styles.expense]}>
            -${summary.totalExpense.toFixed(2)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Saldo Neto</Text>
          <Text
            style={[
              styles.summaryAmount,
              summary.balance >= 0 ? styles.income : styles.expense,
            ]}
          >
            ${summary.balance.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Gráfica Ingresos vs Gastos */}
      {(summary.totalIncome > 0 || summary.totalExpense > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingresos vs Gastos</Text>
          <BarChart
            data={{
              labels: ['Ingresos', 'Gastos'],
              datasets: [
                {
                  data: [summary.totalIncome, summary.totalExpense],
                },
              ],
            }}
            width={screenWidth - 32}
            height={220}
            yAxisLabel="$"
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 8,
              },
              propsForDots: {
                r: '5',
                strokeWidth: '2',
                stroke: '#2563eb',
              },
            }}
            style={{
              marginVertical: 8,
              borderRadius: 8,
            }}
          />
        </View>
      )}

      {/* Saldo por cuenta */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saldo por Cuenta</Text>
        {accounts.length > 0 ? (
          accounts.map((account) => (
            <View key={account.id} style={styles.accountCard}>
              <View style={styles.accountRow}>
                <View>
                  <Text style={styles.accountName}>{account.nombre}</Text>
                  <Text style={styles.accountType}>{account.tipo}</Text>
                </View>
                <Text style={styles.accountBalance}>
                  ${Number(account.saldo).toFixed(2)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No hay cuentas registradas</Text>
        )}
      </View>

      {/* Gráfica de Torta - Distribución de gastos */}
      {expenses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distribución de Gastos</Text>
          <View style={styles.chartContainer}>
            <PieChart
              data={expenses.slice(0, 5).map((expense, index) => ({
                name: expense.category.substring(0, 10),
                population: parseFloat(expense.amount.toFixed(2)),
                color: [
                  '#dc2626',
                  '#ea580c',
                  '#f59e0b',
                  '#eab308',
                  '#84cc16',
                ][index % 5],
                legendFontColor: '#333',
                legendFontSize: 12,
              }))}
              width={screenWidth - 32}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor={'population'}
              backgroundColor={'transparent'}
              paddingLeft={0}
              style={{
                marginVertical: 8,
                borderRadius: 8,
              }}
            />
          </View>
          <Text style={styles.chartNote}>
            {expenses.length > 5 ? `Mostrando top 5 de ${expenses.length} categorías` : ''}
          </Text>
        </View>
      )}

      {/* Desglose de gastos por categoría */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gastos por Categoría (Detalle)</Text>
        {expenses.length > 0 ? (
          expenses.map((expense, index) => (
            <View key={index} style={styles.expenseCard}>
              <View style={styles.expenseHeader}>
                <Text style={styles.expenseName}>{expense.category}</Text>
                <Text style={styles.expenseAmount}>
                  ${expense.amount.toFixed(2)}
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${Math.min(expense.percentage, 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.expensePercentage}>
                {expense.percentage.toFixed(1)}% del total
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>
            No hay gastos registrados este mes
          </Text>
        )}
      </View>

      {/* Botones de navegación */}
      <View style={styles.buttonContainer}>
        <Button
          title="Ver Transacciones"
          onPress={() => navigation.navigate('Transactions')}
        />
        <View style={{ height: 8 }} />
        <Button
          title="Ver Presupuestos"
          onPress={() => navigation.navigate('Budgets')}
          color="#2563eb"
        />
        <View style={{ height: 8 }} />
        <Button
          title="Mis Cuentas"
          onPress={() => navigation.navigate('Accounts')}
          color="#16a34a"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 4,
  },
  month: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },

  // Summary cards
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  income: {
    color: '#16a34a',
  },
  expense: {
    color: '#dc2626',
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },

  // Account cards
  accountCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountName: {
    fontSize: 14,
    fontWeight: '600',
  },
  accountType: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },

  // Expense cards
  expenseCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  expenseName: {
    fontSize: 14,
    fontWeight: '600',
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#dc2626',
  },
  expensePercentage: {
    fontSize: 11,
    color: '#999',
  },

  // Charts
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
  chartNote: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },

  // Other
  emptyText: {
    color: '#999',
    textAlign: 'center',
    paddingVertical: 16,
  },
  buttonContainer: {
    marginVertical: 24,
  },
});
