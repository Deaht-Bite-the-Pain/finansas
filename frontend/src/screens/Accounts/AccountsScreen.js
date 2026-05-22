import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; // Importamos useFocusEffect
import api from '../../api/axios';

export default function AccountsScreen({ navigation }) {
  const [accounts, setAccounts] = useState([]);

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/accounts');
      setAccounts(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Usamos useFocusEffect en lugar de useEffect para recargar al volver a la pantalla
  useFocusEffect(
    useCallback(() => {
      fetchAccounts();
    }, [])
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Cuentas</Text>
      
      <Button title="Crear Nueva Cuenta" onPress={() => navigation.navigate('AddAccount')} />
      <View style={{ height: 8 }} />
      <Button title="Transacciones" onPress={() => navigation.navigate('Transactions')} />
      <View style={{ height: 8 }} />
      <Button title="Presupuestos" onPress={() => navigation.navigate('Budgets')} color="#2563eb" />

      <View style={{ height: 20 }} /> 
      
      <FlatList
        data={accounts}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.nombre} ({item.tipo})</Text>
            <Text style={styles.cardAmount}>${item.saldo}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No tienes cuentas creadas aún.</Text>}
      />

      <Button title="Cerrar Sesión" onPress={handleLogout} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { padding: 15, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardAmount: { fontSize: 18, color: 'green', marginTop: 5 }
});