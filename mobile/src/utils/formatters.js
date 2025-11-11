/**
 * Formatters Utility
 * Clean Scapes P4P System - Mobile App
 * 
 * Utility functions for formatting currency, dates, and percentages with i18n support.
 */

/**
 * Format currency value with proper locale and currency symbol
 * @param {number} amount - The amount to format
 * @param {string} language - Language code ('en' or 'es')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, language = 'en') {
  const locale = language === 'es' ? 'es-US' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

/**
 * Format date with proper locale
 * @param {string|Date} date - The date to format
 * @param {string} language - Language code ('en' or 'es')
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(date, language = 'en', options = {}) {
  const locale = language === 'es' ? 'es-US' : 'en-US';
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
}

/**
 * Format date as short version (e.g., "Jan 15" or "15 ene")
 * @param {string|Date} date - The date to format
 * @param {string} language - Language code ('en' or 'es')
 * @returns {string} Formatted short date string
 */
export function formatShortDate(date, language = 'en') {
  return formatDate(date, language, { month: 'short', day: 'numeric' });
}

/**
 * Format percentage value
 * @param {number} value - The value to format (e.g., 0.95 for 95%)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, decimals = 0) {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format hours to display with 1 decimal place
 * @param {number} hours - The hours value
 * @returns {string} Formatted hours string
 */
export function formatHours(hours) {
  return (hours || 0).toFixed(1);
}

/**
 * Get yesterday's date as ISO string (YYYY-MM-DD)
 * @returns {string} Yesterday's date
 */
export function getYesterdayDate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

/**
 * Get date N days ago as ISO string (YYYY-MM-DD)
 * @param {number} daysAgo - Number of days ago
 * @returns {string} Date string
 */
export function getDateDaysAgo(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

