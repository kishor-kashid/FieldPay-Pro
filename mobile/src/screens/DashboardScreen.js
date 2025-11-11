/**
 * Dashboard Screen
 * Clean Scapes P4P System - Mobile App
 * 
 * Main dashboard showing yesterday's performance with score, payout breakdown, and quick stats.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { payrollAPI } from '../services/api';
import { formatDate } from '../utils/formatters';
import ScoreCard from '../components/ScoreCard';
import PayoutBreakdown from '../components/PayoutBreakdown';
import QuickStats from '../components/QuickStats';
import LoadingScreen from '../components/LoadingScreen';

export default function DashboardScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payrollRecord, setPayrollRecord] = useState(null);
  const [error, setError] = useState(null);

  // Fetch yesterday's payroll data
  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      const response = await payrollAPI.getYesterdayRecord();
      
      if (response.data && response.data.length > 0) {
        // Get the first record (should only be one for yesterday)
        setPayrollRecord(response.data[0]);
      } else {
        setPayrollRecord(null);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || t('errors.networkError'));
      
      // Show error alert
      Alert.alert(
        t('common.error'),
        err.response?.data?.message || t('errors.networkError'),
        [
          { text: t('common.ok') },
          { text: t('common.retry'), onPress: () => fetchDashboardData() },
        ]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Show loading screen on initial load
  if (loading) {
    return <LoadingScreen message={t('dashboard.loading')} />;
  }

  // Show no data message if no payroll record found
  if (!payrollRecord && !error) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.centerContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.noDataIcon}>📊</Text>
        <Text style={styles.noDataText}>{t('dashboard.noData')}</Text>
        <Text style={styles.noDataSubtext}>
          {t('dashboard.refresh')}
        </Text>
      </ScrollView>
    );
  }

  // Calculate efficiency for score display
  // Note: Since bonuses are removed, we'll use a simple metric
  // For now, we'll calculate efficiency based on base_pay vs expected pay
  // Or we can just show a fixed good score if no penalties
  const efficiency = payrollRecord ? calculateEfficiency(payrollRecord) : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('dashboard.title')}</Text>
        <Text style={styles.subtitle}>
          {t('dashboard.yesterday')} • {formatDate(payrollRecord?.date, i18n.language)}
        </Text>
      </View>

      {/* Score Card */}
      <ScoreCard efficiency={efficiency} />

      {/* Payout Breakdown */}
      <PayoutBreakdown payrollRecord={payrollRecord} language={i18n.language} />

      {/* Quick Stats */}
      <QuickStats payrollRecord={payrollRecord} />

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.buttonText}>{t('dashboard.viewHistory')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/**
 * Calculate efficiency score for display
 * Since the system now uses: Total Pay = Base Pay - Penalties
 * We'll calculate efficiency as: (Total Pay / Base Pay) * 100
 * This gives a percentage showing how much of base pay was retained
 */
function calculateEfficiency(record) {
  if (!record || !record.base_pay) return 0;
  
  const basePay = record.base_pay;
  const totalPay = record.total_pay;
  
  // Calculate retention percentage
  const efficiency = (totalPay / basePay) * 100;
  
  // Cap at 100% for display purposes
  return Math.min(efficiency, 100);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  noDataIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 8,
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
