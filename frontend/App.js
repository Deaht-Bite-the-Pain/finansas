import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. Importa la pantalla nueva
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import AccountsScreen from './src/screens/Accounts/AccountsScreen';
import AddAccountScreen from './src/screens/Accounts/AddAccountScreen'; // <--- ESTA LÍNEA

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Accounts" component={AccountsScreen} />
        <Stack.Screen name="AddAccount" component={AddAccountScreen} /> {/* <--- ESTA LÍNEA */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}