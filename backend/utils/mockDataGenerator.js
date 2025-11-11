/**
 * Mock Data Generator
 * Generates realistic mock data for Service Autopilot and Paychex APIs
 */

/**
 * Generate mock job data for Service Autopilot
 * @param {Date} date - Date to generate jobs for
 * @param {number} count - Number of jobs to generate
 * @returns {Array} Array of job objects
 */
function generateMockJobs(date = new Date(), count = 15) {
  const jobs = [];
  const serviceTypes = [
    { name: 'Full Service', budgeted_hours: 4.0 },
    { name: 'Mowing', budgeted_hours: 2.0 },
    { name: 'Trimming & Edging', budgeted_hours: 1.5 },
    { name: 'Cleanup', budgeted_hours: 1.0 },
    { name: 'Landscaping', budgeted_hours: 6.0 },
    { name: 'Maintenance', budgeted_hours: 3.0 }
  ];

  const locations = [
    'Oak Park Plaza', 'Riverside Mall', 'Downtown Office Complex',
    'Sunset Apartments', 'Green Valley School', 'City Hall',
    'Memorial Park', 'Westside Shopping Center', 'Lakeside Commons',
    'Highland Medical Center', 'Brookfield Business Park', 'Cedar Grove HOA'
  ];

  // Use crew IDs that match seeded foremen (foreman1, foreman2)
  const crewIds = ['foreman1', 'foreman2'];

  for (let i = 0; i < count; i++) {
    const serviceType = serviceTypes[i % serviceTypes.length];
    const crewId = crewIds[i % crewIds.length];
    
    jobs.push({
      job_id: `JOB-${date.toISOString().split('T')[0]}-${String(i + 1).padStart(3, '0')}`,
      date: date.toISOString().split('T')[0],
      location: locations[i % locations.length],
      service_type: serviceType.name,
      budgeted_hours: serviceType.budgeted_hours,
      crew_id: crewId,
      status: 'completed',
      notes: i % 5 === 0 ? 'Required additional cleanup due to weather' : null
    });
  }

  return jobs;
}

/**
 * Generate mock timesheet data for Paychex
 * @param {Date} date - Date to generate timesheets for
 * @returns {Array} Array of timesheet objects
 */
function generateMockTimesheets(date = new Date()) {
  const timesheets = [];
  
  // Generate timesheets for crew members (matching seeded users)
  const employees = [
    { id: 'crew1', name: 'Juan Garcia', crew_id: 'foreman1', base_rate: 18.00 },
    { id: 'crew2', name: 'Maria Lopez', crew_id: 'foreman1', base_rate: 17.50 },
    { id: 'crew3', name: 'Carlos Rodriguez', crew_id: 'foreman2', base_rate: 19.00 },
    { id: 'crew4', name: 'Ana Martinez', crew_id: 'foreman2', base_rate: 18.50 }
  ];

  employees.forEach((employee, index) => {
    // Vary the clock-in times (some on-time, some late)
    const clockInHour = index % 3 === 0 ? 7 : 6; // Some arrive late (7:00+), others early
    const clockInMinute = index % 3 === 0 ? 15 : 45;
    
    // Vary lunch durations (some normal, some long)
    const lunchDuration = index % 4 === 0 ? 45 : 30; // Some take long lunch
    
    // Vary work hours (some efficient, some not)
    const hoursWorked = 8 + (index % 3 === 0 ? 1 : 0); // Some work overtime
    
    const clockIn = new Date(date);
    clockIn.setHours(clockInHour, clockInMinute, 0);
    
    const lunchStart = new Date(clockIn);
    lunchStart.setHours(12, 0, 0);
    
    const lunchEnd = new Date(lunchStart);
    lunchEnd.setMinutes(lunchStart.getMinutes() + lunchDuration);
    
    const clockOut = new Date(clockIn);
    clockOut.setHours(clockIn.getHours() + hoursWorked, clockIn.getMinutes(), 0);
    
    timesheets.push({
      employee_id: employee.id,
      employee_name: employee.name,
      date: date.toISOString().split('T')[0],
      clock_in: clockIn.toISOString(),
      clock_out: clockOut.toISOString(),
      lunch_start: lunchStart.toISOString(),
      lunch_end: lunchEnd.toISOString(),
      hours_worked: hoursWorked,
      base_rate: employee.base_rate,
      crew_id: employee.crew_id,
      status: 'approved'
    });
  });

  return timesheets;
}

/**
 * Generate mock job assignments (which employees worked which jobs)
 * @param {Array} jobs - Array of job objects
 * @param {Array} timesheets - Array of timesheet objects
 * @returns {Array} Array of job assignment objects
 */
function generateMockJobAssignments(jobs, timesheets) {
  const assignments = [];
  
  // Group timesheets by crew
  const crewGroups = {};
  timesheets.forEach(timesheet => {
    if (!crewGroups[timesheet.crew_id]) {
      crewGroups[timesheet.crew_id] = [];
    }
    crewGroups[timesheet.crew_id].push(timesheet);
  });

  // Assign employees to jobs based on crew
  jobs.forEach(job => {
    const crewMembers = crewGroups[job.crew_id] || [];
    
    crewMembers.forEach(member => {
      assignments.push({
        job_id: job.job_id,
        employee_id: member.employee_id,
        date: job.date,
        budgeted_hours: job.budgeted_hours,
        actual_hours: member.hours_worked / crewMembers.length // Split hours among crew
      });
    });
  });

  return assignments;
}

/**
 * Generate realistic mock data for a specific date
 * @param {Date} date - Date to generate data for
 * @returns {Object} Object with jobs, timesheets, and assignments
 */
function generateMockDataForDate(date = new Date()) {
  const jobs = generateMockJobs(date, 12);
  const timesheets = generateMockTimesheets(date);
  const assignments = generateMockJobAssignments(jobs, timesheets);

  return {
    jobs,
    timesheets,
    assignments,
    metadata: {
      date: date.toISOString().split('T')[0],
      total_jobs: jobs.length,
      total_employees: timesheets.length,
      generated_at: new Date().toISOString()
    }
  };
}

/**
 * Parse date from various formats
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {Date} Parsed date object
 */
function parseDate(dateInput) {
  if (dateInput instanceof Date) {
    return dateInput;
  }
  
  if (typeof dateInput === 'string') {
    return new Date(dateInput);
  }
  
  // Default to yesterday if no date provided
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
}

module.exports = {
  generateMockJobs,
  generateMockTimesheets,
  generateMockJobAssignments,
  generateMockDataForDate,
  parseDate
};

