/**
 * Mock Paychex API Routes
 * Simulates Paychex API for development and testing
 */

const express = require('express');
const router = express.Router();
const { 
  generateMockTimesheets,
  parseDate 
} = require('../../utils/mockDataGenerator');

/**
 * GET /mock/paychex/timesheets
 * Fetch timesheet data for a specific date
 * Query params:
 *   - date: Date to fetch timesheets for (YYYY-MM-DD format, defaults to yesterday)
 *   - employee_id: Optional filter by employee
 */
router.get('/timesheets', (req, res) => {
  try {
    const dateParam = req.query.date;
    const employeeIdFilter = req.query.employee_id;
    
    // Parse date or use yesterday as default
    const date = dateParam ? parseDate(dateParam) : (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    })();

    // Generate mock timesheets
    let timesheets = generateMockTimesheets(date);

    // Filter by employee if specified
    if (employeeIdFilter) {
      timesheets = timesheets.filter(ts => ts.employee_id === employeeIdFilter);
    }

    // Calculate summary statistics
    const summary = {
      total_employees: timesheets.length,
      total_hours: timesheets.reduce((sum, ts) => sum + ts.hours_worked, 0),
      total_cost: timesheets.reduce((sum, ts) => sum + (ts.hours_worked * ts.base_rate), 0),
      avg_hours: timesheets.length > 0 
        ? (timesheets.reduce((sum, ts) => sum + ts.hours_worked, 0) / timesheets.length).toFixed(2)
        : 0
    };

    // Return in Paychex API format
    res.json({
      success: true,
      data: {
        timesheets: timesheets,
        summary: summary,
        date: date.toISOString().split('T')[0]
      },
      meta: {
        source: 'mock_paychex',
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating mock Paychex data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate mock timesheet data',
      message: error.message
    });
  }
});

/**
 * GET /mock/paychex/timesheets/:employee_id
 * Fetch specific employee's timesheet
 */
router.get('/timesheets/:employee_id', (req, res) => {
  try {
    const { employee_id } = req.params;
    const dateParam = req.query.date;
    
    // Parse date or use yesterday as default
    const date = dateParam ? parseDate(dateParam) : (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    })();

    // Generate timesheets and find the specific employee
    const timesheets = generateMockTimesheets(date);
    const timesheet = timesheets.find(ts => ts.employee_id === employee_id);
    
    if (!timesheet) {
      return res.status(404).json({
        success: false,
        error: 'Timesheet not found for this employee and date'
      });
    }

    res.json({
      success: true,
      data: timesheet,
      meta: {
        source: 'mock_paychex'
      }
    });
  } catch (error) {
    console.error('Error fetching mock timesheet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch timesheet',
      message: error.message
    });
  }
});

/**
 * GET /mock/paychex/employees
 * Fetch list of employees
 */
router.get('/employees', (req, res) => {
  try {
    const employees = [
      {
        employee_id: 'crew1',
        employee_name: 'Juan Garcia',
        base_rate: 18.00,
        crew_id: 'foreman1',
        position: 'Crew Member',
        hire_date: '2023-01-15',
        status: 'active'
      },
      {
        employee_id: 'crew2',
        employee_name: 'Maria Lopez',
        base_rate: 17.50,
        crew_id: 'foreman1',
        position: 'Crew Member',
        hire_date: '2023-02-20',
        status: 'active'
      },
      {
        employee_id: 'crew3',
        employee_name: 'Carlos Rodriguez',
        base_rate: 19.00,
        crew_id: 'foreman2',
        position: 'Crew Member',
        hire_date: '2023-01-10',
        status: 'active'
      },
      {
        employee_id: 'crew4',
        employee_name: 'Ana Martinez',
        base_rate: 18.50,
        crew_id: 'foreman2',
        position: 'Crew Member',
        hire_date: '2023-03-05',
        status: 'active'
      }
    ];

    res.json({
      success: true,
      data: {
        employees: employees,
        total: employees.length
      },
      meta: {
        source: 'mock_paychex'
      }
    });
  } catch (error) {
    console.error('Error fetching mock employees:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch employees',
      message: error.message
    });
  }
});

/**
 * GET /mock/paychex/pay-rates
 * Fetch employee pay rates
 */
router.get('/pay-rates', (req, res) => {
  try {
    const payRates = [
      { employee_id: 'crew1', base_rate: 18.00, overtime_rate: 27.00, effective_date: '2024-01-01' },
      { employee_id: 'crew2', base_rate: 17.50, overtime_rate: 26.25, effective_date: '2024-01-01' },
      { employee_id: 'crew3', base_rate: 19.00, overtime_rate: 28.50, effective_date: '2024-01-01' },
      { employee_id: 'crew4', base_rate: 18.50, overtime_rate: 27.75, effective_date: '2024-01-01' }
    ];

    res.json({
      success: true,
      data: {
        pay_rates: payRates,
        total: payRates.length
      },
      meta: {
        source: 'mock_paychex'
      }
    });
  } catch (error) {
    console.error('Error fetching mock pay rates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pay rates',
      message: error.message
    });
  }
});

module.exports = router;

