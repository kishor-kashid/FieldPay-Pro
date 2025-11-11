/**
 * Language Toggle Component
 * Clean Scapes P4P System - Mobile App
 * 
 * Toggle switch between English and Spanish with flag icons.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageToggle({ 
  currentLanguage: propLanguage, 
  onLanguageChange,
  disabled = false 
}) {
  const { t } = useTranslation();
  const { currentLanguage: contextLanguage, switchLanguage } = useLanguage();
  
  // Use prop language if provided, otherwise use context
  const currentLanguage = propLanguage || contextLanguage;
  
  const handlePress = async () => {
    if (disabled) return;
    
    const newLanguage = currentLanguage === 'en' ? 'es' : 'en';
    
    if (onLanguageChange) {
      // Custom handler provided (e.g., for ProfileScreen to update server)
      await onLanguageChange(newLanguage);
    } else {
      // Default behavior: use context toggle
      await switchLanguage(newLanguage);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={handlePress}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
    >
      <View style={styles.content}>
        <Text style={styles.flag}>
          {currentLanguage === 'en' ? '🇺🇸' : '🇲🇽'}
        </Text>
        <Text style={styles.text}>
          {currentLanguage === 'en' ? t('language.english') : t('language.spanish')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flag: {
    fontSize: 20,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  disabled: {
    opacity: 0.5,
  },
});

