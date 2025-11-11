/**
 * Platform-compatible StatusBar Component
 * Clean Scapes P4P System - Mobile App
 * 
 * Wraps expo-status-bar with web compatibility.
 */

import React from 'react';
import { Platform } from 'react-native';

// Web-compatible StatusBar (no-op on web)
export default function StatusBar({ style, ...props }) {
  if (Platform.OS === 'web') {
    return null; // StatusBar doesn't exist on web
  }
  
  // Dynamically require on native platforms only
  try {
    // Use dynamic require to avoid bundling on web (Metro handles this)
    const StatusBarModule = require('expo-status-bar');
    const StatusBarComponent = StatusBarModule.StatusBar;
    return <StatusBarComponent style={style} {...props} />;
  } catch (e) {
    // StatusBar not available
    return null;
  }
}

