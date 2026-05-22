import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/axios';

export default function TransactionsScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Eliminar', '¿Eliminar esta transacción?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/transactions/${id}`);
            fetchTransactions();
          } catch {
            Alert.alert('Error', 'No se pudo eliminar');
          }
        },
      },
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transacciones</Text>
      <Button title="Nueva transacción" onPress={() => navigation.navigate('TransactionForm')} />
      <View style={{ height: 16 }} />
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('TransactionForm', { transactionId: item.id })}
            onLongPress={() => handleDelete(item.id)}
          >
            <View style={styles.row}>
              <Text style={styles.cardTitle}>{item.descripcion || 'Sin descripción'}</Text>
              <Text style={[styles.amount, item.tipo === 'ingreso' ? styles.income : styles.expense]}>
                {item.tipo === 'ingreso' ? '+' : '-'}${item.monto}
              </Text>
            </View>
            <Text style={styles.meta}>
              {item.categoria_nombre} · {item.cuenta_nombre} · {item.fecha?.slice?.(0, 10) || item.fecha}
            </Text>
            <Text style={styles.hint}>Toca para editar · Mantén para eliminar</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No hay transacciones registradas.</Text>}
      />
      <Button title="Volver" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  card: { padding: 14, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600', flex: 1 },
  amount: { fontSize: 16, fontWeight: 'bold' },
  income: { color: '#16a34a' },
  expense: { color: '#dc2626' },
  meta: { fontSize: 13, color: '#666', marginTop: 4 },
  hint: { fontSize: 11, color: '#999', marginTop: 6 },
});
