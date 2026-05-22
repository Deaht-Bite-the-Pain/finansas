import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import AccountsScreen from '../screens/Accounts/AccountsScreen';
import AddAccountScreen from '../screens/Accounts/AddAccountScreen';
import TransactionsScreen from '../screens/Transactions/TransactionsScreen';
import TransactionFormScreen from '../screens/Transactions/TransactionFormScreen';
import BudgetsScreen from '../screens/Budgets/BudgetsScreen';
import BudgetFormScreen from '../screens/Budgets/BudgetFormScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator({ isAuthenticated }) {
  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Accounts" component={AccountsScreen} />
          <Stack.Screen name="AddAccount" component={AddAccountScreen} />
          <Stack.Screen name="Transactions" component={TransactionsScreen} />
          <Stack.Screen name="TransactionForm" component={TransactionFormScreen} />
          <Stack.Screen name="Budgets" component={BudgetsScreen} />
          <Stack.Screen name="BudgetForm" component={BudgetFormScreen} />
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