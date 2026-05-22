import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
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
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

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

  const validateForm = (data) => {
    const newErrors = {};

    if (!budgetId && !data.categoria_id) {
      newErrors.categoria_id = 'Debe seleccionar una categoría';
    }
    if (!data.limite || parseFloat(data.limite) <= 0) {
      newErrors.limite = 'El límite debe ser mayor a 0';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (data) => {
    if (!validateForm(data)) {
      return;
    }

    const limite = parseFloat(data.limite);
    setLoading(true);

    try {
      if (budgetId) {
        await api.put(`/budgets/${budgetId}`, { limite });
        Alert.alert('Éxito', 'Presupuesto actualizado correctamente');
      } else {
        await api.post('/budgets', {
          categoria_id: parseInt(data.categoria_id, 10),
          mes,
          anio,
          limite,
        });
        Alert.alert('Éxito', 'Presupuesto creado correctamente');
      }
      navigation.goBack();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error al guardar el presupuesto. Intenta nuevamente.';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{budgetId ? 'Editar' : 'Nuevo'} presupuesto</Text>
      <Text style={styles.subtitle}>Periodo: {mes}/{anio}</Text>

      {!budgetId && (
        <>
          <Text style={styles.label}>Categoría de gasto *</Text>
          <Controller
            control={control}
            name="categoria_id"
            render={({ field: { onChange, value } }) => (
              <>
                <View>
                  {categories.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.catItem, value === String(c.id) && styles.catItemActive]}
                      onPress={() => onChange(String(c.id))}
                    >
                      <Text
                        style={value === String(c.id) ? styles.catTextActive : styles.catText}
                      >
                        {c.nombre}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {formErrors.categoria_id && (
                  <Text style={styles.errorText}>{formErrors.categoria_id}</Text>
                )}
              </>
            )}
          />
        </>
      )}

      <Text style={styles.label}>Límite mensual ($) *</Text>
      <Controller
        control={control}
        rules={{ required: 'Límite requerido' }}
        name="limite"
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              placeholder="Ej. 500"
              keyboardType="decimal-pad"
              value={value}
              onChangeText={onChange}
              style={[styles.input, formErrors.limite && styles.inputError]}
            />
            {formErrors.limite && (
              <Text style={styles.errorText}>{formErrors.limite}</Text>
            )}
          </>
        )}
      />

      <Text style={styles.note}>
        Las alertas se muestran al alcanzar el 80% (amarillo) y el 100% (rojo) del límite.
      </Text>

      <Button
        title={loading ? 'Guardando...' : 'Guardar'}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      />
      <View style={{ height: 10 }} />
      <Button
        title="Cancelar"
        onPress={() => navigation.goBack()}
        color="gray"
        disabled={loading}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40 },
  title: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 16, marginTop: 4 },
  label: { fontWeight: '600', marginBottom: 6, marginTop: 8, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 12 },
  inputError: { borderColor: '#dc2626', backgroundColor: '#fef2f2' },
  errorText: { color: '#dc2626', fontSize: 12, marginBottom: 10, marginTop: -8 },
  catItem: { padding: 10, borderWidth: 1, borderColor: '#eee', borderRadius: 6, marginBottom: 6 },
  catItemActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  catText: { color: '#333' },
  catTextActive: { color: '#1d4ed8', fontWeight: '600' },
  note: { fontSize: 12, color: '#666', marginBottom: 16, fontStyle: 'italic' },
});
