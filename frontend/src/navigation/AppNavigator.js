import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import AccountsScreen from '../screens/Accounts/AccountsScreen';
import AddAccountScreen from '../screens/Accounts/AddAccountScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator({ isAuthenticated }) {
  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Accounts" component={AccountsScreen} />
          <Stack.Screen name="AddAccount" component={AddAccountScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}