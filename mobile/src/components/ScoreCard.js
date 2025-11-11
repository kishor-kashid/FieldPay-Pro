/**
 * ScoreCard Component
 * Clean Scapes P4P System - Mobile App
 * 
 * Displays performance score with star rating and motivational message.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatPercentage } from '../utils/formatters';

/**
 * Get star rating based on efficiency score
 * @param {number} efficiency - Efficiency percentage (0-100+)
 * @returns {number} Star rating (1-5)
 */
function getStarRating(efficiency) {
  if (efficiency >= 100) return 5;
  if (efficiency >= 90) return 4;
  if (efficiency >= 75) return 3;
  if (efficiency >= 60) return 2;
  return 1;
}

/**
 * Get motivational message key based on star rating
 * @param {number} stars - Star rating (1-5)
 * @returns {string} Translation key for motivational message
 */
function getMotivationalMessageKey(stars) {
  if (stars === 5) return 'dashboard.excellent';
  if (stars === 4) return 'dashboard.greatJob';
  if (stars === 3) return 'dashboard.goodWork';
  if (stars === 2) return 'dashboard.keepTrying';
  return 'dashboard.needsImprovement';
}

/**
 * Get color based on star rating
 * @param {number} stars - Star rating (1-5)
 * @returns {string} Color hex code
 */
function getColorForRating(stars) {
  if (stars === 5) return '#10b981'; // green
  if (stars === 4) return '#3b82f6'; // blue
  if (stars === 3) return '#f59e0b'; // amber
  if (stars === 2) return '#f97316'; // orange
  return '#ef4444'; // red
}

export default function ScoreCard({ efficiency }) {
  const { t } = useTranslation();
  
  const stars = getStarRating(efficiency);
  const messageKey = getMotivationalMessageKey(stars);
  const color = getColorForRating(stars);
  
  // Create star display
  const starDisplay = '★'.repeat(stars) + '☆'.repeat(5 - stars);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('dashboard.performanceScore')}</Text>
      
      <Text style={[styles.score, { color }]}>
        {formatPercentage(efficiency / 100, 1)}
      </Text>
      
      <Text style={[styles.stars, { color }]}>
        {starDisplay}
      </Text>
      
      <Text style={styles.message}>
        {t(messageKey)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  score: {
    fontSize: 56,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  stars: {
    fontSize: 32,
    marginVertical: 8,
    letterSpacing: 4,
  },
  message: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
});

