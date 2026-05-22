import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import FinanzasInput from './UI/TextInput';
import Chip from './UI/Chip';
import Button from './UI/Button';
import { Colors, Typography, BorderRadius, Spacing } from '../theme/finansasTheme';

export default function TransactionFilters({
  categories,
  accounts,
  onFilterChange,
}) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [startDateText, setStartDateText] = useState('');
  const [endDateText, setEndDateText] = useState('');

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    updateFilters(value, selectedAccount, startDateText, endDateText);
  };

  const handleAccountChange = (value) => {
    setSelectedAccount(value);
    updateFilters(selectedCategory, value, startDateText, endDateText);
  };

  const handleStartDateChange = (text) => {
    setStartDateText(text);
    updateFilters(selectedCategory, selectedAccount, text, endDateText);
  };

  const handleEndDateChange = (text) => {
    setEndDateText(text);
    updateFilters(selectedCategory, selectedAccount, startDateText, text);
  };

  const updateFilters = (category, account, start, end) => {
    onFilterChange({
      categoria_id: category ? parseInt(category) : null,
      cuenta_id: account ? parseInt(account) : null,
      startDate: start,
      endDate: end,
    });
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedAccount('');
    setStartDateText('');
    setEndDateText('');
    updateFilters('', '', '', '');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.filtersSection}>
        <View style={styles.headerRow}>
          <Text style={styles.filterTitle}>FILTROS</Text>
          <TouchableOpacity onPress={resetFilters} activeOpacity={0.7}>
            <Text style={styles.clearText}>Limpiar</Text>
          </TouchableOpacity>
        </View>

        {/* Category */}
        <Text style={styles.label}>CATEGORIA</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={handleCategoryChange}
            style={styles.picker}
          >
            <Picker.Item label="Todas las categorias" value="" />
            {categories.map((cat) => (
              <Picker.Item
                key={cat.id}
                label={cat.nombre}
                value={cat.id.toString()}
              />
            ))}
          </Picker>
        </View>

        {/* Account */}
        <Text style={styles.label}>CUENTA</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedAccount}
            onValueChange={handleAccountChange}
            style={styles.picker}
          >
            <Picker.Item label="Todas las cuentas" value="" />
            {accounts.map((acc) => (
              <Picker.Item
                key={acc.id}
                label={acc.nombre}
                value={acc.id.toString()}
              />
            ))}
          </Picker>
        </View>

        {/* Dates */}
        <View style={styles.dateRow}>
          <View style={{ flex: 1 }}>
            <FinanzasInput
              label="Desde"
              placeholder="YYYY-MM-DD"
              value={startDateText}
              onChangeText={handleStartDateChange}
            />
          </View>
          <View style={{ flex: 1 }}>
            <FinanzasInput
              label="Hasta"
              placeholder="YYYY-MM-DD"
              value={endDateText}
              onChangeText={handleEndDateChange}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.paper,
    maxHeight: 380,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.hairline2,
    marginHorizontal: Spacing.lg + 4,
    marginBottom: Spacing.lg,
  },
  filtersSection: {
    padding: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  filterTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.muted,
    letterSpacing: 0.8,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.coral,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: Spacing.sm,
    paddingLeft: 4,
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: Colors.hairline,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    backgroundColor: Colors.paper,
    marginBottom: Spacing.md,
  },
  picker: {
    height: 44,
    color: Colors.ink,
  },
  dateRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
