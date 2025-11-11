/**
 * Execution Log Service
 * Handles logging of payroll processing executions
 */

const { supabase } = require('../config/database');

/**
 * Create a new execution log entry
 * @param {Object} data - Execution log data
 * @returns {Promise<Object>} Created execution log
 */
async function createExecutionLog(data) {
  const {
    execution_date,
    triggered_by,
    is_reprocess = false,
    original_execution_id = null
  } = data;

  try {
    const { data: log, error } = await supabase
      .from('execution_logs')
      .insert([{
        execution_date,
        start_time: new Date().toISOString(),
        end_time: null,
        records_processed: 0,
        status: 'processing',
        triggered_by,
        is_reprocess,
        original_execution_id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating execution log:', error);
      throw new Error(`Failed to create execution log: ${error.message}`);
    }

    return log;
  } catch (error) {
    console.error('Error in createExecutionLog:', error);
    throw error;
  }
}

/**
 * Update an execution log with completion data
 * @param {string} executionId - Execution log ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated execution log
 */
async function updateExecutionLog(executionId, data) {
  const {
    records_processed,
    status,
    error_message = null
  } = data;

  try {
    const { data: log, error } = await supabase
      .from('execution_logs')
      .update({
        end_time: new Date().toISOString(),
        records_processed,
        status,
        error_message
      })
      .eq('id', executionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating execution log:', error);
      throw new Error(`Failed to update execution log: ${error.message}`);
    }

    return log;
  } catch (error) {
    console.error('Error in updateExecutionLog:', error);
    throw error;
  }
}

/**
 * Get execution logs with optional filters
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Execution logs
 */
async function getExecutionLogs(filters = {}) {
  const {
    execution_date,
    status,
    triggered_by,
    is_reprocess,
    start_date,
    end_date,
    limit = 50,
    offset = 0
  } = filters;

  try {
    let query = supabase
      .from('execution_logs')
      .select(`
        *,
        triggered_by_user:users!execution_logs_triggered_by_fkey(id, name, email),
        original_execution:execution_logs!execution_logs_original_execution_id_fkey(id, execution_date, status)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (execution_date) {
      query = query.eq('execution_date', execution_date);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (triggered_by) {
      query = query.eq('triggered_by', triggered_by);
    }

    if (is_reprocess !== undefined) {
      query = query.eq('is_reprocess', is_reprocess);
    }

    if (start_date) {
      query = query.gte('execution_date', start_date);
    }

    if (end_date) {
      query = query.lte('execution_date', end_date);
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error('Error fetching execution logs:', error);
      throw new Error(`Failed to fetch execution logs: ${error.message}`);
    }

    return logs || [];
  } catch (error) {
    console.error('Error in getExecutionLogs:', error);
    throw error;
  }
}

/**
 * Get a single execution log by ID
 * @param {string} executionId - Execution log ID
 * @returns {Promise<Object>} Execution log
 */
async function getExecutionLogById(executionId) {
  try {
    const { data: log, error } = await supabase
      .from('execution_logs')
      .select(`
        *,
        triggered_by_user:users!execution_logs_triggered_by_fkey(id, name, email),
        original_execution:execution_logs!execution_logs_original_execution_id_fkey(id, execution_date, status)
      `)
      .eq('id', executionId)
      .single();

    if (error) {
      console.error('Error fetching execution log:', error);
      throw new Error(`Failed to fetch execution log: ${error.message}`);
    }

    return log;
  } catch (error) {
    console.error('Error in getExecutionLogById:', error);
    throw error;
  }
}

/**
 * Get execution statistics
 * @param {Object} filters - Query filters
 * @returns {Promise<Object>} Execution statistics
 */
async function getExecutionStats(filters = {}) {
  const { start_date, end_date } = filters;

  try {
    let query = supabase
      .from('execution_logs')
      .select('status, records_processed, execution_date');

    if (start_date) {
      query = query.gte('execution_date', start_date);
    }

    if (end_date) {
      query = query.lte('execution_date', end_date);
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error('Error fetching execution stats:', error);
      throw new Error(`Failed to fetch execution stats: ${error.message}`);
    }

    // Calculate statistics
    const stats = {
      total_executions: logs.length,
      successful: logs.filter(l => l.status === 'success').length,
      failed: logs.filter(l => l.status === 'failed').length,
      partial: logs.filter(l => l.status === 'partial').length,
      total_records_processed: logs.reduce((sum, l) => sum + (l.records_processed || 0), 0),
      reprocesses: logs.filter(l => l.is_reprocess).length
    };

    return stats;
  } catch (error) {
    console.error('Error in getExecutionStats:', error);
    throw error;
  }
}

/**
 * Delete old execution logs (cleanup)
 * @param {number} daysToKeep - Number of days to keep logs
 * @returns {Promise<number>} Number of deleted logs
 */
async function cleanupOldLogs(daysToKeep = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { data, error } = await supabase
      .from('execution_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .select();

    if (error) {
      console.error('Error cleaning up old logs:', error);
      throw new Error(`Failed to cleanup old logs: ${error.message}`);
    }

    return data ? data.length : 0;
  } catch (error) {
    console.error('Error in cleanupOldLogs:', error);
    throw error;
  }
}

module.exports = {
  createExecutionLog,
  updateExecutionLog,
  getExecutionLogs,
  getExecutionLogById,
  getExecutionStats,
  cleanupOldLogs
};

