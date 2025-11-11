/**
 * External API Configuration
 * Manages configuration for Service Autopilot, Paychex, and mock APIs
 */

require('dotenv').config();

/**
 * API Configuration Object
 */
const apiConfig = {
  // Use mock APIs or real APIs based on environment variable
  useMock: process.env.USE_MOCK === 'true',

  // Service Autopilot API Configuration
  serviceAutopilot: {
    // Real API configuration (for production)
    real: {
      baseUrl: process.env.SERVICE_AUTOPILOT_API_URL || 'https://api.serviceautopilot.com/v1',
      apiKey: process.env.SERVICE_AUTOPILOT_API_KEY || '',
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SERVICE_AUTOPILOT_API_KEY || ''}`
      }
    },
    // Mock API configuration (for development)
    mock: {
      baseUrl: `http://localhost:${process.env.PORT || 3000}/mock/service-autopilot`,
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
      baseUrl: process.env.PAYCHEX_API_URL || 'https://api.paychex.com/v1',
      apiKey: process.env.PAYCHEX_API_KEY || '',
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PAYCHEX_API_KEY || ''}`
      }
    },
    // Mock API configuration (for development)
    mock: {
      baseUrl: `http://localhost:${process.env.PORT || 3000}/mock/paychex`,
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

