import React, { useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/axios';

export default function LoginScreen({ navigation }) {
  const { control, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    // Validar si ya hay sesión al abrir la app
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) navigation.replace('Accounts');
    };
    checkToken();
  }, []);

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/auth/login', data);
      await AsyncStorage.setItem('userToken', res.data.token);
      navigation.replace('Accounts');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Credenciales incorrectas');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>

      <Controller
        control={control}
        rules={{ required: "Email obligatorio" }}
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Email" onChangeText={onChange} value={value} autoCapitalize="none" />
        )}
        name="email"
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <Controller
        control={control}
        rules={{ required: "Contraseña obligatoria" }}
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry onChangeText={onChange} value={value} />
        )}
        name="password"
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      <View style={styles.buttons}>
        <Button title="Ingresar" onPress={handleSubmit(onSubmit)} />
        <View style={{height: 10}} />
        <Button title="Crear cuenta nueva" onPress={() => navigation.navigate('Register')} color="gray" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  input: { borderWidth: 1, padding: 10, marginBottom: 5, borderRadius: 5, borderColor: '#ccc' },
  error: { color: 'red', marginBottom: 10, fontSize: 12 },
  buttons: { marginTop: 10 }
});