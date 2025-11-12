/**
 * History Card Component
 * Clean Scapes P4P System - Mobile App
 * 
 * Displays single day's performance in history list.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FontAwesome } from '@expo/vector-icons';
import { formatCurrency, formatShortDate } from '../utils/formatters';
import ScoreCard from './ScoreCard';

export default function HistoryCard({ record, efficiency, onPress }) {
  const { t, i18n } = useTranslation();

  if (!record) {
    return null;
  }

  const { date, total_pay } = record;

  // Get star rating based on efficiency
  const getStarRating = (eff) => {
    if (eff >= 100) return 5;
    if (eff >= 90) return 4;
    if (eff >= 75) return 3;
    if (eff >= 60) return 2;
    return 1;
  };

  const stars = getStarRating(efficiency);
  const starColor = efficiency >= 90 ? '#10b981' : efficiency >= 75 ? '#3b82f6' : efficiency >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Date and Score */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.date}>{formatShortDate(date, i18n.language)}</Text>
          <Text style={styles.efficiency}>{efficiency.toFixed(0)}%</Text>
        </View>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <FontAwesome
              key={i}
              name={i <= stars ? 'star' : 'star-o'}
              size={16}
              color={starColor}
              style={styles.star}
            />
          ))}
        </View>
      </View>

      {/* Payout */}
      <View style={styles.payoutRow}>
        <Text style={styles.payoutLabel}>{t('history.payout')}</Text>
        <Text style={styles.payoutValue}>
          {formatCurrency(total_pay || 0, i18n.language)}
        </Text>
      </View>

      {/* Tap indicator */}
      <View style={styles.footer}>
        <Text style={styles.tapText}>{t('history.tapToView')}</Text>
        <FontAwesome name="chevron-right" size={12} color="#6b7280" />
      </View>
    </TouchableOpacity>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  efficiency: {
    fontSize: 14,
    color: '#6b7280',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  star: {
    marginHorizontal: 1,
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  payoutLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  payoutValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  tapText: {
    fontSize: 12,
    color: '#6b7280',
  },
});

