import React from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import api from '../../api/axios';

export default function AddAccountScreen({ navigation }) {
  const { control, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.post('/accounts', data);
      Alert.alert("Éxito", "Cuenta creada");
      navigation.goBack(); // Regresa a la lista de cuentas
    } catch (error) {
      Alert.alert("Error", "No se pudo crear la cuenta");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Controller control={control} name="nombre" render={({field: {onChange, value}}) => (
        <TextInput placeholder="Nombre (ej. Efectivo)" value={value} onChangeText={onChange} style={{borderWidth:1, marginBottom:10, padding:8}} />
      )} />
      <Controller control={control} name="tipo" render={({field: {onChange, value}}) => (
        <TextInput placeholder="Tipo (ej. Banco)" value={value} onChangeText={onChange} style={{borderWidth:1, marginBottom:10, padding:8}} />
      )} />
      <Button title="Guardar Cuenta" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}