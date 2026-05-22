import React, { useState } from 'react';
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
import api from '../../api/axios';
import { getApiErrorMessage } from '../../utils/apiError';

export default function RegisterScreen({ navigation }) {
  const { control, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await api.post('/auth/register', data);

      // Mostrar éxito
      setMessage({
        type: 'success',
        title: '✅ ¡Éxito!',
        text: 'Usuario registrado correctamente. Redirigiendo a login...',
      });

      // Esperar 2 segundos antes de navegar
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch (error) {
      const errorMsg = getApiErrorMessage(error, 'Error al registrar');
      setMessage({
        type: 'error',
        title: '❌ Error en el registro',
        text: errorMsg,
      });

      // Mostrar Alert también para asegurar que se vea
      Alert.alert('❌ Error en el registro', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>

      {/* Mensaje de éxito/error flotante */}
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
        rules={{
          required: 'Email obligatorio',
          pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' },
        }}
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
        rules={{
          required: 'Contraseña obligatoria',
          minLength: { value: 6, message: 'Mínimo 6 caracteres' },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Contraseña (mín. 6 caracteres)"
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
            title={loading ? 'Registrando...' : 'Registrarse'}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          />
          {loading && <ActivityIndicator color="#2563eb" style={styles.spinner} />}
        </View>

        <View style={{ height: 10 }} />

        <Button
          title="Volver al Login"
          onPress={() => navigation.navigate('Login')}
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