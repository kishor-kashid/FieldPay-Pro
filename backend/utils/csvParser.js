/**
 * CSV Parser Utility
 * Clean Scapes P4P System
 * 
 * Parses CSV files from Service Autopilot and Paychex
 */

const csv = require('csv-parser');
const { Readable } = require('stream');

/**
 * Parse Service Autopilot CSV file
 * Expected columns: job_id, date, location, service_type, budgeted_hours, crew_id, status, notes
 * 
 * @param {Buffer|Stream} file - CSV file buffer or stream
 * @returns {Promise<Array>} Parsed job data
 */
async function parseServiceAutopilotCSV(file) {
  return new Promise((resolve, reject) => {
    const results = [];
    const errors = [];
    
    // Convert buffer to stream if needed
    const stream = Buffer.isBuffer(file) ? Readable.from(file.toString()) : file;
    
    stream
      .pipe(csv())
      .on('data', (row) => {
        try {
          // Validate required fields
          if (!row.job_id || !row.date) {
            errors.push({
              row: results.length + 1,
              error: 'Missing required fields: job_id and date are required'
            });
            return;
          }
          
          // Parse and validate data
          const job = {
            external_id: row.job_id.trim(),
            date: row.date.trim(),
            location: row.location?.trim() || null,
            service_type: row.service_type?.trim() || null,
            budgeted_hours: row.budgeted_hours ? parseFloat(row.budgeted_hours) : null,
            actual_hours: row.actual_hours ? parseFloat(row.actual_hours) : null,
            crew_id: row.crew_id?.trim() || null,
            status: row.status?.trim() || 'pending',
            notes: row.notes?.trim() || null
          };
          
          // Validate budgeted_hours
          if (job.budgeted_hours !== null && (isNaN(job.budgeted_hours) || job.budgeted_hours < 0)) {
            errors.push({
              row: results.length + 1,
              error: `Invalid budgeted_hours: ${row.budgeted_hours}`
            });
            return;
          }
          
          results.push(job);
        } catch (error) {
          errors.push({
            row: results.length + 1,
            error: error.message
          });
        }
      })
      .on('end', () => {
        if (errors.length > 0 && results.length === 0) {
          reject(new Error(`CSV parsing failed: ${errors.map(e => e.error).join('; ')}`));
        } else {
          resolve({
            success: true,
            data: results,
            count: results.length,
            errors: errors.length > 0 ? errors : undefined
          });
        }
      })
      .on('error', (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      });
  });
}

/**
 * Parse Paychex CSV file
 * Expected columns: employee_id, employee_name, date, clock_in, clock_out, lunch_start, lunch_end, hours_worked, base_rate, crew_id, status
 * 
 * @param {Buffer|Stream} file - CSV file buffer or stream
 * @returns {Promise<Array>} Parsed timesheet data
 */
async function parsePaychexCSV(file) {
  return new Promise((resolve, reject) => {
    const results = [];
    const errors = [];
    
    // Convert buffer to stream if needed
    const stream = Buffer.isBuffer(file) ? Readable.from(file.toString()) : file;
    
    stream
      .pipe(csv())
      .on('data', (row) => {
        try {
          // Validate required fields
          if (!row.employee_id || !row.date) {
            errors.push({
              row: results.length + 1,
              error: 'Missing required fields: employee_id and date are required'
            });
            return;
          }
          
          // Parse and validate data
          const timesheet = {
            employee_id: row.employee_id.trim(),
            employee_name: row.employee_name?.trim() || null,
            date: row.date.trim(),
            clock_in: row.clock_in?.trim() || null,
            clock_out: row.clock_out?.trim() || null,
            lunch_start: row.lunch_start?.trim() || null,
            lunch_end: row.lunch_end?.trim() || null,
            total_hours: row.hours_worked ? parseFloat(row.hours_worked) : null,
            base_rate: row.base_rate ? parseFloat(row.base_rate) : null,
            crew_id: row.crew_id?.trim() || null,
            status: row.status?.trim() || 'pending'
          };
          
          // Validate numeric fields
          if (timesheet.total_hours !== null && (isNaN(timesheet.total_hours) || timesheet.total_hours < 0)) {
            errors.push({
              row: results.length + 1,
              error: `Invalid hours_worked: ${row.hours_worked}`
            });
            return;
          }
          
          if (timesheet.base_rate !== null && (isNaN(timesheet.base_rate) || timesheet.base_rate < 0)) {
            errors.push({
              row: results.length + 1,
              error: `Invalid base_rate: ${row.base_rate}`
            });
            return;
          }
          
          // Validate date format (should be YYYY-MM-DD)
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(timesheet.date)) {
            errors.push({
              row: results.length + 1,
              error: `Invalid date format: ${timesheet.date} (expected YYYY-MM-DD)`
            });
            return;
          }
          
          results.push(timesheet);
        } catch (error) {
          errors.push({
            row: results.length + 1,
            error: error.message
          });
        }
      })
      .on('end', () => {
        if (errors.length > 0 && results.length === 0) {
          reject(new Error(`CSV parsing failed: ${errors.map(e => e.error).join('; ')}`));
        } else {
          resolve({
            success: true,
            data: results,
            count: results.length,
            errors: errors.length > 0 ? errors : undefined
          });
        }
      })
      .on('error', (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      });
  });
}

/**
 * Validate CSV file format
 * @param {string} filename - File name
 * @param {string} expectedType - 'service-autopilot' or 'paychex'
 * @returns {Object} Validation result
 */
function validateCSVFile(filename, expectedType) {
  if (!filename || !filename.toLowerCase().endsWith('.csv')) {
    return {
      valid: false,
      error: 'File must be a CSV file (.csv extension)'
    };
  }
  
  return {
    valid: true
  };
}

module.exports = {
  parseServiceAutopilotCSV,
  parsePaychexCSV,
  validateCSVFile
};

