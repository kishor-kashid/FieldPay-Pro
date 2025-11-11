/**
 * QuickStats Component
 * Clean Scapes P4P System - Mobile App
 * 
 * Displays quick performance statistics (hours, jobs, on time, lunch).
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatHours } from '../utils/formatters';

export default function QuickStats({ payrollRecord }) {
  const { t } = useTranslation();
  
  if (!payrollRecord) {
    return null;
  }

  const hours = payrollRecord.hours_worked || 0;
  const jobs = payrollRecord.jobs_completed || 0;
  
  // Determine on time status based on penalties
  const hasLatePenalty = payrollRecord.late_penalty > 0;
  const hasLunchPenalty = payrollRecord.lunch_penalty > 0;
  
  const onTime = !hasLatePenalty;
  const lunchOk = !hasLunchPenalty;

  return (
    <View style={styles.container}>
      {/* Hours */}
      <View style={styles.statBox}>
        <Text style={styles.statValue}>{formatHours(hours)}</Text>
        <Text style={styles.statLabel}>{t('dashboard.hours')}</Text>
      </View>

      {/* Jobs */}
      <View style={styles.statBox}>
        <Text style={styles.statValue}>{jobs}</Text>
        <Text style={styles.statLabel}>{t('dashboard.jobs')}</Text>
      </View>

      {/* On Time */}
      <View style={styles.statBox}>
        <Text style={[styles.statIcon, onTime ? styles.success : styles.warning]}>
          {onTime ? '✓' : '✗'}
        </Text>
        <Text style={styles.statLabel}>{t('dashboard.onTime')}</Text>
      </View>

      {/* Lunch */}
      <View style={styles.statBox}>
        <Text style={[styles.statIcon, lunchOk ? styles.success : styles.warning]}>
          {lunchOk ? '✓' : '✗'}
        </Text>
        <Text style={styles.statLabel}>{t('dashboard.lunch')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  success: {
    color: '#10b981',
  },
  warning: {
    color: '#ef4444',
  },
});

