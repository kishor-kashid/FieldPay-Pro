/**
 * History Screen
 * Clean Scapes P4P System - Mobile App
 * 
 * Shows last 30 days of performance with trend chart and history cards.
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
import { useNavigation } from '@react-navigation/native';
import { payrollAPI } from '../services/api';
import { formatCurrency, formatDate, formatShortDate } from '../utils/formatters';
import LoadingScreen from '../components/LoadingScreen';
import HistoryCard from '../components/HistoryCard';
import PerformanceTrendChart from '../components/PerformanceTrendChart';

export default function HistoryScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [error, setError] = useState(null);

  // Fetch last 30 days of payroll data
  const fetchHistoryData = useCallback(async () => {
    try {
      setError(null);
      const response = await payrollAPI.getHistory(30);
      
      // Backend returns: { success: true, count: N, records: [...] }
      const records = response.data?.records || response.data?.data || [];
      
      if (records && records.length > 0) {
        // Sort by date descending (most recent first)
        const sorted = records.sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });
        setHistoryRecords(sorted);
      } else {
        setHistoryRecords([]);
      }
    } catch (err) {
      console.error('Error fetching history data:', err);
      setError(err.response?.data?.message || err.message || t('errors.networkError'));
      Alert.alert(t('common.error'), t('errors.networkError'), [
        { text: t('common.retry'), onPress: fetchHistoryData },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchHistoryData();
  }, [fetchHistoryData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistoryData();
  }, [fetchHistoryData]);

  // Calculate statistics
  const calculateStats = () => {
    if (historyRecords.length === 0) {
      return {
        average: 0,
        bestDay: null,
        totalEarned: 0,
      };
    }

    const totalEarned = historyRecords.reduce((sum, record) => sum + (record.total_pay || 0), 0);
    const average = totalEarned / historyRecords.length;
    const bestDay = historyRecords.reduce((best, record) => {
      return (record.total_pay || 0) > (best?.total_pay || 0) ? record : best;
    }, historyRecords[0]);

    return {
      average,
      bestDay,
      totalEarned,
    };
  };

  const stats = calculateStats();

  // Calculate efficiency for each record (for chart)
  const calculateEfficiency = (record) => {
    if (!record || !record.base_pay) return 0;
    const efficiency = (record.total_pay / record.base_pay) * 100;
    return Math.min(efficiency, 100);
  };

  if (loading) {
    return <LoadingScreen message={t('history.loading')} />;
  }

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

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('history.last30Days')}</Text>
      </View>

      {/* Statistics Cards */}
      {historyRecords.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('history.average')}</Text>
            <Text style={styles.statValue}>
              {formatCurrency(stats.average, i18n.language)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('history.bestDay')}</Text>
            <Text style={styles.statValue}>
              {formatCurrency(stats.bestDay?.total_pay || 0, i18n.language)}
            </Text>
            {stats.bestDay && (
              <Text style={styles.statSubtext}>
                {formatShortDate(stats.bestDay.date, i18n.language)}
              </Text>
            )}
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('history.totalEarned')}</Text>
            <Text style={styles.statValue}>
              {formatCurrency(stats.totalEarned, i18n.language)}
            </Text>
          </View>
        </View>
      )}

      {/* Performance Trend Chart */}
      {historyRecords.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{t('history.performanceTrend')}</Text>
          <PerformanceTrendChart records={historyRecords} />
        </View>
      )}

      {/* History List */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>{t('history.title')}</Text>
        {historyRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('history.noData')}</Text>
          </View>
        ) : (
          historyRecords.map((record) => {
            const efficiency = calculateEfficiency(record);
            return (
              <HistoryCard
                key={record.id}
                record={record}
                efficiency={efficiency}
                onPress={() => {
                  navigation.navigate('Breakdown', {
                    recordId: record.id,
                    date: record.date,
                  });
                }}
              />
            );
          })
        )}
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  statSubtext: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});
