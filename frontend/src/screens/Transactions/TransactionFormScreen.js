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
import { Colors, Typography, BorderRadius, Spacing, Shadows } from '../../theme/finansasTheme';

const ACCOUNT_ICONS = {
  Efectivo: { bg: Colors.moneySoft, emoji: '💵' },
  Banco: { bg: Colors.skySoft, emoji: '🏦' },
  Tarjeta: { bg: Colors.violetSoft, emoji: '💳' },
  Ahorros: { bg: Colors.goldSoft, emoji: '💰' },
};

export default function TransactionFormScreen({ navigation, route }) {
  const transactionId = route.params?.transactionId;
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
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
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const tipo = watch('tipo');
  const selectedAcc = watch('cuenta_id');
  const selectedCat = watch('categoria_id');

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
        Alert.alert('Error', 'No se pudieron cargar cuentas o categorias');
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
        Alert.alert('Error', 'No se pudo cargar la transaccion');
        navigation.goBack();
      }
    };
    loadTx();
  }, [transactionId, navigation, setValue]);

  const validateForm = (data) => {
    const newErrors = {};
    if (!data.monto || parseFloat(data.monto) <= 0)
      newErrors.monto = 'El monto debe ser mayor a 0';
    if (!data.cuenta_id)
      newErrors.cuenta_id = 'Debe seleccionar una cuenta';
    if (!data.categoria_id)
      newErrors.categoria_id = 'Debe seleccionar una categoria';
    if (!data.fecha) {
      newErrors.fecha = 'Debe ingresar una fecha';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.fecha)) {
      newErrors.fecha = 'Formato incorrecto (YYYY-MM-DD)';
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (data) => {
    if (!validateForm(data)) return;
    const payload = {
      ...data,
      monto: parseFloat(data.monto),
      cuenta_id: parseInt(data.cuenta_id, 10),
      categoria_id: parseInt(data.categoria_id, 10),
    };
    setLoading(true);
    try {
      if (transactionId) {
        await api.put(`/transactions/${transactionId}`, payload);
        Alert.alert('Listo', 'Transaccion actualizada');
      } else {
        await api.post('/transactions', payload);
        Alert.alert('Listo', 'Transaccion creada');
      }
      navigation.goBack();
    } catch (error) {
      const msg = getApiErrorMessage(error, 'Error al guardar');
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const isIncome = tipo === 'ingreso';
  const accentColor = isIncome ? Colors.money : Colors.coral;

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
        {transactionId ? 'Editar movimiento' : 'Nuevo movimiento'}
      </Text>
      <Text style={styles.subtitle}>
        {transactionId ? 'Modifica los datos' : 'Registra ingreso o gasto'}
      </Text>

      {/* Type Segmented Control */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>TIPO</Text>
        <Controller
          control={control}
          name="tipo"
          render={({ field: { onChange, value } }) => (
            <View style={styles.segmented}>
              <TouchableOpacity
                style={[
                  styles.segBtn,
                  value === 'gasto' && [styles.segBtnActive, { backgroundColor: Colors.coral }],
                ]}
                onPress={() => onChange('gasto')}
                activeOpacity={0.7}
              >
                <Text style={[styles.segText, value === 'gasto' && styles.segTextActive]}>
                  − Gasto
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segBtn,
                  value === 'ingreso' && [styles.segBtnActive, { backgroundColor: Colors.money }],
                ]}
                onPress={() => onChange('ingreso')}
                activeOpacity={0.7}
              >
                <Text style={[styles.segText, value === 'ingreso' && styles.segTextActive]}>
                  + Ingreso
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      {/* Amount (big mono) */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>MONTO</Text>
        <Controller
          control={control}
          name="monto"
          render={({ field: { onChange, value } }) => (
            <View style={[
              styles.amountBox,
              formErrors.monto && { borderColor: Colors.coral },
            ]}>
              <Text style={[styles.amountPrefix, { color: accentColor }]}>
                {isIncome ? '+' : '−'}$
              </Text>
              <FinanzasInput
                placeholder="0.00"
                value={value}
                onChangeText={(v) => { onChange(v); setFormErrors((e) => ({ ...e, monto: null })); }}
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>
          )}
        />
        {formErrors.monto && <Text style={styles.errorText}>{formErrors.monto}</Text>}
      </View>

      {/* Description */}
      <Controller
        control={control}
        name="descripcion"
        render={({ field: { onChange, value } }) => (
          <FinanzasInput
            label="Descripcion"
            placeholder="ej. Cafe · Super · Pago"
            value={value}
            onChangeText={onChange}
            editable={!loading}
          />
        )}
      />

      {/* Date */}
      <Controller
        control={control}
        name="fecha"
        render={({ field: { onChange, value } }) => (
          <FinanzasInput
            label="Fecha"
            placeholder="YYYY-MM-DD"
            value={value}
            onChangeText={(v) => { onChange(v); setFormErrors((e) => ({ ...e, fecha: null })); }}
            error={formErrors.fecha}
            editable={!loading}
          />
        )}
      />

      {/* Account Selector (cards) */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>CUENTA</Text>
        <Controller
          control={control}
          name="cuenta_id"
          render={({ field: { onChange, value } }) => (
            <View style={styles.accountList}>
              {accounts.map((a) => {
                const isSelected = value === String(a.id);
                const iconInfo = ACCOUNT_ICONS[a.tipo] || ACCOUNT_ICONS.Banco;
                return (
                  <TouchableOpacity
                    key={a.id}
                    style={[
                      styles.accountCard,
                      isSelected && styles.accountCardActive,
                    ]}
                    onPress={() => { onChange(String(a.id)); setFormErrors((e) => ({ ...e, cuenta_id: null })); }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.accountAvatar, { backgroundColor: iconInfo.bg }]}>
                      <Text style={styles.accountEmoji}>{iconInfo.emoji}</Text>
                    </View>
                    <View style={styles.accountInfo}>
                      <Text style={styles.accountName}>{a.nombre}</Text>
                      <Text style={styles.accountBalance}>
                        ${Number(a.saldo).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={styles.checkCircle}>
                        <Text style={styles.checkMark}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        />
        {formErrors.cuenta_id && <Text style={styles.errorText}>{formErrors.cuenta_id}</Text>}
      </View>

      {/* Category Chips */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>CATEGORIA</Text>
        <Controller
          control={control}
          name="categoria_id"
          render={({ field: { onChange, value } }) => (
            <View style={styles.catChips}>
              {categories.map((c) => {
                const isSelected = value === String(c.id);
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.catChip,
                      isSelected && { backgroundColor: accentColor, borderColor: accentColor },
                    ]}
                    onPress={() => { onChange(String(c.id)); setFormErrors((e) => ({ ...e, categoria_id: null })); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.catChipText,
                      isSelected && { color: '#fff' },
                    ]}>
                      {c.nombre}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        />
        {formErrors.categoria_id && <Text style={styles.errorText}>{formErrors.categoria_id}</Text>}
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

  // Segmented
  segmented: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    backgroundColor: Colors.backgroundWarm,
    borderRadius: 14,
  },
  segBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segBtnActive: {
    ...Shadows.sm,
  },
  segText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.muted,
  },
  segTextActive: {
    color: '#fff',
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
  amountPrefix: {
    fontSize: 28,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    marginBottom: Spacing.lg,
  },

  // Account selector
  accountList: {
    gap: Spacing.sm,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: Colors.paper,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.hairline,
  },
  accountCardActive: {
    borderColor: Colors.ink,
    ...Shadows.sm,
  },
  accountAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountEmoji: {
    fontSize: 18,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.ink,
  },
  accountBalance: {
    fontSize: 12,
    color: Colors.muted,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.ink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },

  // Category chips
  catChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  catChip: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.hairline,
    backgroundColor: Colors.paper,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.ink,
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
