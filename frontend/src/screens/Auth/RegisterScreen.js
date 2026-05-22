import React from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import api from '../../api/axios';
import { getApiErrorMessage } from '../../utils/apiError';

export default function RegisterScreen({ navigation }) {
  const { control, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/register', data);
      Alert.alert('Éxito', 'Usuario registrado correctamente');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', getApiErrorMessage(error, 'Error al registrar'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>
      
      <Controller
        control={control}
        rules={{ required: "Email obligatorio", pattern: { value: /^\S+@\S+$/i, message: "Email inválido" } }}
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Email" onChangeText={onChange} value={value} autoCapitalize="none" />
        )}
        name="email"
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <Controller
        control={control}
        rules={{ required: "Contraseña obligatoria", minLength: { value: 6, message: "Mínimo 6 caracteres" } }}
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry onChangeText={onChange} value={value} />
        )}
        name="password"
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      <View style={styles.buttons}>
        <Button title="Registrarse" onPress={handleSubmit(onSubmit)} />
        <View style={{height: 10}} />
        <Button title="Volver al Login" onPress={() => navigation.navigate('Login')} color="gray" />
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