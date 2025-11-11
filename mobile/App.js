/**
 * App Entry Point
 * Clean Scapes P4P System - Mobile App
 * 
 * Main entry point with providers and navigation setup.
 */

// IMPORTANT: react-native-gesture-handler must be imported first
// Use try-catch for web compatibility
try {
  require('react-native-gesture-handler');
} catch (e) {
  // Not available on web, that's okay
}

import React from 'react';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { LanguageProvider } from './src/context/LanguageContext';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import StatusBar from './src/components/StatusBar';
import './src/i18n'; // Initialize i18n

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
