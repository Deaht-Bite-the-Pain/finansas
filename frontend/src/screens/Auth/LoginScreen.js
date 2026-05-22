import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/axios';
import { getApiErrorMessage } from '../../utils/apiError';

export default function LoginScreen({ navigation }) {
  const { control, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // Validar si ya hay sesión al abrir la app
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) navigation.replace('Dashboard');
    };
    checkToken();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await api.post('/auth/login', data);
      await AsyncStorage.setItem('userToken', res.data.token);

      setMessage({
        type: 'success',
        title: '✅ ¡Bienvenido!',
        text: 'Acceso exitoso. Cargando tu dashboard...',
      });

      // Esperar 1.5 segundos antes de navegar
      setTimeout(() => {
        navigation.replace('Dashboard');
      }, 1500);
    } catch (error) {
      const errorMsg = getApiErrorMessage(
        error,
        'Credenciales incorrectas o error de conexión'
      );

      setMessage({
        type: 'error',
        title: '❌ Error al ingresar',
        text: errorMsg,
      });

      // Mostrar Alert también
      Alert.alert('❌ Error al ingresar', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>

      {/* Mensaje flotante */}
      {message && (
        <View
          style={[
            styles.messageBox,
            message.type === 'success' ? styles.successBox : styles.errorBox,
          ]}
        >
          <Text style={styles.messageTitle}>{message.title}</Text>
          <Text style={styles.messageText}>{message.text}</Text>
        </View>
      )}

      <Controller
        control={control}
        rules={{ required: 'Email obligatorio' }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Email"
            onChangeText={onChange}
            value={value}
            autoCapitalize="none"
            editable={!loading}
          />
        )}
        name="email"
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <Controller
        control={control}
        rules={{ required: 'Contraseña obligatoria' }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Contraseña"
            secureTextEntry
            onChangeText={onChange}
            value={value}
            editable={!loading}
          />
        )}
        name="password"
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      <View style={styles.buttons}>
        <View style={styles.submitButton}>
          <Button
            title={loading ? 'Ingresando...' : 'Ingresar'}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          />
          {loading && <ActivityIndicator color="#2563eb" style={styles.spinner} />}
        </View>

        <View style={{ height: 10 }} />

        <Button
          title="Crear cuenta nueva"
          onPress={() => navigation.navigate('Register')}
          color="gray"
          disabled={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
  },

  // Mensaje flotante
  messageBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  successBox: {
    backgroundColor: '#dcfce7',
    borderLeftColor: '#16a34a',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    borderLeftColor: '#dc2626',
  },
  messageTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  messageText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },

  // Inputs
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
    borderColor: '#ccc',
    fontSize: 14,
  },
  inputError: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  error: { color: '#dc2626', marginBottom: 10, fontSize: 12, fontWeight: '500' },

  // Botones
  buttons: { marginTop: 20 },
  submitButton: {
    position: 'relative',
  },
  spinner: {
    position: 'absolute',
    right: 16,
    top: 12,
  },
});