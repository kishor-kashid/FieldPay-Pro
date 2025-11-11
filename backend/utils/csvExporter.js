/**
 * CSV Exporter Utility
 * Generates Paychex-compatible CSV files from payroll records
 */

/**
 * Convert payroll records to CSV format
 * @param {Array} records - Payroll records
 * @returns {string} CSV string
 */
function generatePayrollCSV(records) {
  if (!records || records.length === 0) {
    throw new Error('No records to export');
  }
  
  // Define CSV headers (Paychex-compatible format)
  const headers = [
    'Employee ID',
    'Employee Name',
    'Date',
    'Hours Worked',
    'Base Rate',
    'Base Pay',
    'Late Penalty',
    'Long Lunch Penalty',
    'Total Pay',
    'Status',
    'Approved',
    'Has Anomalies'
  ];
  
  // Create CSV rows
  const rows = records.map(record => {
    // Get employee name from joined data or from record
    const employeeName = record.user?.name || record.employee_name || 'Unknown';
    
    return [
      record.employee_id,
      `"${employeeName}"`, // Quote names in case they contain commas
      record.date,
      record.hours_worked,
      record.base_rate.toFixed(2),
      record.base_pay.toFixed(2),
      record.late_penalty.toFixed(2),
      record.long_lunch_penalty.toFixed(2),
      record.total_pay.toFixed(2),
      record.status || 'calculated',
      record.approved ? 'Yes' : 'No',
      record.has_anomalies ? 'Yes' : 'No'
    ].join(',');
  });
  
  // Combine headers and rows
  const csv = [headers.join(','), ...rows].join('\n');
  
  return csv;
}

/**
 * Generate detailed CSV with breakdown
 * @param {Array} records - Payroll records
 * @returns {string} CSV string
 */
function generateDetailedPayrollCSV(records) {
  if (!records || records.length === 0) {
    throw new Error('No records to export');
  }
  
  // Define detailed CSV headers
  const headers = [
    'Employee ID',
    'Employee Name',
    'Crew ID',
    'Date',
    'Hours Worked',
    'Base Rate',
    'Base Pay',
    'Late Penalty',
    'Long Lunch Penalty',
    'Total Penalties',
    'Total Pay',
    'Clock In',
    'Clock Out',
    'Status',
    'Approved',
    'Approved By',
    'Approved At',
    'Has Anomalies',
    'Anomaly Flags',
    'Created At'
  ];
  
  // Create CSV rows
  const rows = records.map(record => {
    const employeeName = record.user?.name || record.employee_name || 'Unknown';
    const anomalyFlags = record.anomaly_flags ? record.anomaly_flags.join('; ') : '';
    const approvedBy = record.approved_by || '';
    const approvedAt = record.approved_at || '';
    const clockIn = record.clock_in || '';
    const clockOut = record.clock_out || '';
    
    return [
      record.employee_id,
      `"${employeeName}"`,
      record.crew_id || '',
      record.date,
      record.hours_worked,
      record.base_rate.toFixed(2),
      record.base_pay.toFixed(2),
      record.late_penalty.toFixed(2),
      record.long_lunch_penalty.toFixed(2),
      (record.late_penalty + record.long_lunch_penalty).toFixed(2),
      record.total_pay.toFixed(2),
      clockIn,
      clockOut,
      record.status || 'calculated',
      record.approved ? 'Yes' : 'No',
      approvedBy,
      approvedAt,
      record.has_anomalies ? 'Yes' : 'No',
      `"${anomalyFlags}"`,
      record.created_at || ''
    ].join(',');
  });
  
  // Combine headers and rows
  const csv = [headers.join(','), ...rows].join('\n');
  
  return csv;
}

/**
 * Generate summary CSV (aggregated by employee)
 * @param {Array} records - Payroll records
 * @returns {string} CSV string
 */
function generateSummaryCSV(records) {
  if (!records || records.length === 0) {
    throw new Error('No records to export');
  }
  
  // Group records by employee
  const employeeGroups = {};
  records.forEach(record => {
    if (!employeeGroups[record.employee_id]) {
      employeeGroups[record.employee_id] = {
        employee_id: record.employee_id,
        employee_name: record.user?.name || record.employee_name || 'Unknown',
        records: []
      };
    }
    employeeGroups[record.employee_id].records.push(record);
  });
  
  // Define summary headers
  const headers = [
    'Employee ID',
    'Employee Name',
    'Days Worked',
    'Total Hours',
    'Total Base Pay',
    'Total Penalties',
    'Total Payout',
    'Anomaly Count'
  ];
  
  // Create summary rows
  const rows = Object.values(employeeGroups).map(group => {
    const records = group.records;
    const totalHours = records.reduce((sum, r) => sum + r.hours_worked, 0);
    const totalBasePay = records.reduce((sum, r) => sum + r.base_pay, 0);
    const totalPenalties = records.reduce((sum, r) => sum + r.late_penalty + r.long_lunch_penalty, 0);
    const totalPayout = records.reduce((sum, r) => sum + r.total_pay, 0);
    const anomalyCount = records.filter(r => r.has_anomalies).length;
    
    return [
      group.employee_id,
      `"${group.employee_name}"`,
      records.length,
      totalHours.toFixed(2),
      totalBasePay.toFixed(2),
      totalPenalties.toFixed(2),
      totalPayout.toFixed(2),
      anomalyCount
    ].join(',');
  });
  
  // Combine headers and rows
  const csv = [headers.join(','), ...rows].join('\n');
  
  return csv;
}

/**
 * Generate filename for CSV export
 * @param {string} type - Export type (standard, detailed, summary)
 * @param {string} date - Date or date range
 * @returns {string} Filename
 */
function generateFilename(type = 'standard', date = null) {
  const timestamp = new Date().toISOString().split('T')[0];
  const dateStr = date || timestamp;
  return `payroll_${type}_${dateStr}.csv`;
}

module.exports = {
  generatePayrollCSV,
  generateDetailedPayrollCSV,
  generateSummaryCSV,
  generateFilename
};

