/**
 * Payroll Processing Service
 * Orchestrates payroll processing: data fetching, calculation, storage, notifications
 */

const { getPayrollData } = require('./dataService');
const { calculateBatchPayroll } = require('./calculationService');
const { supabase } = require('../config/database');

/**
 * Analyze payroll (Preview - no database writes)
 * Calculates payroll without saving to database
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Calculation results (preview only)
 */
async function analyzePayroll(date) {
  try {
    console.log(`📊 Analyzing payroll for ${date}...`);
    
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
    
    console.log(`✅ Analysis complete: ${calculations.summary.successful_calculations} employees processed`);
    
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
    console.log(`🗑️  Deleting existing payroll records for ${date}...`);
    
    const { data, error } = await supabase
      .from('payroll_records')
      .delete()
      .eq('date', date)
      .select();
    
    if (error) {
      throw error;
    }
    
    const deletedCount = data ? data.length : 0;
    console.log(`✅ Deleted ${deletedCount} existing records`);
    
    return {
      success: true,
      deleted_count: deletedCount
    };
    
  } catch (error) {
    console.error('Error deleting existing payroll:', error);
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
    console.log(`💾 Saving ${records.length} payroll records to database...`);
    
    // Prepare records for insertion
    const recordsToInsert = records.map(record => ({
      employee_id: record.employee_id,
      date: date,
      hours_worked: record.hours_worked,
      base_rate: record.base_rate,
      base_pay: record.base_pay,
      efficiency: record.efficiency,
      performance_bonus: record.performance_bonus,
      late_penalty: record.late_penalty,
      long_lunch_penalty: record.long_lunch_penalty,
      total_pay: record.total_pay,
      has_anomalies: record.has_anomalies,
      anomaly_flags: record.anomaly_flags,
      status: record.has_anomalies ? 'pending_review' : 'calculated',
      approved: false,
      crew_id: record.crew_id
    }));
    
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
    
    console.log(`✅ Saved ${data.length} records to database`);
    
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
 * @param {Object} options - Processing options
 * @param {boolean} options.reprocess - If true, delete existing records and reprocess
 * @returns {Promise<Object>} Processing results
 */
async function processPayroll(date, options = {}) {
  const startTime = Date.now();
  
  try {
    console.log(`🚀 Processing payroll for ${date}...`);
    
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
    
    // Delete existing records if reprocessing
    if (existingCheck.exists && options.reprocess) {
      await deleteExistingPayroll(date);
    }
    
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
    
    // Save records to database
    const saveResult = await savePayrollRecords(calculations.results, date);
    
    const endTime = Date.now();
    const executionTime = (endTime - startTime) / 1000; // seconds
    
    console.log(`✅ Payroll processing complete in ${executionTime}s`);
    
    // TODO: Create notifications (will be implemented in PR #8)
    // await notificationService.createPayrollNotifications(date, calculations.summary);
    
    return {
      success: true,
      mode: 'committed',
      date: date,
      reprocessed: options.reprocess || false,
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
    
    return {
      success: false,
      error: error.message,
      date: date,
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
    
    if (filters.employee_id) {
      query = query.eq('employee_id', filters.employee_id);
    }
    
    if (filters.crew_id) {
      query = query.eq('crew_id', filters.crew_id);
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
    
    return {
      success: true,
      count: data.length,
      records: data
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

