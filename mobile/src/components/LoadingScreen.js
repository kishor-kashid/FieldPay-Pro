/**
 * Loading Screen Component
 * Clean Scapes P4P System - Mobile App
 * 
 * Simple loading screen displayed while app initializes.
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>FieldPay-Pro</Text>
      <ActivityIndicator size="large" color="#007AFF" style={styles.spinner} />
      <Text style={styles.text}>Loading...</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 30,
  },
  spinner: {
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
});

