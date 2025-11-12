/**
 * Payroll Processing Service
 * Orchestrates payroll processing: data fetching, calculation, storage, notifications
 */

const { getPayrollData } = require('./dataService');
const { calculateBatchPayroll } = require('./calculationService');
const { supabase } = require('../config/database');
const { createExecutionLog, updateExecutionLog } = require('./executionLogService');
const { createPayrollNotifications, createErrorNotification } = require('./notificationService');

/**
 * Analyze payroll (Preview - no database writes)
 * Calculates payroll without saving to database
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Calculation results (preview only)
 */
async function analyzePayroll(date) {
  try {
    // Fetch all data from external APIs
    const payrollData = await getPayrollData(date);
    
    if (!payrollData.timesheets || payrollData.timesheets.length === 0) {
      return {
        success: false,
        error: 'No timesheet data found for this date',
        date: date
      };
    }
    
    // Calculate payroll for all employees
    const calculations = calculateBatchPayroll(
      payrollData.timesheets,
      payrollData.jobs,
      payrollData.assignments
    );
    
    if (!calculations.success) {
      return {
        success: false,
        error: 'Payroll calculation failed',
        details: calculations
      };
    }
    
    return {
      success: true,
      mode: 'preview',
      date: date,
      summary: calculations.summary,
      results: calculations.results,
      errors: calculations.errors,
      data_source: payrollData.source,
      message: 'Preview only - no data saved to database'
    };
    
  } catch (error) {
    console.error('Error analyzing payroll:', error);
    return {
      success: false,
      error: error.message,
      date: date
    };
  }
}

/**
 * Check if payroll records already exist for a date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Check result with existing records
 */
async function checkExistingPayroll(date) {
  try {
    const { data, error } = await supabase
      .from('payroll_records')
      .select('id, employee_id, total_pay, created_at')
      .eq('date', date);
    
    if (error) {
      throw error;
    }
    
    return {
      exists: data && data.length > 0,
      count: data ? data.length : 0,
      records: data || []
    };
    
  } catch (error) {
    console.error('Error checking existing payroll:', error);
    throw error;
  }
}

/**
 * Delete existing payroll records for a date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Deletion result
 */
async function deleteExistingPayroll(date) {
  try {
    const { data, error } = await supabase
      .from('payroll_records')
      .delete()
      .eq('date', date)
      .select();
    
    if (error) {
      throw error;
    }
    
    const deletedCount = data ? data.length : 0;
    
    return {
      success: true,
      deleted_count: deletedCount
    };
    
  } catch (error) {
    throw error;
  }
}

/**
 * Save payroll records to database
 * @param {Array} records - Calculated payroll records
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Save result
 */
async function savePayrollRecords(records, date) {
  try {
    // Fetch all users from database to map mock IDs to real UUIDs
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, employee_id')
      .eq('role', 'crew_member');
    
    if (userError) {
      throw new Error(`Failed to fetch users: ${userError.message}`);
    }
    
    // Create mapping from mock IDs (crew1, crew2, etc.) to database UUIDs
    const userMapping = {};
    users.forEach(user => {
      // Extract the mock ID from email (crew1@cleanscapes.com -> crew1)
      const emailPrefix = user.email.split('@')[0];
      userMapping[emailPrefix] = user.id;
    });
    
    // Prepare records for insertion, mapping employee_id to actual UUIDs
    const recordsToInsert = records.map(record => {
      const dbUserId = userMapping[record.employee_id];
      
      if (!dbUserId) {
        return null;
      }
      
      // Ensure total_pay is calculated correctly: base_pay - total_penalties
      // Recalculate to ensure no bonuses, efficiency, or other additions are included
      const calculatedTotalPay = Math.max(0, record.base_pay - record.total_penalties);
      
      return {
        employee_id: dbUserId, // Use the actual UUID from database
        date: date,
        hours_worked: record.hours_worked,
        base_rate: record.base_rate,
        base_pay: record.base_pay,
        late_penalty: record.late_penalty,
        long_lunch_penalty: record.long_lunch_penalty,
        penalties: record.total_penalties, // Save total_penalties to penalties field
        total_pay: calculatedTotalPay, // Recalculate to ensure correctness
        has_anomalies: record.has_anomalies,
        anomaly_flags: record.anomaly_flags,
        status: record.has_anomalies ? 'pending_review' : 'calculated',
        approved: false,
        crew_id: record.crew_id
      };
    }).filter(record => record !== null); // Remove any records that couldn't be mapped
    
    if (recordsToInsert.length === 0) {
      throw new Error('No valid payroll records to insert after user mapping');
    }
    
    // Insert records
    const { data, error } = await supabase
      .from('payroll_records')
      .insert(recordsToInsert)
      .select();
    
    if (error) {
      // Check if it's a duplicate error
      if (error.code === '23505') { // PostgreSQL unique violation
        throw new Error('Payroll records already exist for this date. Use reprocess option to replace them.');
      }
      throw error;
    }
    
    
    return {
      success: true,
      saved_count: data.length,
      records: data
    };
    
  } catch (error) {
    console.error('Error saving payroll records:', error);
    throw error;
  }
}

/**
 * Process payroll (Commit - saves to database)
 * Calculates and saves payroll to database
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} triggeredBy - User ID who triggered the processing
 * @param {Object} options - Processing options
 * @param {boolean} options.reprocess - If true, delete existing records and reprocess
 * @returns {Promise<Object>} Processing results
 */
async function processPayroll(date, triggeredBy, options = {}) {
  const startTime = Date.now();
  let executionLog = null;
  let originalExecutionId = null;
  
  try {
    // Check for existing records
    const existingCheck = await checkExistingPayroll(date);
    
    if (existingCheck.exists && !options.reprocess) {
      return {
        success: false,
        error: 'Payroll already processed for this date',
        date: date,
        existing_count: existingCheck.count,
        message: 'Use reprocess option to replace existing records'
      };
    }
    
    // If reprocessing, find the original execution ID
    if (existingCheck.exists && options.reprocess) {
      // Get the most recent execution log for this date
      const { data: originalExecution } = await supabase
        .from('execution_logs')
        .select('id')
        .eq('execution_date', date)
        .eq('status', 'success')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (originalExecution) {
        originalExecutionId = originalExecution.id;
      }
    }
    
    // Create execution log
    executionLog = await createExecutionLog({
      execution_date: date,
      triggered_by: triggeredBy,
      is_reprocess: options.reprocess || false,
      original_execution_id: originalExecutionId
    });
    
    // Delete existing records if reprocessing
    if (existingCheck.exists && options.reprocess) {
      await deleteExistingPayroll(date);
    }
    
    // Fetch all data from external APIs
    const payrollData = await getPayrollData(date);
    
    if (!payrollData.timesheets || payrollData.timesheets.length === 0) {
      // Update execution log with failure
      if (executionLog) {
        await updateExecutionLog(executionLog.id, {
          records_processed: 0,
          status: 'failed',
          error_message: 'No timesheet data found for this date'
        });
      }
      
      // Create error notification for admins
      await createErrorNotification(
        `Payroll processing failed for ${date}: No timesheet data found`,
        { link: `/admin/executions/${executionLog?.id}` }
      );
      
      return {
        success: false,
        error: 'No timesheet data found for this date',
        date: date
      };
    }
    
    // Calculate payroll for all employees
    const calculations = calculateBatchPayroll(
      payrollData.timesheets,
      payrollData.jobs,
      payrollData.assignments
    );
    
    if (!calculations.success) {
      // Update execution log with failure
      if (executionLog) {
        await updateExecutionLog(executionLog.id, {
          records_processed: 0,
          status: 'failed',
          error_message: 'Payroll calculation failed'
        });
      }
      
      // Create error notification for admins
      await createErrorNotification(
        `Payroll processing failed for ${date}: Calculation error`,
        { link: `/admin/executions/${executionLog?.id}` }
      );
      
      return {
        success: false,
        error: 'Payroll calculation failed',
        details: calculations
      };
    }
    
    // Save records to database
    const saveResult = await savePayrollRecords(calculations.results, date);
    
    const endTime = Date.now();
    const executionTime = (endTime - startTime) / 1000; // seconds
    
    // Determine execution status
    const status = calculations.summary.failed_calculations > 0 ? 'partial' : 'success';
    
    // Update execution log with success
    if (executionLog) {
      await updateExecutionLog(executionLog.id, {
        records_processed: saveResult.saved_count,
        status: status,
        error_message: calculations.summary.failed_calculations > 0 
          ? `${calculations.summary.failed_calculations} records failed to process` 
          : null
      });
    }
    
    
    // Create notifications for all users
    const notifications = await createPayrollNotifications(
      {
        date,
        summary: calculations.summary,
        results: calculations.results,
        errors: calculations.errors
      },
      triggeredBy
    );
    
    return {
      success: true,
      mode: 'committed',
      date: date,
      reprocessed: options.reprocess || false,
      execution_log_id: executionLog?.id,
      notifications_sent: notifications?.length || 0,
      summary: {
        ...calculations.summary,
        saved_records: saveResult.saved_count,
        execution_time_seconds: parseFloat(executionTime.toFixed(2))
      },
      results: calculations.results,
      errors: calculations.errors,
      data_source: payrollData.source
    };
    
  } catch (error) {
    console.error('Error processing payroll:', error);
    
    const endTime = Date.now();
    const executionTime = (endTime - startTime) / 1000;
    
    // Update execution log with failure
    if (executionLog) {
      try {
        await updateExecutionLog(executionLog.id, {
          records_processed: 0,
          status: 'failed',
          error_message: error.message
        });
      } catch (logError) {
        console.error('Error updating execution log:', logError);
      }
    }
    
    // Create error notification for admins
    try {
      await createErrorNotification(
        `Payroll processing failed for ${date}: ${error.message}`,
        { link: `/admin/executions/${executionLog?.id}` }
      );
    } catch (notifError) {
      console.error('Error creating error notification:', notifError);
    }
    
    return {
      success: false,
      error: error.message,
      date: date,
      execution_log_id: executionLog?.id,
      execution_time_seconds: parseFloat(executionTime.toFixed(2))
    };
  }
}

/**
 * Get payroll records with filters
 * @param {Object} filters - Query filters
 * @param {string} filters.date - Filter by date
 * @param {string} filters.employee_id - Filter by employee
 * @param {string} filters.crew_id - Filter by crew
 * @param {string} filters.status - Filter by status
 * @param {boolean} filters.anomalies_only - Only records with anomalies
 * @returns {Promise<Object>} Query results
 */
async function getPayrollRecords(filters = {}) {
  try {
    let query = supabase
      .from('payroll_records')
      .select(`
        *,
        user:users!payroll_records_employee_id_fkey(name, email, role, crew_id)
      `)
      .order('date', { ascending: false })
      .order('employee_id', { ascending: true });
    
    // Apply filters
    if (filters.date) {
      query = query.eq('date', filters.date);
    }
    
    // Support date range filtering
    if (filters.start_date) {
      query = query.gte('date', filters.start_date);
    }
    
    if (filters.end_date) {
      query = query.lte('date', filters.end_date);
    }
    
    if (filters.employee_id) {
      query = query.eq('employee_id', filters.employee_id);
    }
    
    if (filters.crew_id) {
      const crewIdFilter = String(filters.crew_id).trim();
      
      // Extract number from crew_id for flexible matching (CREW1 vs foreman1)
      const numMatch = crewIdFilter.match(/\d+/);
      
      if (numMatch) {
        const num = numMatch[0];
        // Use case-insensitive like to match patterns containing the number
        // This handles: CREW1, foreman1, crew1, etc.
        query = query.ilike('crew_id', `%${num}%`);
      } else {
        // No number found, use case-insensitive exact match
        query = query.ilike('crew_id', crewIdFilter);
      }
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.anomalies_only) {
      query = query.eq('has_anomalies', true);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Transform records to include employee_name from joined user
    // Also calculate total_penalties from penalties field (or sum of late + long_lunch)
    const transformedRecords = data.map(record => {
      // Calculate total_penalties if not present
      const totalPenalties = record.total_penalties !== null && record.total_penalties !== undefined
        ? record.total_penalties
        : (record.penalties !== null && record.penalties !== undefined)
          ? record.penalties
          : ((record.late_penalty || 0) + (record.long_lunch_penalty || 0));
      
      return {
        ...record,
        employee_name: record.user?.name || 'Unknown',
        employee_id_display: record.user?.employee_id || record.employee_id,
        total_penalties: totalPenalties // Ensure total_penalties is always present
      };
    });
    
    return {
      success: true,
      count: transformedRecords.length,
      records: transformedRecords
    };
    
  } catch (error) {
    console.error('Error fetching payroll records:', error);
    throw error;
  }
}

/**
 * Get single payroll record by ID
 * @param {string} id - Record ID
 * @returns {Promise<Object>} Record details
 */
async function getPayrollRecord(id) {
  try {
    const { data, error } = await supabase
      .from('payroll_records')
      .select(`
        *,
        user:users!payroll_records_employee_id_fkey(name, email, role, crew_id, base_rate, preferred_language)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      record: data
    };
    
  } catch (error) {
    console.error('Error fetching payroll record:', error);
    throw error;
  }
}

/**
 * Approve a payroll record
 * @param {string} id - Record ID
 * @param {string} adminId - Admin user ID
 * @param {string} notes - Optional approval notes
 * @returns {Promise<Object>} Update result
 */
async function approvePayrollRecord(id, adminId, notes = null) {
  try {
    const { data, error } = await supabase
      .from('payroll_records')
      .update({
        approved: true,
        status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString(),
        admin_notes: notes
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      record: data
    };
    
  } catch (error) {
    console.error('Error approving payroll record:', error);
    throw error;
  }
}

/**
 * Bulk approve payroll records
 * @param {Array} ids - Array of record IDs
 * @param {string} adminId - Admin user ID
 * @returns {Promise<Object>} Update result
 */
async function bulkApprovePayrollRecords(ids, adminId) {
  try {
    const { data, error } = await supabase
      .from('payroll_records')
      .update({
        approved: true,
        status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString()
      })
      .in('id', ids)
      .select();
    
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      approved_count: data.length,
      records: data
    };
    
  } catch (error) {
    console.error('Error bulk approving payroll records:', error);
    throw error;
  }
}

module.exports = {
  analyzePayroll,
  processPayroll,
  checkExistingPayroll,
  deleteExistingPayroll,
  getPayrollRecords,
  getPayrollRecord,
  approvePayrollRecord,
  bulkApprovePayrollRecords
};

