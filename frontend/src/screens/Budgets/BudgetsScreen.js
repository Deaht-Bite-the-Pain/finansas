import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/axios';
import BudgetProgressBar from '../../components/BudgetProgressBar';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function BudgetsScreen({ navigation }) {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [anio, setAnio] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState([]);

  const fetchBudgets = async () => {
    try {
      const res = await api.get('/budgets', { params: { mes, anio } });
      setBudgets(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const changeMonth = (delta) => {
    let newMes = mes + delta;
    let newAnio = anio;
    if (newMes > 12) {
      newMes = 1;
      newAnio += 1;
    } else if (newMes < 1) {
      newMes = 12;
      newAnio -= 1;
    }
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Presupuestos mensuales</Text>

      <View style={styles.periodRow}>
        <Button title="<" onPress={() => changeMonth(-1)} />
        <Text style={styles.period}>{MONTHS[mes - 1]} {anio}</Text>
        <Button title=">" onPress={() => changeMonth(1)} />
      </View>

      <Button title="Configurar presupuesto" onPress={() => navigation.navigate('BudgetForm', { mes, anio })} />
      <View style={{ height: 16 }} />

      <FlatList
        data={budgets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('BudgetForm', { budgetId: item.id, mes, anio })}
            onLongPress={() => handleDelete(item.id)}
          >
            <Text style={styles.cardTitle}>{item.categoria_nombre}</Text>
            <Text style={styles.limit}>Límite: ${Number(item.limite).toFixed(2)}</Text>
            <BudgetProgressBar
              gastado={item.gastado}
              limite={item.limite}
              porcentaje={item.porcentaje}
              nivel_alerta={item.nivel_alerta}
            />
            <Text style={styles.hint}>Toca para editar · Mantén para eliminar</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text>No hay presupuestos para este mes. Crea uno por categoría de gasto.</Text>
        }
      />
      <Button title="Volver" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  periodRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12 },
  period: { fontSize: 18, fontWeight: '600', minWidth: 160, textAlign: 'center' },
  card: { padding: 14, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 12 },
  cardTitle: { fontSize: 17, fontWeight: 'bold' },
  limit: { fontSize: 14, color: '#555', marginTop: 4 },
  hint: { fontSize: 11, color: '#999', marginTop: 8 },
});
