import React, { useEffect, useState } from 'react';
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
import Card from '../../components/UI/Card';
import { Colors, Typography, BorderRadius, Spacing, Shadows } from '../../theme/finansasTheme';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function BudgetFormScreen({ navigation, route }) {
  const budgetId = route.params?.budgetId;
  const mes = route.params?.mes;
  const anio = route.params?.anio;
  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: { categoria_id: '', limite: '' },
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const selectedCat = watch('categoria_id');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/categories', { params: { tipo: 'gasto' } });
        setCategories(res.data);
        if (!budgetId && res.data.length) {
          setValue('categoria_id', String(res.data[0].id));
        }
      } catch {
        Alert.alert('Error', 'No se pudieron cargar categorias');
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
      newErrors.categoria_id = 'Debe seleccionar una categoria';
    }
    if (!data.limite || parseFloat(data.limite) <= 0) {
      newErrors.limite = 'El limite debe ser mayor a 0';
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (data) => {
    if (!validateForm(data)) return;
    const limite = parseFloat(data.limite);
    setLoading(true);
    try {
      if (budgetId) {
        await api.put(`/budgets/${budgetId}`, { limite });
        Alert.alert('Listo', 'Presupuesto actualizado');
      } else {
        await api.post('/budgets', {
          categoria_id: parseInt(data.categoria_id, 10),
          mes,
          anio,
          limite,
        });
        Alert.alert('Listo', 'Presupuesto creado');
      }
      navigation.goBack();
    } catch (error) {
      const msg = getApiErrorMessage(error, 'Error al guardar');
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
      <Text style={styles.title}>
        {budgetId ? 'Editar presupuesto' : 'Nuevo presupuesto'}
      </Text>
      <Text style={styles.subtitle}>
        Periodo · {MONTHS[(mes || 1) - 1]} {anio || new Date().getFullYear()}
      </Text>

      {/* Category Selector */}
      {!budgetId ? (
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>CATEGORIA DE GASTO</Text>
          <Controller
            control={control}
            name="categoria_id"
            render={({ field: { onChange, value } }) => (
              <View style={styles.categoryList}>
                {categories.map((c) => {
                  const isSelected = value === String(c.id);
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.categoryItem,
                        isSelected && styles.categoryItemActive,
                      ]}
                      onPress={() => {
                        onChange(String(c.id));
                        setFormErrors((e) => ({ ...e, categoria_id: null }));
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.categoryDot, { opacity: isSelected ? 1 : 0.25 }]} />
                      <Text style={styles.categoryName}>{c.nombre}</Text>
                      {isSelected && <Text style={styles.categoryCheck}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          />
          {formErrors.categoria_id && (
            <Text style={styles.errorText}>{formErrors.categoria_id}</Text>
          )}
        </View>
      ) : (
        <Card flat style={styles.catDisplay}>
          <View style={styles.catDisplayDot} />
          <View>
            <Text style={styles.catDisplayLabel}>CATEGORIA</Text>
            <Text style={styles.catDisplayName}>
              {categories.find((c) => String(c.id) === selectedCat)?.nombre || 'Cargando...'}
            </Text>
          </View>
        </Card>
      )}

      {/* Amount Input (large mono) */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>LIMITE MENSUAL</Text>
        <Controller
          control={control}
          name="limite"
          render={({ field: { onChange, value } }) => (
            <View style={[
              styles.amountBox,
              formErrors.limite && { borderColor: Colors.coral },
            ]}>
              <Text style={styles.dollarSign}>$</Text>
              <FinanzasInput
                placeholder="500"
                value={value}
                onChangeText={(v) => {
                  onChange(v);
                  setFormErrors((e) => ({ ...e, limite: null }));
                }}
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>
          )}
        />
        {formErrors.limite && (
          <Text style={styles.errorText}>{formErrors.limite}</Text>
        )}
      </View>

      {/* Alert Info Note (amber) */}
      <View style={styles.alertNote}>
        <Text style={styles.alertIcon}>⚠</Text>
        <Text style={styles.alertText}>
          Las alertas se muestran al alcanzar el{' '}
          <Text style={styles.alertBold}>80%</Text> (amarillo) y el{' '}
          <Text style={styles.alertBold}>100%</Text> (rojo) del limite.
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <Button
          title={loading ? 'Guardando...' : 'Guardar'}
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

  // Fields
  fieldGroup: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    paddingLeft: 4,
  },

  // Category list
  categoryList: {
    gap: Spacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: Colors.paper,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.hairline,
  },
  categoryItemActive: {
    borderColor: Colors.ink,
    ...Shadows.sm,
  },
  categoryDot: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.coral,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.ink,
  },
  categoryCheck: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.money,
  },

  // Category display (edit mode)
  catDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.xl,
  },
  catDisplayDot: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: Colors.coral,
  },
  catDisplayLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  catDisplayName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.ink,
    marginTop: 2,
  },

  // Amount
  amountBox: {
    backgroundColor: Colors.paper,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.hairline,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dollarSign: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.ink,
    fontVariant: ['tabular-nums'],
    marginBottom: Spacing.lg,
  },

  // Alert note
  alertNote: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    backgroundColor: Colors.goldSoft,
    borderRadius: 14,
    marginBottom: Spacing.xl,
  },
  alertIcon: {
    fontSize: 20,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    color: '#5C4612',
    lineHeight: 20,
  },
  alertBold: {
    fontWeight: '700',
  },

  // Error
  errorText: {
    color: Colors.coral,
    fontSize: 12,
    fontWeight: '500',
    paddingLeft: 4,
    marginTop: 4,
  },

  // Buttons
  buttons: {
    marginTop: Spacing.md,
  },
});
