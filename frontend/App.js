import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Pantallas
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import DashboardScreen from './src/screens/Dashboard/DashboardScreen';
import AccountsScreen from './src/screens/Accounts/AccountsScreen';
import AddAccountScreen from './src/screens/Accounts/AddAccountScreen';
import TransactionsScreen from './src/screens/Transactions/TransactionsScreen';
import TransactionFormScreen from './src/screens/Transactions/TransactionFormScreen';
import BudgetsScreen from './src/screens/Budgets/BudgetsScreen';
import BudgetFormScreen from './src/screens/Budgets/BudgetFormScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Accounts" component={AccountsScreen} />
        <Stack.Screen name="AddAccount" component={AddAccountScreen} />
        <Stack.Screen name="Transactions" component={TransactionsScreen} />
        <Stack.Screen name="TransactionForm" component={TransactionFormScreen} />
        <Stack.Screen name="Budgets" component={BudgetsScreen} />
        <Stack.Screen name="BudgetForm" component={BudgetFormScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}