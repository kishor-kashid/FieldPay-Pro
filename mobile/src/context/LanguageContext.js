/**
 * Language Context
 * Clean Scapes P4P System - Mobile App
 * 
 * Manages language state and provides language switching functionality.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, getCurrentLanguage } from '../i18n';
import { saveLanguage, getLanguage } from '../utils/storage';

const LanguageContext = createContext();

/**
 * Custom hook to use language context
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

/**
 * Language Provider Component
 */
export function LanguageProvider({ children }) {
  const { i18n, ready } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');
  const [loading, setLoading] = useState(true);

  /**
   * Load language preference on mount (after i18n is ready)
   */
  useEffect(() => {
    if (ready) {
      loadLanguage();
    }
  }, [ready]);

  /**
   * Load stored language preference
   */
  async function loadLanguage() {
    try {
      const storedLanguage = await getLanguage();
      const activeLanguage = getCurrentLanguage();
      
      // If stored language differs from active, change it
      if (storedLanguage && storedLanguage !== activeLanguage) {
        await changeLanguage(storedLanguage);
        setCurrentLanguage(storedLanguage);
      } else {
        setCurrentLanguage(activeLanguage);
      }
    } catch (error) {
      console.error('Failed to load language:', error);
      setCurrentLanguage('en');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Switch language
   * @param {string} language - Language code ('en' or 'es')
   */
  async function switchLanguage(language) {
    if (language !== 'en' && language !== 'es') {
      console.warn('Invalid language code. Must be "en" or "es"');
      return;
    }

    try {
      // Change i18n language
      await changeLanguage(language);
      
      // Save to storage
      await saveLanguage(language);
      
      // Update state
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Failed to switch language:', error);
    }
  }

  /**
   * Toggle between English and Spanish
   */
  function toggleLanguage() {
    const newLanguage = currentLanguage === 'en' ? 'es' : 'en';
    switchLanguage(newLanguage);
  }

  const value = {
    currentLanguage,
    switchLanguage,
    toggleLanguage,
    loading,
  };

  // Wait for i18n to be ready before rendering children
  if (!ready || loading) {
    return null; // Or return a loading spinner component
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export default LanguageContext;

