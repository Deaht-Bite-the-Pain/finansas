import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/axios';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import { Colors, Typography, BorderRadius, Spacing, Shadows } from '../../theme/finansasTheme';

const ACCOUNT_ICONS = {
  Efectivo: { bg: Colors.moneySoft, emoji: '💵' },
  Banco: { bg: Colors.skySoft, emoji: '🏦' },
  Tarjeta: { bg: Colors.violetSoft, emoji: '💳' },
  Ahorros: { bg: Colors.goldSoft, emoji: '💰' },
};

function formatMoney(n) {
  return '$' + Math.abs(Number(n)).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function AccountsScreen({ navigation }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/accounts');
      setAccounts(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAccounts();
    }, [])
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    navigation.replace('Login');
  };

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.saldo), 0);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.money} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Mis Cuentas</Text>
                <Text style={styles.subtitle}>{accounts.length} cuentas activas</Text>
              </View>
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Text style={styles.logoutText}>Salir</Text>
              </TouchableOpacity>
            </View>

            {/* Net Worth Card (golden) */}
            <View style={styles.netWorthCard}>
              {/* Decorative circles */}
              <View style={styles.decoCircleA} />
              <View style={styles.decoCircleB} />
              <Text style={styles.netWorthLabel}>PATRIMONIO NETO</Text>
              <Text style={styles.netWorthAmount}>
                {totalBalance < 0 ? '−' : ''}${Math.abs(totalBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text style={styles.netWorthSub}>
                En {accounts.length} cuentas
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <View style={{ flex: 1 }}>
                <Button
                  title="＋ Nueva cuenta"
                  variant="primary"
                  onPress={() => navigation.navigate('AddAccount')}
                  fullWidth
                />
              </View>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.navigate('Transactions')}
                activeOpacity={0.7}
              >
                <Text style={styles.iconBtnText}>📊</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.navigate('Budgets')}
                activeOpacity={0.7}
              >
                <Text style={styles.iconBtnText}>📈</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        renderItem={({ item }) => {
          const saldo = Number(item.saldo);
          const isNeg = saldo < 0;
          const iconInfo = ACCOUNT_ICONS[item.tipo] || ACCOUNT_ICONS.Banco;

          return (
            <Card style={styles.accountCard}>
              <View style={styles.accountRow}>
                <View style={[styles.accountAvatar, { backgroundColor: iconInfo.bg }]}>
                  <Text style={styles.accountEmoji}>{iconInfo.emoji}</Text>
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{item.nombre}</Text>
                  <Text style={styles.accountType}>{item.tipo}</Text>
                </View>
                <View style={styles.accountRight}>
                  <Text style={[styles.accountBalance, { color: isNeg ? Colors.coral : Colors.ink }]}>
                    {isNeg ? '−' : ''}{formatMoney(saldo)}
                  </Text>
                  <Text style={[styles.accountStatus, { color: isNeg ? Colors.coral : Colors.money }]}>
                    {isNeg ? 'Deuda' : 'Disponible'}
                  </Text>
                </View>
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <Card flat style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>💳</Text>
            <Text style={styles.emptyTitle}>No tienes cuentas creadas aún.</Text>
            <Text style={styles.emptySub}>Crea tu primera cuenta para empezar.</Text>
          </Card>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingHorizontal: Spacing.lg + 4,
    paddingTop: 60,
    paddingBottom: Spacing.xxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: Colors.ink,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.muted,
    marginTop: 4,
  },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.backgroundWarm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.coral,
  },

  // Net Worth
  netWorthCard: {
    borderRadius: 22,
    padding: 20,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
    backgroundColor: Colors.gold2,
  },
  decoCircleA: {
    position: 'absolute',
    right: -30,
    bottom: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'rgba(47,36,16,0.2)',
    backgroundColor: 'transparent',
  },
  decoCircleB: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(47,36,16,0.2)',
    backgroundColor: 'transparent',
  },
  netWorthLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: 'rgba(47,36,16,0.7)',
    textTransform: 'uppercase',
  },
  netWorthAmount: {
    fontSize: 36,
    fontWeight: '600',
    color: '#2F2410',
    fontVariant: ['tabular-nums'],
    marginTop: 10,
  },
  netWorthSub: {
    fontSize: 13,
    color: 'rgba(47,36,16,0.7)',
    fontWeight: '500',
    marginTop: 6,
  },

  // Actions
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.backgroundWarm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnText: {
    fontSize: 22,
  },

  // Account Card
  accountCard: {
    marginBottom: Spacing.md,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  accountAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountEmoji: {
    fontSize: 20,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.ink,
  },
  accountType: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 2,
  },
  accountRight: {
    alignItems: 'flex-end',
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  accountStatus: {
    fontSize: 11,
    marginTop: 2,
  },

  // Empty
  emptyCard: {
    alignItems: 'center',
    padding: 26,
  },
  emptyEmoji: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontWeight: '600',
    color: Colors.ink,
    fontSize: 16,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.muted,
    marginTop: 4,
  },
});
