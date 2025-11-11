/**
 * Cron Job Configuration
 * Optional cron jobs for testing payroll processing
 * Note: This is for DEVELOPMENT/TESTING ONLY. Production uses manual triggers.
 */

/**
 * Cron Configuration
 */
const cronConfig = {
  // Enable/disable cron (controlled by environment variable)
  enabled: process.env.ENABLE_CRON === 'true' && process.env.NODE_ENV === 'development',
  
  // Payroll processing schedule (for testing only)
  payrollProcessing: {
    // Schedule format: "minute hour day month weekday"
    // Default: 10:30 AM daily (for testing)
    schedule: process.env.CRON_SCHEDULE || '30 10 * * *',
    enabled: process.env.ENABLE_CRON === 'true',
    description: 'Daily payroll processing (TESTING ONLY)',
    timezone: 'America/New_York' // Adjust based on your timezone
  },

  // Cleanup old logs schedule (optional)
  logCleanup: {
    // Default: Once a week at 2:00 AM on Sunday
    schedule: '0 2 * * 0',
    enabled: false, // Disabled by default
    description: 'Weekly cleanup of old execution logs',
    daysToKeep: 90
  },

  // Notification cleanup schedule (optional)
  notificationCleanup: {
    // Default: Daily at 3:00 AM
    schedule: '0 3 * * *',
    enabled: false, // Disabled by default
    description: 'Daily cleanup of old read notifications',
    daysToKeep: 30
  }
};

/**
 * Validate cron schedule format
 * @param {string} schedule - Cron schedule string
 * @returns {boolean} Whether the schedule is valid
 */
function validateCronSchedule(schedule) {
  // Basic validation for cron format: "minute hour day month weekday"
  const cronPattern = /^(\*|([0-9]|[1-5][0-9])) (\*|([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|[12][0-9]|3[01])) (\*|([1-9]|1[0-2])) (\*|([0-6]))$/;
  return cronPattern.test(schedule);
}

/**
 * Get cron job configuration
 * @param {string} jobName - Name of the cron job
 * @returns {Object} Cron job configuration
 */
function getCronJobConfig(jobName) {
  return cronConfig[jobName] || null;
}

/**
 * Check if cron is enabled globally
 * @returns {boolean} Whether cron is enabled
 */
function isCronEnabled() {
  return cronConfig.enabled;
}

module.exports = {
  cronConfig,
  validateCronSchedule,
  getCronJobConfig,
  isCronEnabled
};

