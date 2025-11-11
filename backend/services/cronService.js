/**
 * Cron Service
 * Optional scheduled jobs for testing payroll processing
 * Note: This is for DEVELOPMENT/TESTING ONLY. Production uses manual triggers.
 */

const cron = require('node-cron');
const { cronConfig, isCronEnabled } = require('../config/cron');
const { processPayroll } = require('./payrollService');
const { cleanupOldLogs } = require('./executionLogService');
const { cleanupOldNotifications } = require('./notificationService');

// Store active cron jobs
const activeCronJobs = {};

/**
 * Initialize cron service
 * Only runs if ENABLE_CRON=true and NODE_ENV=development
 */
function initializeCronService() {
  if (!isCronEnabled()) {
    console.log('⏰ Cron service is DISABLED (manual payroll processing only)');
    return;
  }

  console.log('⚠️  WARNING: Cron service enabled (TESTING ONLY - not for production)');
  console.log('⏰ Initializing cron jobs...');

  // Register payroll processing job (testing only)
  if (cronConfig.payrollProcessing.enabled) {
    registerPayrollProcessingJob();
  }

  // Register log cleanup job (optional)
  if (cronConfig.logCleanup.enabled) {
    registerLogCleanupJob();
  }

  // Register notification cleanup job (optional)
  if (cronConfig.notificationCleanup.enabled) {
    registerNotificationCleanupJob();
  }

  console.log(`⏰ ${Object.keys(activeCronJobs).length} cron job(s) registered`);
}

/**
 * Register payroll processing cron job (TESTING ONLY)
 */
function registerPayrollProcessingJob() {
  const config = cronConfig.payrollProcessing;
  
  if (!cron.validate(config.schedule)) {
    console.error(`❌ Invalid cron schedule for payroll processing: ${config.schedule}`);
    return;
  }

  const job = cron.schedule(config.schedule, async () => {
    console.log('⏰ [CRON - TEST] Starting scheduled payroll processing...');
    
    try {
      // Process payroll for yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const date = yesterday.toISOString().split('T')[0];

      // Use system user ID for automated processing
      const systemUserId = 'system'; // This should be a valid admin user ID in production

      const result = await processPayroll(date, systemUserId);

      console.log('⏰ [CRON - TEST] Payroll processing completed:', {
        date,
        success: result.success,
        recordsProcessed: result.summary?.successful_calculations || 0,
        errors: result.summary?.failed_calculations || 0
      });
    } catch (error) {
      console.error('⏰ [CRON - TEST] Payroll processing failed:', error);
    }
  }, {
    timezone: config.timezone
  });

  activeCronJobs['payrollProcessing'] = job;
  console.log(`⏰ Registered cron job: ${config.description}`);
  console.log(`   Schedule: ${config.schedule} (${config.timezone})`);
}

/**
 * Register log cleanup cron job
 */
function registerLogCleanupJob() {
  const config = cronConfig.logCleanup;
  
  if (!cron.validate(config.schedule)) {
    console.error(`❌ Invalid cron schedule for log cleanup: ${config.schedule}`);
    return;
  }

  const job = cron.schedule(config.schedule, async () => {
    console.log('⏰ [CRON] Starting log cleanup...');
    
    try {
      const deletedCount = await cleanupOldLogs(config.daysToKeep);
      console.log(`⏰ [CRON] Log cleanup completed: ${deletedCount} old logs deleted`);
    } catch (error) {
      console.error('⏰ [CRON] Log cleanup failed:', error);
    }
  });

  activeCronJobs['logCleanup'] = job;
  console.log(`⏰ Registered cron job: ${config.description}`);
  console.log(`   Schedule: ${config.schedule}`);
}

/**
 * Register notification cleanup cron job
 */
function registerNotificationCleanupJob() {
  const config = cronConfig.notificationCleanup;
  
  if (!cron.validate(config.schedule)) {
    console.error(`❌ Invalid cron schedule for notification cleanup: ${config.schedule}`);
    return;
  }

  const job = cron.schedule(config.schedule, async () => {
    console.log('⏰ [CRON] Starting notification cleanup...');
    
    try {
      const deletedCount = await cleanupOldNotifications(config.daysToKeep);
      console.log(`⏰ [CRON] Notification cleanup completed: ${deletedCount} old notifications deleted`);
    } catch (error) {
      console.error('⏰ [CRON] Notification cleanup failed:', error);
    }
  });

  activeCronJobs['notificationCleanup'] = job;
  console.log(`⏰ Registered cron job: ${config.description}`);
  console.log(`   Schedule: ${config.schedule}`);
}

/**
 * Stop a specific cron job
 * @param {string} jobName - Name of the cron job to stop
 */
function stopCronJob(jobName) {
  if (activeCronJobs[jobName]) {
    activeCronJobs[jobName].stop();
    delete activeCronJobs[jobName];
    console.log(`⏰ Stopped cron job: ${jobName}`);
  }
}

/**
 * Stop all cron jobs
 */
function stopAllCronJobs() {
  Object.keys(activeCronJobs).forEach(jobName => {
    activeCronJobs[jobName].stop();
  });
  console.log(`⏰ Stopped ${Object.keys(activeCronJobs).length} cron job(s)`);
  // Clear the object
  Object.keys(activeCronJobs).forEach(key => delete activeCronJobs[key]);
}

/**
 * Get status of all cron jobs
 * @returns {Object} Status of all cron jobs
 */
function getCronJobsStatus() {
  return {
    enabled: isCronEnabled(),
    activeJobs: Object.keys(activeCronJobs).map(jobName => ({
      name: jobName,
      schedule: cronConfig[jobName]?.schedule,
      description: cronConfig[jobName]?.description,
      active: true
    }))
  };
}

module.exports = {
  initializeCronService,
  stopCronJob,
  stopAllCronJobs,
  getCronJobsStatus
};

