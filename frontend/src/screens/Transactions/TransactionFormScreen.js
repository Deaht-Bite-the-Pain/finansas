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
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import api from '../../api/axios';

function SelectList({ options, value, onChange, labelKey = 'nombre', valueKey = 'id' }) {
  return (
    <View style={styles.selectList}>
      {options.map((opt) => {
        const optValue = String(opt[valueKey]);
        const selected = value === optValue;
        return (
          <TouchableOpacity
            key={opt[valueKey]}
            style={[styles.selectItem, selected && styles.selectItemActive]}
            onPress={() => onChange(optValue)}
          >
            <Text style={selected ? styles.selectTextActive : styles.selectText}>
              {opt[labelKey]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TransactionFormScreen({ navigation, route }) {
  const transactionId = route.params?.transactionId;
  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      tipo: 'gasto',
      monto: '',
      descripcion: '',
      fecha: new Date().toISOString().slice(0, 10),
      cuenta_id: '',
      categoria_id: '',
    },
  });

  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const tipo = watch('tipo');

  useEffect(() => {
    const load = async () => {
      try {
        const [accRes, catRes] = await Promise.all([
          api.get('/accounts'),
          api.get('/categories', { params: { tipo } }),
        ]);
        setAccounts(accRes.data);
        setCategories(catRes.data);
        if (accRes.data.length && !transactionId) {
          setValue('cuenta_id', String(accRes.data[0].id));
        }
        if (catRes.data.length && !transactionId) {
          setValue('categoria_id', String(catRes.data[0].id));
        }
      } catch {
        Alert.alert('Error', 'No se pudieron cargar cuentas o categorías');
      }
    };
    load();
  }, [tipo, transactionId, setValue]);

  useEffect(() => {
    if (!transactionId) return;
    const loadTx = async () => {
      try {
        const res = await api.get(`/transactions/${transactionId}`);
        const tx = res.data;
        setValue('tipo', tx.tipo);
        setValue('monto', String(tx.monto));
        setValue('descripcion', tx.descripcion || '');
        setValue('fecha', tx.fecha?.slice?.(0, 10) || tx.fecha);
        setValue('cuenta_id', String(tx.cuenta_id));
        setValue('categoria_id', String(tx.categoria_id));
      } catch {
        Alert.alert('Error', 'No se pudo cargar la transacción');
        navigation.goBack();
      }
    };
    loadTx();
  }, [transactionId, navigation, setValue]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      monto: parseFloat(data.monto),
      cuenta_id: parseInt(data.cuenta_id, 10),
      categoria_id: parseInt(data.categoria_id, 10),
    };

    try {
      if (transactionId) {
        await api.put(`/transactions/${transactionId}`, payload);
        Alert.alert('Éxito', 'Transacción actualizada');
      } else {
        await api.post('/transactions', payload);
        Alert.alert('Éxito', 'Transacción creada');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'No se pudo guardar');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{transactionId ? 'Editar' : 'Nueva'} transacción</Text>

      <Text style={styles.label}>Tipo</Text>
      <Controller
        control={control}
        name="tipo"
        render={({ field: { onChange, value } }) => (
          <View style={styles.row}>
            {['gasto', 'ingreso'].map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, value === t && styles.chipActive]}
                onPress={() => onChange(t)}
              >
                <Text style={value === t ? styles.chipTextActive : styles.chipText}>
                  {t === 'gasto' ? 'Gasto' : 'Ingreso'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />

      <Controller
        control={control}
        rules={{ required: true }}
        name="monto"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Monto"
            keyboardType="decimal-pad"
            value={value}
            onChangeText={onChange}
            style={styles.input}
          />
        )}
      />

      <Controller
        control={control}
        name="descripcion"
        render={({ field: { onChange, value } }) => (
          <TextInput placeholder="Descripción" value={value} onChangeText={onChange} style={styles.input} />
        )}
      />

      <Controller
        control={control}
        name="fecha"
        render={({ field: { onChange, value } }) => (
          <TextInput placeholder="Fecha (YYYY-MM-DD)" value={value} onChangeText={onChange} style={styles.input} />
        )}
      />

      <Text style={styles.label}>Cuenta</Text>
      <Controller
        control={control}
        name="cuenta_id"
        render={({ field: { onChange, value } }) => (
          <SelectList
            options={accounts.map((a) => ({
              id: a.id,
              nombre: `${a.nombre} ($${a.saldo})`,
            }))}
            value={value}
            onChange={onChange}
          />
        )}
      />

      <Text style={styles.label}>Categoría</Text>
      <Controller
        control={control}
        name="categoria_id"
        render={({ field: { onChange, value } }) => (
          <SelectList options={categories} value={value} onChange={onChange} />
        )}
      />

      <Button title="Guardar" onPress={handleSubmit(onSubmit)} />
      <View style={{ height: 10 }} />
      <Button title="Cancelar" onPress={() => navigation.goBack()} color="gray" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  label: { fontWeight: '600', marginBottom: 6, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 10 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, alignItems: 'center' },
  chipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { color: '#333' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  selectList: { marginBottom: 12 },
  selectItem: { padding: 10, borderWidth: 1, borderColor: '#eee', borderRadius: 6, marginBottom: 6 },
  selectItemActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  selectText: { color: '#333' },
  selectTextActive: { color: '#1d4ed8', fontWeight: '600' },
});
