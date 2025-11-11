/**
 * Dashboard Screen (Placeholder)
 * Clean Scapes P4P System - Mobile App
 * 
 * Placeholder for dashboard screen - will be fully implemented in PR #15
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function DashboardScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('dashboard.title')}</Text>
      <Text style={styles.subtext}>Coming in PR #15</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: '#666',
  },
});

