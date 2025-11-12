/**
 * Storage Utility
 * Clean Scapes P4P System - Mobile App
 * 
 * Provides utility functions for AsyncStorage operations.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  LANGUAGE: '@app_language',
  USER_PROFILE: '@user_profile',
  AUTH_TOKEN: '@auth_token',
};

/**
 * Save language preference
 * @param {string} language - Language code ('en' or 'es')
 * @returns {Promise<boolean>} Success status
 */
export async function saveLanguage(language) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    return true;
  } catch (error) {
    console.error('Failed to save language:', error);
    return false;
  }
}

/**
 * Get stored language preference
 * @returns {Promise<string>} Language code ('en' or 'es')
 */
export async function getLanguage() {
  try {
    const language = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return language || 'en'; // Default to English
  } catch (error) {
    console.error('Failed to get language:', error);
    return 'en';
  }
}

/**
 * Save user profile
 * @param {object} profile - User profile object
 * @returns {Promise<boolean>} Success status
 */
export async function saveProfile(profile) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    return true;
  } catch (error) {
    console.error('Failed to save profile:', error);
    return false;
  }
}

/**
 * Get stored user profile
 * @returns {Promise<object|null>} User profile or null
 */
export async function getProfile() {
  try {
    const profile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return profile ? JSON.parse(profile) : null;
  } catch (error) {
    console.error('Failed to get profile:', error);
    return null;
  }
}

/**
 * Save auth token
 * @param {string} token - Authentication token
 * @returns {Promise<boolean>} Success status
 */
export async function saveToken(token) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    return true;
  } catch (error) {
    console.error('Failed to save token:', error);
    return false;
  }
}

/**
 * Get stored auth token
 * @returns {Promise<string|null>} Auth token or null
 */
export async function getToken() {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Failed to get token:', error);
    return null;
  }
}

/**
 * Clear all stored data
 * @returns {Promise<boolean>} Success status
 */
export async function clearAll() {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.LANGUAGE,
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.AUTH_TOKEN,
    ]);
    return true;
  } catch (error) {
    console.error('Failed to clear storage:', error);
    return false;
  }
}

