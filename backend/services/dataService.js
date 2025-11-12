/**
 * Data Service
 * Abstraction layer for fetching data from external APIs (Service Autopilot, Paychex)
 * Handles switching between mock and real APIs based on configuration
 */

const axios = require('axios');
const { 
  getServiceAutopilotConfig, 
  getPaychexConfig, 
  isMockEnabled 
} = require('../config/api');
const { 
  generateMockJobs, 
  generateMockTimesheets, 
  generateMockJobAssignments 
} = require('../utils/mockDataGenerator');

/**
 * Fetch job data from Service Autopilot
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} crewId - Optional crew ID filter
 * @returns {Promise<Array>} Array of job objects
 */
async function getJobData(date, crewId = null) {
  try {
    // If using mock APIs, generate mock data directly (works in any environment)
    if (isMockEnabled()) {
      const dateObj = new Date(date);
      let jobs = generateMockJobs(dateObj, 12);
      
      if (crewId) {
        jobs = jobs.filter(job => job.crew_id === crewId);
      }
      
      return jobs;
    }

    // Otherwise, fetch from API (real or mock server)
    const config = getServiceAutopilotConfig();
    const url = `${config.baseUrl}/jobs`;
    const params = { date };
    
    if (crewId) {
      params.crew_id = crewId;
    }

    const response = await axios.get(url, {
      params,
      headers: config.headers,
      timeout: config.timeout
    });

    return response.data.data.jobs || [];
  } catch (error) {
    console.error('Error fetching job data:', error.message);
    throw new Error(`Failed to fetch job data: ${error.message}`);
  }
}

/**
 * Fetch timesheet data from Paychex
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} employeeId - Optional employee ID filter
 * @returns {Promise<Array>} Array of timesheet objects
 */
async function getTimesheetData(date, employeeId = null) {
  try {
    // If using mock APIs, generate mock data directly (works in any environment)
    if (isMockEnabled()) {
      const dateObj = new Date(date);
      let timesheets = generateMockTimesheets(dateObj);
      
      if (employeeId) {
        timesheets = timesheets.filter(ts => ts.employee_id === employeeId);
      }
      
      return timesheets;
    }

    // Otherwise, fetch from API (real or mock server)
    const config = getPaychexConfig();
    const url = `${config.baseUrl}/timesheets`;
    const params = { date };
    
    if (employeeId) {
      params.employee_id = employeeId;
    }

    const response = await axios.get(url, {
      params,
      headers: config.headers,
      timeout: config.timeout
    });

    return response.data.data.timesheets || [];
  } catch (error) {
    console.error('Error fetching timesheet data:', error.message);
    throw new Error(`Failed to fetch timesheet data: ${error.message}`);
  }
}

/**
 * Fetch job assignments (which employees worked which jobs)
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Array>} Array of assignment objects
 */
async function getJobAssignments(date) {
  try {
    // If using mock APIs, generate mock data directly (works in any environment)
    if (isMockEnabled()) {
      const dateObj = new Date(date);
      const jobs = generateMockJobs(dateObj, 12);
      const timesheets = generateMockTimesheets(dateObj);
      const assignments = generateMockJobAssignments(jobs, timesheets);
      
      return assignments;
    }

    // Otherwise, fetch from API
    const config = getServiceAutopilotConfig();
    const url = `${config.baseUrl}/assignments`;
    const params = { date };

    const response = await axios.get(url, {
      params,
      headers: config.headers,
      timeout: config.timeout
    });

    return response.data.data.assignments || [];
  } catch (error) {
    console.error('Error fetching assignment data:', error.message);
    throw new Error(`Failed to fetch assignment data: ${error.message}`);
  }
}

/**
 * Fetch all data needed for payroll processing
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Object with jobs, timesheets, and assignments
 */
async function getPayrollData(date) {
  try {
    // Fetch all data in parallel
    const [jobs, timesheets, assignments] = await Promise.all([
      getJobData(date),
      getTimesheetData(date),
      getJobAssignments(date)
    ]);

    return {
      jobs,
      timesheets,
      assignments,
      date,
      source: isMockEnabled() ? 'mock' : 'real'
    };
  } catch (error) {
    console.error('Error fetching payroll data:', error.message);
    throw error;
  }
}

/**
 * Fetch employee list from Paychex
 * @returns {Promise<Array>} Array of employee objects
 */
async function getEmployees() {
  try {
    const config = getPaychexConfig();
    const url = `${config.baseUrl}/employees`;

    const response = await axios.get(url, {
      headers: config.headers,
      timeout: config.timeout
    });

    return response.data.data.employees || [];
  } catch (error) {
    console.error('Error fetching employees:', error.message);
    
    // Return mock data as fallback
    return [
      { employee_id: 'crew1', employee_name: 'Juan Garcia', base_rate: 18.00, crew_id: 'foreman1' },
      { employee_id: 'crew2', employee_name: 'Maria Lopez', base_rate: 17.50, crew_id: 'foreman1' },
      { employee_id: 'crew3', employee_name: 'Carlos Rodriguez', base_rate: 19.00, crew_id: 'foreman2' },
      { employee_id: 'crew4', employee_name: 'Ana Martinez', base_rate: 18.50, crew_id: 'foreman2' }
    ];
  }
}

/**
 * Fetch crew list from Service Autopilot
 * @returns {Promise<Array>} Array of crew objects
 */
async function getCrews() {
  try {
    const config = getServiceAutopilotConfig();
    const url = `${config.baseUrl}/crews`;

    const response = await axios.get(url, {
      headers: config.headers,
      timeout: config.timeout
    });

    return response.data.data.crews || [];
  } catch (error) {
    console.error('Error fetching crews:', error.message);
    
    // Return mock data as fallback
    return [
      { crew_id: 'foreman1', crew_name: 'Team Alpha', foreman_id: 'foreman1' },
      { crew_id: 'foreman2', crew_name: 'Team Bravo', foreman_id: 'foreman2' }
    ];
  }
}

module.exports = {
  getJobData,
  getTimesheetData,
  getJobAssignments,
  getPayrollData,
  getEmployees,
  getCrews
};

