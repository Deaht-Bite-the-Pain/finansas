import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/axios';
import { getApiErrorMessage } from '../../utils/apiError';
import Button from '../../components/UI/Button';
import FinanzasInput from '../../components/UI/TextInput';
import { Colors, Typography, BorderRadius, Spacing, Shadows } from '../../theme/finansasTheme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const COIN_COUNT = 8;
const COIN_CONFIGS = [
  { size: 36, left: 0.08, delay: 0 },
  { size: 28, left: 0.25, delay: 400 },
  { size: 42, left: 0.45, delay: 800 },
  { size: 24, left: 0.62, delay: 200 },
  { size: 32, left: 0.78, delay: 600 },
  { size: 20, left: 0.15, delay: 1000 },
  { size: 38, left: 0.55, delay: 300 },
  { size: 26, left: 0.88, delay: 700 },
];

function FloatingCoin({ config, animValue }) {
  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT + 50, -80],
  });
  const opacity = animValue.interpolate({
    inputRange: [0, 0.1, 0.8, 1],
    outputRange: [0, 0.35, 0.25, 0],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: config.left * SCREEN_WIDTH,
        width: config.size,
        height: config.size,
        borderRadius: config.size / 2,
        backgroundColor: Colors.gold,
        opacity,
        transform: [{ translateY }],
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.gold2,
      }}
    >
      <Text
        style={{
          color: '#FFF8E1',
          fontSize: config.size * 0.45,
          fontWeight: '700',
        }}
      >
        $
      </Text>
    </Animated.View>
  );
}

export default function LoginScreen({ navigation }) {
  const { control, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Coin animation refs
  const coinAnims = useRef(
    COIN_CONFIGS.map(() => new Animated.Value(0))
  ).current;

  // Toast fade
  const toastOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) navigation.replace('Dashboard');
    };
    checkToken();

    // Start coin animations staggered
    COIN_CONFIGS.forEach((config, i) => {
      const startAnim = () => {
        coinAnims[i].setValue(0);
        Animated.timing(coinAnims[i], {
          toValue: 1,
          duration: 4000 + Math.random() * 3000,
          delay: config.delay,
          useNativeDriver: true,
        }).start(() => startAnim());
      };
      startAnim();
    });
  }, []);

  // Show toast when message changes
  useEffect(() => {
    if (message) {
      toastOpacity.setValue(0);
      Animated.sequence([
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => setMessage(null));
    }
  }, [message]);

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await api.post('/auth/login', data);
      await AsyncStorage.setItem('userToken', res.data.token);

      setMessage({
        type: 'success',
        title: 'Bienvenido',
        text: 'Acceso exitoso. Cargando tu dashboard...',
      });

      setTimeout(() => {
        navigation.replace('Dashboard');
      }, 1500);
    } catch (error) {
      const errorMsg = getApiErrorMessage(error, 'Credenciales incorrectas');
      setMessage({
        type: 'error',
        title: 'Error al ingresar',
        text: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Warm gradient background layers */}
      <View style={styles.bgBase} />
      <View style={styles.bgWarmOverlay} />
      <View style={styles.bgRadial} />

      {/* Floating coins */}
      <View style={styles.coinsContainer} pointerEvents="none">
        {COIN_CONFIGS.map((config, i) => (
          <FloatingCoin key={i} config={config} animValue={coinAnims[i]} />
        ))}
      </View>

      {/* Toast notification */}
      {message && (
        <Animated.View
          style={[
            styles.toast,
            message.type === 'success' ? styles.toastSuccess : styles.toastError,
            { opacity: toastOpacity },
          ]}
        >
          <Text style={styles.toastTitle}>
            {message.type === 'success' ? '✓' : '✗'} {message.title}
          </Text>
          <Text style={styles.toastText}>{message.text}</Text>
        </Animated.View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand logo */}
          <View style={styles.brandRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>$</Text>
            </View>
            <Text style={styles.brandName}>finansas</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Iniciar sesión</Text>
          <Text style={styles.subtitle}>
            Tus finanzas, claras. Bienvenido de vuelta.
          </Text>

          {/* Form */}
          <View style={styles.formContainer}>
            <Controller
              control={control}
              rules={{ required: 'Email obligatorio' }}
              render={({ field: { onChange, value } }) => (
                <FinanzasInput
                  label="Email"
                  placeholder="tu@email.com"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  error={errors.email?.message}
                  editable={!loading}
                />
              )}
              name="email"
            />

            <Controller
              control={control}
              rules={{ required: 'Contraseña obligatoria' }}
              render={({ field: { onChange, value } }) => (
                <View>
                  <FinanzasInput
                    label="Contraseña"
                    placeholder="••••••••"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={!showPassword}
                    error={errors.password?.message}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeToggle}
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.eyeText}>
                      {showPassword ? 'Ocultar' : 'Mostrar'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              name="password"
            />

            <TouchableOpacity
              style={styles.forgotRow}
              onPress={() => {}}
            >
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>

          {/* Spacer pushes buttons to bottom */}
          <View style={{ flex: 1, minHeight: Spacing.xxl }} />

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <Button
              title={loading ? 'Ingresando...' : 'Ingresar  ›'}
              variant="primary"
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              loading={loading}
              fullWidth
            />
            <View style={{ height: Spacing.md }} />
            <Button
              title="Crear cuenta nueva"
              variant="ghost"
              onPress={() => navigation.navigate('Register')}
              disabled={loading}
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  bgBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
  },
  bgWarmOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.backgroundWarm,
    opacity: 0.6,
  },
  bgRadial: {
    position: 'absolute',
    top: -SCREEN_HEIGHT * 0.2,
    left: -SCREEN_WIDTH * 0.3,
    width: SCREEN_WIDTH * 1.6,
    height: SCREEN_HEIGHT * 0.7,
    borderRadius: SCREEN_WIDTH,
    backgroundColor: Colors.goldSoft,
    opacity: 0.18,
  },
  coinsContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  toast: {
    position: 'absolute',
    top: 54,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 100,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    ...Shadows.md,
  },
  toastSuccess: {
    backgroundColor: Colors.moneySoft,
    borderLeftWidth: 4,
    borderLeftColor: Colors.money,
  },
  toastError: {
    backgroundColor: Colors.coralSoft,
    borderLeftWidth: 4,
    borderLeftColor: Colors.coral,
  },
  toastTitle: {
    fontSize: Typography.cap.fontSize,
    fontWeight: '600',
    color: Colors.ink,
    marginBottom: 2,
  },
  toastText: {
    fontSize: Typography.body.fontSize,
    color: Colors.muted,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
    paddingTop: 90,
    paddingBottom: 40,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.ink,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  logoText: {
    color: Colors.paper,
    fontSize: 20,
    fontWeight: '700',
  },
  brandName: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.ink,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    color: Colors.ink,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.cap.fontSize,
    fontWeight: Typography.cap.fontWeight,
    color: Colors.muted,
    marginBottom: Spacing.xxl,
  },
  formContainer: {
    marginBottom: Spacing.lg,
  },
  eyeToggle: {
    position: 'absolute',
    right: Spacing.md,
    top: 34,
    height: 30,
    justifyContent: 'center',
  },
  eyeText: {
    fontSize: Typography.tiny.fontSize,
    fontWeight: '600',
    color: Colors.muted,
    textTransform: 'uppercase',
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.sm,
  },
  forgotText: {
    fontSize: Typography.tiny.fontSize,
    fontWeight: '500',
    color: Colors.muted,
  },
  buttonsContainer: {
    paddingBottom: Spacing.lg,
  },
});
