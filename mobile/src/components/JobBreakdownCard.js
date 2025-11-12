/**
 * Job Breakdown Card Component
 * Clean Scapes P4P System - Mobile App
 * 
 * Displays individual job breakdown with budgeted vs actual hours and efficiency.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FontAwesome } from '@expo/vector-icons';
import { formatHours, formatPercentage } from '../utils/formatters';

export default function JobBreakdownCard({ job, language }) {
  const { t, i18n } = useTranslation();
  const currentLanguage = language || i18n.language;

  if (!job) {
    return null;
  }

  const {
    service_type,
    client,
    budgeted_hours,
    actual_hours,
  } = job;

  // Calculate efficiency
  const efficiency = budgeted_hours > 0
    ? (budgeted_hours / actual_hours) * 100
    : 0;

  // Determine status icon and color
  const getStatus = () => {
    if (efficiency >= 100) {
      return { icon: 'check-circle', color: '#10b981' }; // Green - excellent
    } else if (efficiency >= 90) {
      return { icon: 'check-circle-o', color: '#3b82f6' }; // Blue - good
    } else if (efficiency >= 75) {
      return { icon: 'exclamation-circle', color: '#f59e0b' }; // Amber - warning
    } else {
      return { icon: 'times-circle', color: '#ef4444' }; // Red - poor
    }
  };

  const status = getStatus();

  return (
    <View style={styles.container}>
      {/* Job Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.jobType}>{service_type || t('breakdown.unknownJob')}</Text>
          {client && <Text style={styles.client}>{client}</Text>}
        </View>
        <FontAwesome name={status.icon} size={24} color={status.color} />
      </View>

      {/* Hours Comparison */}
      <View style={styles.hoursContainer}>
        <View style={styles.hoursRow}>
          <Text style={styles.hoursLabel}>{t('breakdown.budgetedHours')}</Text>
          <Text style={styles.hoursValue}>
            {formatHours(budgeted_hours)} {t('breakdown.hours')}
          </Text>
        </View>
        <View style={styles.hoursRow}>
          <Text style={styles.hoursLabel}>{t('breakdown.actualHours')}</Text>
          <Text style={styles.hoursValue}>
            {formatHours(actual_hours)} {t('breakdown.hours')}
          </Text>
        </View>
      </View>

      {/* Efficiency */}
      <View style={styles.efficiencyContainer}>
        <Text style={styles.efficiencyLabel}>{t('breakdown.efficiency')}</Text>
        <Text style={[styles.efficiencyValue, { color: status.color }]}>
          {formatPercentage(efficiency / 100, 1)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  jobType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  client: {
    fontSize: 14,
    color: '#6b7280',
  },
  hoursContainer: {
    marginBottom: 12,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  hoursLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  hoursValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  efficiencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  efficiencyLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  efficiencyValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

