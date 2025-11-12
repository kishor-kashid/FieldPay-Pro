/**
 * Breakdown Screen
 * Clean Scapes P4P System - Mobile App
 * 
 * Detailed breakdown screen showing how pay was calculated.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { payrollAPI } from '../services/api';
import { formatCurrency, formatDate, formatHours } from '../utils/formatters';
import LoadingScreen from '../components/LoadingScreen';
import JobBreakdownCard from '../components/JobBreakdownCard';

export default function BreakdownScreen() {
  const { t, i18n } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payrollRecord, setPayrollRecord] = useState(null);
  const [error, setError] = useState(null);

  // Get record ID from route params or use yesterday's date
  const recordId = route.params?.recordId;
  const date = route.params?.date;

  // Fetch payroll record details
  const fetchBreakdownData = useCallback(async () => {
    try {
      setError(null);
      let response;
      let record = null;

      if (recordId) {
        // Fetch by ID
        response = await payrollAPI.getRecord(recordId);
        if (response.data && response.data.record) {
          record = response.data.record;
        }
      } else if (date) {
        // Fetch by date
        response = await payrollAPI.getRecords({ date });
        // Backend returns: { success: true, count: N, records: [...] }
        const records = response.data?.records || response.data?.data || [];
        if (records && records.length > 0) {
          record = records[0];
        }
      } else {
        // Default to yesterday
        response = await payrollAPI.getYesterdayRecord();
        // Backend returns: { success: true, count: N, records: [...] }
        const records = response.data?.records || response.data?.data || [];
        if (records && records.length > 0) {
          record = records[0];
        }
      }

      setPayrollRecord(record);
    } catch (err) {
      console.error('Error fetching breakdown data:', err);
      setError(err.response?.data?.message || t('errors.networkError'));
      Alert.alert(t('common.error'), t('errors.networkError'), [
        { text: t('common.retry'), onPress: fetchBreakdownData },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [recordId, date, t]);

  useEffect(() => {
    fetchBreakdownData();
  }, [fetchBreakdownData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBreakdownData();
  }, [fetchBreakdownData]);

  if (loading) {
    return <LoadingScreen message={t('breakdown.loading')} />;
  }

  if (!payrollRecord) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('breakdown.noData')}</Text>
        </View>
      </ScrollView>
    );
  }

  const {
    date: recordDate,
    base_pay,
    base_rate,
    hours_worked,
    late_penalty = 0,
    long_lunch_penalty = 0,
    penalties = 0,
    total_penalties = 0,
    total_pay,
    job_count = 0,
  } = payrollRecord;

  const totalPenalties = total_penalties || penalties || (late_penalty + long_lunch_penalty);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Date Header */}
      <View style={styles.dateHeader}>
        <Text style={styles.dateLabel}>{t('breakdown.date')}</Text>
        <Text style={styles.dateValue}>
          {formatDate(recordDate, i18n.language)}
        </Text>
      </View>

      {/* Base Pay Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('breakdown.basePay')}</Text>
        <Text style={styles.sectionDescription}>
          {t('breakdown.basePayDescription')}
        </Text>
        <View style={styles.calculationRow}>
          <Text style={styles.calculationLabel}>
            {formatHours(hours_worked)} {t('breakdown.hours')} × {formatCurrency(base_rate, i18n.language)}/{t('breakdown.hour')}
          </Text>
          <Text style={styles.calculationValue}>
            {formatCurrency(base_pay, i18n.language)}
          </Text>
        </View>
      </View>

      {/* Penalties Section */}
      {totalPenalties > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.penaltyTitle]}>
            {t('breakdown.penalties')}
          </Text>
          <Text style={styles.sectionDescription}>
            {t('breakdown.penaltiesDescription')}
          </Text>

          {late_penalty > 0 && (
            <View style={styles.penaltyRow}>
              <Text style={styles.penaltyLabel}>
                {t('breakdown.latePenalty')}
              </Text>
              <Text style={styles.penaltyValue}>
                -{formatCurrency(late_penalty, i18n.language)}
              </Text>
            </View>
          )}

          {long_lunch_penalty > 0 && (
            <View style={styles.penaltyRow}>
              <Text style={styles.penaltyLabel}>
                {t('breakdown.lunchPenalty')}
              </Text>
              <Text style={styles.penaltyValue}>
                -{formatCurrency(long_lunch_penalty, i18n.language)}
              </Text>
            </View>
          )}

          <View style={styles.divider} />
          <View style={styles.penaltyRow}>
            <Text style={styles.penaltyTotalLabel}>
              {t('breakdown.totalPenalties')}
            </Text>
            <Text style={styles.penaltyTotalValue}>
              -{formatCurrency(totalPenalties, i18n.language)}
            </Text>
          </View>
        </View>
      )}

      {/* Jobs Section */}
      {job_count > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('breakdown.jobs')} ({job_count})
          </Text>
          <Text style={styles.sectionDescription}>
            {t('breakdown.jobsDescription')}
          </Text>
          {/* Note: Job-by-job breakdown would require additional API endpoint */}
          <View style={styles.jobsPlaceholder}>
            <Text style={styles.jobsPlaceholderText}>
              {t('breakdown.jobsNote')}
            </Text>
          </View>
        </View>
      )}

      {/* Total Section */}
      <View style={[styles.section, styles.totalSection]}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{t('breakdown.total')}</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(total_pay, i18n.language)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  dateHeader: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dateLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  calculationLabel: {
    fontSize: 15,
    color: '#6b7280',
    flex: 1,
  },
  calculationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  penaltyTitle: {
    color: '#dc2626',
  },
  penaltyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  penaltyLabel: {
    fontSize: 15,
    color: '#6b7280',
  },
  penaltyValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#dc2626',
  },
  penaltyTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  penaltyTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  jobsPlaceholder: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  jobsPlaceholderText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  totalSection: {
    backgroundColor: '#f0fdf4',
    borderTopWidth: 2,
    borderTopColor: '#10b981',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
});

