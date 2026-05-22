import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DatePicker from 'react-native-date-picker';

export default function TransactionFilters({
  categories,
  accounts,
  onFilterChange,
}) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    updateFilters(value, selectedAccount, startDate, endDate);
  };

  const handleAccountChange = (value) => {
    setSelectedAccount(value);
    updateFilters(selectedCategory, value, startDate, endDate);
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    updateFilters(selectedCategory, selectedAccount, date, endDate);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    updateFilters(selectedCategory, selectedAccount, startDate, date);
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
    setStartDate(new Date());
    setEndDate(new Date());
    updateFilters('', '', new Date(), new Date());
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.filtersSection}>
        <Text style={styles.filterTitle}>Filtros</Text>

        {/* Categoría */}
        <View style={styles.filterGroup}>
          <Text style={styles.label}>Categoría</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={handleCategoryChange}
              style={styles.picker}
            >
              <Picker.Item label="Todas las categorías" value="" />
              {categories.map((cat) => (
                <Picker.Item
                  key={cat.id}
                  label={cat.nombre}
                  value={cat.id.toString()}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Cuenta */}
        <View style={styles.filterGroup}>
          <Text style={styles.label}>Cuenta</Text>
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
        </View>

        {/* Fecha inicio */}
        <View style={styles.filterGroup}>
          <Text style={styles.label}>Desde</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartDate(true)}
          >
            <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
          </TouchableOpacity>
          {showStartDate && (
            <DatePicker
              modal
              open={showStartDate}
              date={startDate}
              onConfirm={(date) => {
                setStartDate(date);
                handleStartDateChange(date);
                setShowStartDate(false);
              }}
              onCancel={() => setShowStartDate(false)}
              mode="date"
              locale="es"
            />
          )}
        </View>

        {/* Fecha fin */}
        <View style={styles.filterGroup}>
          <Text style={styles.label}>Hasta</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndDate(true)}
          >
            <Text style={styles.dateButtonText}>{formatDate(endDate)}</Text>
          </TouchableOpacity>
          {showEndDate && (
            <DatePicker
              modal
              open={showEndDate}
              date={endDate}
              onConfirm={(date) => {
                setEndDate(date);
                handleEndDateChange(date);
                setShowEndDate(false);
              }}
              onCancel={() => setShowEndDate(false)}
              mode="date"
              locale="es"
            />
          )}
        </View>

        {/* Botón Limpiar */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetFilters}
        >
          <Text style={styles.resetButtonText}>Limpiar Filtros</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    maxHeight: 350,
  },
  filtersSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  filterGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: 40,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#333',
  },
  resetButton: {
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: '#ef4444',
    borderRadius: 6,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
