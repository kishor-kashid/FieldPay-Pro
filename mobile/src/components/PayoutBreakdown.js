/**
 * PayoutBreakdown Component
 * Clean Scapes P4P System - Mobile App
 * 
 * Displays detailed payout breakdown with base pay, bonuses, penalties, and total.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/formatters';

export default function PayoutBreakdown({ payrollRecord, language }) {
  const { t, i18n } = useTranslation();
  const currentLanguage = language || i18n.language;
  
  if (!payrollRecord) {
    return null;
  }

  const basePay = payrollRecord.base_pay || 0;
  const penalties = payrollRecord.penalties || payrollRecord.total_penalties || 0;
  const totalPay = payrollRecord.total_pay || 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('dashboard.payout')}</Text>
      
      {/* Base Pay */}
      <View style={styles.row}>
        <Text style={styles.label}>{t('dashboard.basePay')}</Text>
        <Text style={styles.value}>
          {formatCurrency(basePay, currentLanguage)}
        </Text>
      </View>

      {/* Penalties (if any) */}
      {penalties > 0 && (
        <View style={styles.row}>
          <Text style={[styles.label, styles.penalty]}>
            {t('dashboard.penalties')}
          </Text>
          <Text style={[styles.value, styles.penalty]}>
            -{formatCurrency(penalties, currentLanguage)}
          </Text>
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Total */}
      <View style={styles.row}>
        <Text style={styles.totalLabel}>{t('dashboard.total')}</Text>
        <Text style={styles.totalValue}>
          {formatCurrency(totalPay, currentLanguage)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 15,
    color: '#6b7280',
  },
  value: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  penalty: {
    color: '#ef4444',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
});

