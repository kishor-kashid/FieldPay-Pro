/**
 * External API Configuration
 * Manages configuration for Service Autopilot, Paychex, and mock APIs
 */

// Load environment variables (for local testing only, ignore errors in Cloud Functions)
try {
  require('dotenv').config({ path: '.env.local' });
} catch (error) {
  // Ignore dotenv errors in Cloud Functions environment
}

/**
 * Get environment variables from Firebase Functions config or process.env
 */
function getEnvValue(key, defaultValue = '') {
  // Try to load Firebase Functions config (only available in Cloud Functions)
  let functionsConfig = {};
  try {
    const functions = require('firebase-functions');
    functionsConfig = functions.config();
  } catch (error) {
    // Not in Cloud Functions environment
  }

  // Check in app namespace for general config
  const configKey = key.toLowerCase().replace(/_/g, '');
  return functionsConfig.app?.[configKey] || process.env[key] || defaultValue;
}

/**
 * API Configuration Object
 */
const apiConfig = {
  // Use mock APIs or real APIs based on environment variable
  useMock: getEnvValue('USE_MOCK') === 'true',

  // Service Autopilot API Configuration
  serviceAutopilot: {
    // Real API configuration (for production)
    real: {
      baseUrl: getEnvValue('SERVICE_AUTOPILOT_API_URL', 'https://api.serviceautopilot.com/v1'),
      apiKey: getEnvValue('SERVICE_AUTOPILOT_API_KEY'),
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getEnvValue('SERVICE_AUTOPILOT_API_KEY')}`
      }
    },
    // Mock API configuration (for development)
    mock: {
      baseUrl: `http://localhost:${getEnvValue('PORT', '3000')}/mock/service-autopilot`,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  },

  // Paychex API Configuration
  paychex: {
    // Real API configuration (for production)
    real: {
      baseUrl: getEnvValue('PAYCHEX_API_URL', 'https://api.paychex.com/v1'),
      apiKey: getEnvValue('PAYCHEX_API_KEY'),
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getEnvValue('PAYCHEX_API_KEY')}`
      }
    },
    // Mock API configuration (for development)
    mock: {
      baseUrl: `http://localhost:${getEnvValue('PORT', '3000')}/mock/paychex`,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  }
};

/**
 * Get Service Autopilot API configuration
 * @returns {Object} API configuration (mock or real based on USE_MOCK env var)
 */
function getServiceAutopilotConfig() {
  return apiConfig.useMock 
    ? apiConfig.serviceAutopilot.mock 
    : apiConfig.serviceAutopilot.real;
}

/**
 * Get Paychex API configuration
 * @returns {Object} API configuration (mock or real based on USE_MOCK env var)
 */
function getPaychexConfig() {
  return apiConfig.useMock 
    ? apiConfig.paychex.mock 
    : apiConfig.paychex.real;
}

/**
 * Check if mock APIs are enabled
 * @returns {boolean} True if using mock APIs
 */
function isMockEnabled() {
  return apiConfig.useMock;
}

/**
 * Validate API configuration
 * @returns {Object} Validation result with any warnings
 */
function validateConfig() {
  const warnings = [];

  if (!apiConfig.useMock) {
    // Check if real API credentials are configured
    if (!process.env.SERVICE_AUTOPILOT_API_KEY) {
      warnings.push('SERVICE_AUTOPILOT_API_KEY not configured');
    }
    if (!process.env.PAYCHEX_API_KEY) {
      warnings.push('PAYCHEX_API_KEY not configured');
    }
    if (!process.env.SERVICE_AUTOPILOT_API_URL) {
      warnings.push('SERVICE_AUTOPILOT_API_URL not configured (using default)');
    }
    if (!process.env.PAYCHEX_API_URL) {
      warnings.push('PAYCHEX_API_URL not configured (using default)');
    }
  }

  return {
    valid: warnings.length === 0 || apiConfig.useMock,
    useMock: apiConfig.useMock,
    warnings: warnings
  };
}

module.exports = {
  apiConfig,
  getServiceAutopilotConfig,
  getPaychexConfig,
  isMockEnabled,
  validateConfig
};

