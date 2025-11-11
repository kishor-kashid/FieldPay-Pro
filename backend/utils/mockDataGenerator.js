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

  // Use date to vary job distribution
  const dateSeed = date.getTime() % 1000;
  const dayOfWeek = date.getDay();
  
  for (let i = 0; i < count; i++) {
    // Vary service types and locations based on date
    const variation = (i + dateSeed + dayOfWeek) % serviceTypes.length;
    const serviceType = serviceTypes[variation];
    const crewId = crewIds[(i + dayOfWeek) % crewIds.length];
    const locationIndex = (i + dateSeed) % locations.length;
    
    // Vary budgeted hours slightly based on date (weekends might have different hours)
    const budgetVariation = dayOfWeek === 0 || dayOfWeek === 6 ? 0.5 : 0;
    const adjustedBudget = serviceType.budgeted_hours + budgetVariation;
    
    // Vary notes based on date (different dates have different issues)
    const hasNotes = (i + dateSeed) % 5 === 0;
    const noteVariations = [
      'Required additional cleanup due to weather',
      'Client requested extra trimming',
      'Equipment issue delayed completion',
      'Additional area needed maintenance',
      'Special event preparation required'
    ];
    const noteIndex = (i + dateSeed) % noteVariations.length;
    
    jobs.push({
      job_id: `JOB-${date.toISOString().split('T')[0]}-${String(i + 1).padStart(3, '0')}`,
      date: date.toISOString().split('T')[0],
      location: locations[locationIndex],
      service_type: serviceType.name,
      budgeted_hours: adjustedBudget,
      crew_id: crewId,
      status: 'completed',
      notes: hasNotes ? noteVariations[noteIndex] : null
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
    { id: 'crew4', name: 'Ana Martinez', crew_id: 'foreman2', base_rate: 18.50 },
    { id: 'crew5', name: 'Miguel Hernandez', crew_id: 'foreman1', base_rate: 17.00 },
    { id: 'crew6', name: 'Sofia Ramirez', crew_id: 'foreman1', base_rate: 18.00 },
    { id: 'crew7', name: 'Diego Torres', crew_id: 'foreman2', base_rate: 17.50 },
    { id: 'crew8', name: 'Isabella Flores', crew_id: 'foreman2', base_rate: 18.50 },
    { id: 'crew9', name: 'Luis Morales', crew_id: 'foreman2', base_rate: 19.00 },
    { id: 'crew10', name: 'Carmen Diaz', crew_id: 'foreman2', base_rate: 18.00 }
  ];

  // Use date as a seed to create variation between dates
  const dateSeed = date.getTime() % 1000; // Use milliseconds as seed
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  
  employees.forEach((employee, index) => {
    // Create date-specific variation by combining index with date seed
    const variation = (index + dateSeed) % 7;
    const dayVariation = (index + dayOfWeek) % 5;
    
    // Vary the clock-in times based on date and employee
    // Different dates will have different employees arriving late
    const isLate = (variation + dayVariation) % 3 === 0;
    const clockInHour = isLate ? 7 : 6;
    const clockInMinute = isLate ? (15 + (variation % 30)) : (45 + (variation % 15));
    
    // Vary lunch durations based on date
    const hasLongLunch = (variation + dayVariation) % 4 === 0;
    const lunchDuration = hasLongLunch ? (45 + (variation % 15)) : 30;
    
    // Vary work hours based on date (some days have overtime)
    const hasOvertime = (variation + dayOfWeek) % 3 === 0;
    const hoursWorked = 8 + (hasOvertime ? (0.5 + (variation % 2) * 0.5) : 0);
    
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

