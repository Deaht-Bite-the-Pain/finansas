import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import api from '../../api/axios';
import { getApiErrorMessage } from '../../utils/apiError';
import Button from '../../components/UI/Button';
import FinanzasInput from '../../components/UI/TextInput';
import { Colors, Typography, BorderRadius, Spacing, Shadows } from '../../theme/finansasTheme';

const ACCOUNT_TYPES = [
  { id: 'Efectivo', icon: '💵', color: Colors.moneySoft },
  { id: 'Banco', icon: '🏦', color: Colors.skySoft },
  { id: 'Tarjeta', icon: '💳', color: Colors.violetSoft },
  { id: 'Ahorros', icon: '💰', color: Colors.goldSoft },
];

export default function AddAccountScreen({ navigation }) {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      nombre: '',
      tipo: 'Efectivo',
      saldo: '',
    },
  });
  const [selectedType, setSelectedType] = useState('Efectivo');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/accounts', {
        nombre: data.nombre,
        tipo: selectedType,
        saldo: data.saldo ? parseFloat(data.saldo) : 0,
      });
      Alert.alert('Cuenta creada', 'Tu nueva cuenta ha sido registrada.');
      navigation.goBack();
    } catch (error) {
      const msg = getApiErrorMessage(error, 'No se pudo crear la cuenta');
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>{'‹'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Nueva Cuenta</Text>
      <Text style={styles.subtitle}>Agrega un saldo inicial opcional</Text>

      {/* Name field */}
      <View style={styles.form}>
        <Controller
          control={control}
          rules={{ required: 'Debes ingresar un nombre' }}
          name="nombre"
          render={({ field: { onChange, value } }) => (
            <FinanzasInput
              label="Nombre"
              placeholder="ej. Cuenta de Ahorros"
              value={value}
              onChangeText={onChange}
              error={errors.nombre?.message}
              editable={!loading}
            />
          )}
        />

        {/* Type Selector (2x2 grid) */}
        <Text style={styles.label}>TIPO DE CUENTA</Text>
        <View style={styles.typeGrid}>
          {ACCOUNT_TYPES.map((t) => {
            const isActive = selectedType === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.typeCard,
                  isActive && styles.typeCardActive,
                ]}
                onPress={() => setSelectedType(t.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.typeIconBox, { backgroundColor: t.color }]}>
                  <Text style={styles.typeEmoji}>{t.icon}</Text>
                </View>
                <Text style={styles.typeLabel}>{t.id}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Initial Balance */}
        <Controller
          control={control}
          name="saldo"
          render={({ field: { onChange, value } }) => (
            <View style={styles.balanceField}>
              <Text style={styles.label}>SALDO INICIAL (OPCIONAL)</Text>
              <View style={styles.balanceInputRow}>
                <Text style={styles.dollarSign}>$</Text>
                <FinanzasInput
                  placeholder="0.00"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="decimal-pad"
                  editable={!loading}
                />
              </View>
            </View>
          )}
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <Button
          title={loading ? 'Guardando...' : 'Guardar Cuenta'}
          variant="primary"
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
          loading={loading}
          fullWidth
        />
        <View style={{ height: Spacing.md }} />
        <Button
          title="Cancelar"
          variant="ghost"
          onPress={() => navigation.goBack()}
          disabled={loading}
          fullWidth
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.lg + 4,
    paddingTop: 60,
    paddingBottom: Spacing.xxl,
  },

  // Header
  header: {
    flexDirection: 'row',
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
    marginBottom: Spacing.xl,
  },

  // Form
  form: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.xs,
  },

  // Type grid
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: Spacing.xl,
  },
  typeCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.hairline,
    backgroundColor: Colors.paper,
  },
  typeCardActive: {
    borderColor: Colors.ink,
    ...Shadows.sm,
  },
  typeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeEmoji: {
    fontSize: 18,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.ink,
  },

  // Balance
  balanceField: {
    marginBottom: Spacing.lg,
  },
  balanceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dollarSign: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.muted,
    marginBottom: Spacing.lg,
    marginLeft: 4,
  },

  // Buttons
  buttons: {
    marginTop: Spacing.md,
  },
});
