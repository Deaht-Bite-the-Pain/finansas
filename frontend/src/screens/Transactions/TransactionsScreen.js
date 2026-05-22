import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/axios';
import TransactionFilters from '../../components/TransactionFilters';

export default function TransactionsScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    categoria_id: null,
    cuenta_id: null,
    startDate: null,
    endDate: null,
  });

  const fetchTransactions = async (appliedFilters = {}) => {
    try {
      const params = {};

      if (appliedFilters.categoria_id) {
        params.categoria_id = appliedFilters.categoria_id;
      }
      if (appliedFilters.cuenta_id) {
        params.cuenta_id = appliedFilters.cuenta_id;
      }
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
      fetchCategoriesAndAccounts();
      fetchTransactions(filters);
    }, [filters])
  );

  const handleDelete = (id) => {
    Alert.alert('Eliminar', '¿Eliminar esta transacción?', [
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

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transacciones</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterButtonText}>
            {showFilters ? '▲ Cerrar Filtros' : '▼ Abrir Filtros'}
          </Text>
        </TouchableOpacity>
      </View>

      {showFilters && (
        <TransactionFilters
          categories={categories}
          accounts={accounts}
          onFilterChange={handleFilterChange}
        />
      )}

      <Button
        title="Nueva transacción"
        onPress={() => navigation.navigate('TransactionForm')}
      />
      <View style={{ height: 12 }} />

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('TransactionForm', { transactionId: item.id })
            }
            onLongPress={() => handleDelete(item.id)}
          >
            <View style={styles.row}>
              <Text style={styles.cardTitle}>
                {item.descripcion || 'Sin descripción'}
              </Text>
              <Text
                style={[
                  styles.amount,
                  item.tipo === 'ingreso' ? styles.income : styles.expense,
                ]}
              >
                {item.tipo === 'ingreso' ? '+' : '-'}${item.monto}
              </Text>
            </View>
            <Text style={styles.meta}>
              {item.categoria_nombre} · {item.cuenta_nombre} ·{' '}
              {item.fecha?.slice?.(0, 10) || item.fecha}
            </Text>
            <Text style={styles.hint}>Toca para editar · Mantén para eliminar</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay transacciones con estos filtros.</Text>
        }
      />
      <Button title="Volver" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 40, backgroundColor: '#fff' },
  header: { paddingHorizontal: 20, paddingTop: 12 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    marginBottom: 12,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  card: {
    marginHorizontal: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '600', flex: 1 },
  amount: { fontSize: 16, fontWeight: 'bold' },
  income: { color: '#16a34a' },
  expense: { color: '#dc2626' },
  meta: { fontSize: 13, color: '#666', marginTop: 4 },
  hint: { fontSize: 11, color: '#999', marginTop: 6 },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
