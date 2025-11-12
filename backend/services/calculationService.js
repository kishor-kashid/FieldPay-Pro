/**
 * P4P Calculation Service
 * Core business logic for performance-based payroll calculations
 */

const {
  settings,
  getServiceTypeBudget,
  checkEfficiencyAnomaly,
  calculateLatePenalty,
  calculateLongLunchPenalty,
  calculatePerformanceBonus
} = require('../config/calculationRules');

/**
 * Calculate efficiency for a single job
 * @param {number} budgetedHours - Expected hours for the job
 * @param {number} actualHours - Actual hours worked
 * @returns {number} Efficiency value (budgeted / actual)
 */
function calculateEfficiency(budgetedHours, actualHours) {
  if (actualHours === 0 || !actualHours) {
    throw new Error('Cannot calculate efficiency: actual hours is zero or missing');
  }
  
  if (budgetedHours === 0 || !budgetedHours) {
    throw new Error('Cannot calculate efficiency: budgeted hours is zero or missing');
  }
  
  const efficiency = budgetedHours / actualHours;
  return parseFloat(efficiency.toFixed(settings.efficiencyDecimalPlaces));
}

/**
 * Calculate efficiency for multiple jobs (aggregate)
 * @param {Array} jobs - Array of job objects with budgeted_hours
 * @param {number} totalActualHours - Total actual hours worked
 * @returns {Object} Efficiency calculation result
 */
function calculateAggregateEfficiency(jobs, totalActualHours) {
  if (!jobs || jobs.length === 0) {
    throw new Error('No jobs provided for efficiency calculation');
  }
  
  if (totalActualHours === 0 || !totalActualHours) {
    throw new Error('Cannot calculate efficiency: total actual hours is zero or missing');
  }
  
  // Sum all budgeted hours
  const totalBudgetedHours = jobs.reduce((sum, job) => {
    const budgeted = job.budgeted_hours || getServiceTypeBudget(job.service_type);
    return sum + budgeted;
  }, 0);
  
  if (totalBudgetedHours === 0) {
    throw new Error('Total budgeted hours is zero');
  }
  
  const efficiency = calculateEfficiency(totalBudgetedHours, totalActualHours);
  
  // Calculate per-job efficiency breakdown
  const jobBreakdown = jobs.map(job => {
    const budgeted = job.budgeted_hours || getServiceTypeBudget(job.service_type);
    // Distribute actual hours proportionally
    const actualForJob = (budgeted / totalBudgetedHours) * totalActualHours;
    const jobEfficiency = calculateEfficiency(budgeted, actualForJob);
    
    return {
      job_id: job.job_id,
      location: job.location,
      service_type: job.service_type,
      budgeted_hours: budgeted,
      actual_hours: parseFloat(actualForJob.toFixed(2)),
      efficiency: jobEfficiency,
      status: jobEfficiency >= 1.0 ? 'good' : 'needs_improvement'
    };
  });
  
  return {
    overall_efficiency: efficiency,
    total_budgeted_hours: parseFloat(totalBudgetedHours.toFixed(2)),
    total_actual_hours: parseFloat(totalActualHours.toFixed(2)),
    job_count: jobs.length,
    job_breakdown: jobBreakdown
  };
}

/**
 * Calculate base pay
 * @param {number} hoursWorked - Hours worked
 * @param {number} baseRate - Hourly rate
 * @returns {number} Base pay amount
 */
function calculateBasePay(hoursWorked, baseRate) {
  if (hoursWorked === null || hoursWorked === undefined || hoursWorked < 0) {
    throw new Error('Invalid hours worked');
  }
  
  if (!baseRate || baseRate < 0) {
    throw new Error('Invalid base rate');
  }
  
  const basePay = hoursWorked * baseRate;
  return parseFloat(basePay.toFixed(settings.moneyDecimalPlaces));
}

/**
 * Detect anomalies in payroll calculation
 * @param {Object} calculation - Calculated payroll data
 * @returns {Object} Anomaly detection result
 */
function detectAnomalies(calculation) {
  const anomalies = [];
  let hasAnomalies = false;
  
  // Check for missing critical data
  if (!calculation.base_pay || calculation.base_pay === 0) {
    hasAnomalies = true;
    anomalies.push('Missing or zero base pay');
  }
  
  if (!calculation.hours_worked || calculation.hours_worked === 0) {
    hasAnomalies = true;
    anomalies.push('Missing or zero hours worked');
  }
  
  // Check for negative total pay (should never happen)
  if (calculation.total_pay < 0) {
    hasAnomalies = true;
    anomalies.push('Negative total pay detected');
  }
  
  // Check for missing timesheet data
  if (!calculation.clock_in || !calculation.clock_out) {
    hasAnomalies = true;
    anomalies.push('Missing clock in/out data');
  }
  
  return {
    has_anomalies: hasAnomalies,
    anomaly_flags: anomalies,
    anomaly_count: anomalies.length
  };
}

/**
 * Calculate payroll for a single employee
 * @param {Object} employee - Employee data with timesheet
 * @param {Array} jobs - Jobs assigned to this employee
 * @returns {Object} Complete payroll calculation
 */
function calculateEmployeePayroll(employee, jobs) {
  try {
    // Validate input
    if (!employee) {
      throw new Error('Employee data is required');
    }
    
    if (!employee.employee_id) {
      throw new Error('Employee ID is required');
    }
    
    // Get timesheet data
    const timesheet = employee.timesheet || employee;
    const hoursWorked = timesheet.hours_worked || 0;
    const baseRate = timesheet.base_rate || employee.base_rate || settings.defaultBaseRate;
    const clockIn = timesheet.clock_in;
    const clockOut = timesheet.clock_out;
    const lunchStart = timesheet.lunch_start;
    const lunchEnd = timesheet.lunch_end;
    const date = timesheet.date;
    
    // Calculate base pay
    const basePay = calculateBasePay(hoursWorked, baseRate);
    
    // Calculate penalties
    const latePenalty = clockIn 
      ? calculateLatePenalty(basePay, clockIn)
      : { amount: 0, applied: false };

    const longLunchPenalty = (lunchStart && lunchEnd)
      ? calculateLongLunchPenalty(basePay, lunchStart, lunchEnd)
      : { amount: 0, applied: false };

    const totalPenalties = latePenalty.amount + longLunchPenalty.amount;
    
    // Calculate total pay (base pay minus penalties only)
    // 
    // BUSINESS RULE: Simplified P4P Formula
    // Formula: totalPay = basePay - totalPenalties
    // 
    // This is a simplified calculation that:
    // - NO bonuses (efficiency bonuses removed)
    // - NO efficiency multipliers
    // - Only applies penalties for:
    //   - Late clock-in (>7:00 AM): 5% of base pay
    //   - Long lunch (>1 hour): 2% of base pay
    // 
    // The total pay can never be negative (minimum is 0)
    let totalPay = basePay - totalPenalties;
    
    // Ensure total pay is not negative (minimum is 0)
    // This prevents negative payouts even if penalties exceed base pay
    if (totalPay < 0) {
      totalPay = 0;
    }
    
    totalPay = parseFloat(totalPay.toFixed(settings.moneyDecimalPlaces));
    
    // Build calculation result
    const calculation = {
      employee_id: employee.employee_id,
      employee_name: timesheet.employee_name || employee.name || 'Unknown',
      date: date,
      hours_worked: hoursWorked,
      base_rate: baseRate,
      base_pay: basePay,
      late_penalty: latePenalty.amount,
      long_lunch_penalty: longLunchPenalty.amount,
      total_penalties: parseFloat(totalPenalties.toFixed(settings.moneyDecimalPlaces)),
      total_pay: totalPay,
      clock_in: clockIn,
      clock_out: clockOut,
      lunch_start: lunchStart,
      lunch_end: lunchEnd,
      crew_id: timesheet.crew_id || employee.crew_id,
      // Detailed breakdown
      penalty_details: {
        late: latePenalty,
        long_lunch: longLunchPenalty
      },
      job_count: jobs ? jobs.length : 0
    };
    
    // Detect anomalies
    const anomalyResult = detectAnomalies(calculation);
    calculation.has_anomalies = anomalyResult.has_anomalies;
    calculation.anomaly_flags = anomalyResult.anomaly_flags;
    
    return {
      success: true,
      data: calculation
    };
    
  } catch (error) {
    console.error(`Error calculating payroll for employee ${employee?.employee_id}:`, error);
    return {
      success: false,
      error: error.message,
      employee_id: employee?.employee_id,
      employee_name: employee?.name || employee?.employee_name
    };
  }
}

/**
 * Calculate payroll for multiple employees
 * @param {Array} employees - Array of employee data with timesheets
 * @param {Array} jobs - All jobs
 * @param {Array} assignments - Job assignments mapping
 * @returns {Object} Batch calculation results
 */
function calculateBatchPayroll(employees, jobs, assignments) {
  const results = [];
  const errors = [];
  let successCount = 0;
  let errorCount = 0;
  let anomalyCount = 0;
  
  // Group assignments by employee
  // This creates a mapping of employee_id -> array of jobs they worked on
  // This allows us to calculate payroll per employee with their job breakdown
  const assignmentsByEmployee = {};
  if (assignments && assignments.length > 0) {
    assignments.forEach(assignment => {
      if (!assignmentsByEmployee[assignment.employee_id]) {
        assignmentsByEmployee[assignment.employee_id] = [];
      }
      // Find the full job data from the jobs array
      // This links the assignment to the complete job details (location, service_type, etc.)
      const job = jobs.find(j => j.job_id === assignment.job_id);
      if (job) {
        assignmentsByEmployee[assignment.employee_id].push(job);
      }
    });
  }
  
  // Calculate payroll for each employee
  employees.forEach(employee => {
    const employeeJobs = assignmentsByEmployee[employee.employee_id] || [];
    const result = calculateEmployeePayroll(employee, employeeJobs);
    
    if (result.success) {
      successCount++;
      if (result.data.has_anomalies) {
        anomalyCount++;
      }
      results.push(result.data);
    } else {
      errorCount++;
      errors.push(result);
    }
  });
  
  // Calculate summary statistics
  const totalBasePay = results.reduce((sum, r) => sum + r.base_pay, 0);
  const totalPenalties = results.reduce((sum, r) => sum + r.total_penalties, 0);
  const totalPay = results.reduce((sum, r) => sum + r.total_pay, 0);
  
  return {
    success: true,
    summary: {
      total_employees: employees.length,
      successful_calculations: successCount,
      failed_calculations: errorCount,
      anomalies_detected: anomalyCount,
      total_base_pay: parseFloat(totalBasePay.toFixed(2)),
      total_penalties: parseFloat(totalPenalties.toFixed(2)),
      total_payout: parseFloat(totalPay.toFixed(2))
    },
    results: results,
    errors: errors
  };
}

module.exports = {
  calculateEfficiency,
  calculateAggregateEfficiency,
  calculateBasePay,
  detectAnomalies,
  calculateEmployeePayroll,
  calculateBatchPayroll
};

