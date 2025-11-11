/**
 * i18n Configuration
 * Clean Scapes P4P System - Mobile App
 * 
 * Sets up react-i18next for bilingual support (English/Spanish).
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import en from './en.json';
import es from './es.json';

// AsyncStorage key for language preference
const LANGUAGE_KEY = '@app_language';

// Initialize i18n synchronously first (with default language)
// This ensures i18n is ready immediately when components mount
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      es: {
        translation: es,
      },
    },
    lng: 'en', // Start with English, will update after loading from storage
    fallbackLng: 'en', // Fallback to English if translation missing
    compatibilityJSON: 'v3', // For React Native compatibility
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Disable suspense for React Native
    },
  });

// Load stored language preference and update i18n asynchronously
// This runs in the background without blocking app initialization
(async function loadStoredLanguage() {
  try {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'es')) {
      await i18n.changeLanguage(storedLanguage);
    }
  } catch (error) {
    console.error('Failed to load stored language:', error);
    // Continue with default 'en' language
  }
})();

/**
 * Change language and save to AsyncStorage
 */
export async function changeLanguage(language) {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    await i18n.changeLanguage(language);
    return true;
  } catch (error) {
    console.error('Failed to change language:', error);
    return false;
  }
}

/**
 * Get current language
 */
export function getCurrentLanguage() {
  return i18n.language || 'en';
}

export default i18n;

