import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import api from '../../api/axios';

export default function BudgetFormScreen({ navigation, route }) {
  const budgetId = route.params?.budgetId;
  const mes = route.params?.mes;
  const anio = route.params?.anio;
  const { control, handleSubmit, setValue } = useForm({
    defaultValues: { categoria_id: '', limite: '' },
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/categories', { params: { tipo: 'gasto' } });
        setCategories(res.data);
        if (!budgetId && res.data.length) {
          setValue('categoria_id', String(res.data[0].id));
        }
      } catch {
        Alert.alert('Error', 'No se pudieron cargar categorías');
      }
    };
    load();
  }, [budgetId, setValue]);

  useEffect(() => {
    if (!budgetId) return;
    const loadBudget = async () => {
      try {
        const res = await api.get('/budgets', { params: { mes, anio } });
        const budget = res.data.find((b) => b.id === budgetId);
        if (!budget) throw new Error();
        setValue('categoria_id', String(budget.categoria_id));
        setValue('limite', String(budget.limite));
      } catch {
        Alert.alert('Error', 'No se pudo cargar el presupuesto');
        navigation.goBack();
      }
    };
    loadBudget();
  }, [budgetId, mes, anio, navigation, setValue]);

  const onSubmit = async (data) => {
    const limite = parseFloat(data.limite);
    if (!limite || limite <= 0) {
      Alert.alert('Error', 'Ingresa un límite válido');
      return;
    }

    try {
      if (budgetId) {
        await api.put(`/budgets/${budgetId}`, { limite });
        Alert.alert('Éxito', 'Presupuesto actualizado');
      } else {
        await api.post('/budgets', {
          categoria_id: parseInt(data.categoria_id, 10),
          mes,
          anio,
          limite,
        });
        Alert.alert('Éxito', 'Presupuesto creado');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'No se pudo guardar');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{budgetId ? 'Editar' : 'Nuevo'} presupuesto</Text>
      <Text style={styles.subtitle}>Periodo: {mes}/{anio}</Text>

      {!budgetId && (
        <>
          <Text style={styles.label}>Categoría de gasto</Text>
          <Controller
            control={control}
            name="categoria_id"
            render={({ field: { onChange, value } }) => (
              <View>
                {categories.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.catItem, value === String(c.id) && styles.catItemActive]}
                    onPress={() => onChange(String(c.id))}
                  >
                    <Text style={value === String(c.id) ? styles.catTextActive : styles.catText}>
                      {c.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </>
      )}

      <Text style={styles.label}>Límite mensual ($)</Text>
      <Controller
        control={control}
        rules={{ required: true }}
        name="limite"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Ej. 500"
            keyboardType="decimal-pad"
            value={value}
            onChangeText={onChange}
            style={styles.input}
          />
        )}
      />

      <Text style={styles.note}>
        Las alertas se muestran al alcanzar el 80% (amarillo) y el 100% (rojo) del límite.
      </Text>

      <Button title="Guardar" onPress={handleSubmit(onSubmit)} />
      <View style={{ height: 10 }} />
      <Button title="Cancelar" onPress={() => navigation.goBack()} color="gray" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40 },
  title: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 16, marginTop: 4 },
  label: { fontWeight: '600', marginBottom: 6, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 12 },
  catItem: { padding: 10, borderWidth: 1, borderColor: '#eee', borderRadius: 6, marginBottom: 6 },
  catItemActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  catText: { color: '#333' },
  catTextActive: { color: '#1d4ed8', fontWeight: '600' },
  note: { fontSize: 12, color: '#666', marginBottom: 16, fontStyle: 'italic' },
});
