/**
 * Mock Service Autopilot API Routes
 * Simulates Service Autopilot API for development and testing
 */

const express = require('express');
const router = express.Router();
const { 
  generateMockJobs, 
  generateMockJobAssignments,
  generateMockTimesheets,
  parseDate 
} = require('../../utils/mockDataGenerator');

/**
 * GET /mock/service-autopilot/jobs
 * Fetch job data for a specific date
 * Query params:
 *   - date: Date to fetch jobs for (YYYY-MM-DD format, defaults to yesterday)
 *   - crew_id: Optional filter by crew
 */
router.get('/jobs', (req, res) => {
  try {
    const dateParam = req.query.date;
    const crewIdFilter = req.query.crew_id;
    
    // Parse date or use yesterday as default
    const date = dateParam ? parseDate(dateParam) : (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    })();

    // Generate mock jobs
    let jobs = generateMockJobs(date, 12);

    // Filter by crew if specified
    if (crewIdFilter) {
      jobs = jobs.filter(job => job.crew_id === crewIdFilter);
    }

    // Return in Service Autopilot API format
    res.json({
      success: true,
      data: {
        jobs: jobs,
        total: jobs.length,
        date: date.toISOString().split('T')[0]
      },
      meta: {
        source: 'mock_service_autopilot',
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating mock Service Autopilot data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate mock job data',
      message: error.message
    });
  }
});

/**
 * GET /mock/service-autopilot/jobs/:job_id
 * Fetch specific job details
 */
router.get('/jobs/:job_id', (req, res) => {
  try {
    const { job_id } = req.params;
    
    // Extract date from job_id (format: JOB-YYYY-MM-DD-###)
    const dateMatch = job_id.match(/JOB-(\d{4}-\d{2}-\d{2})-/);
    if (!dateMatch) {
      return res.status(400).json({
        success: false,
        error: 'Invalid job_id format'
      });
    }
    
    const date = parseDate(dateMatch[1]);
    const jobs = generateMockJobs(date, 12);
    const job = jobs.find(j => j.job_id === job_id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: job,
      meta: {
        source: 'mock_service_autopilot'
      }
    });
  } catch (error) {
    console.error('Error fetching mock job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job',
      message: error.message
    });
  }
});

/**
 * GET /mock/service-autopilot/crews
 * Fetch list of crews
 */
router.get('/crews', (req, res) => {
  try {
    const crews = [
      {
        crew_id: 'foreman1',
        crew_name: 'Team Alpha',
        foreman: 'Roberto Santos',
        foreman_id: 'foreman1',
        member_count: 2,
        status: 'active'
      },
      {
        crew_id: 'foreman2',
        crew_name: 'Team Bravo',
        foreman: 'David Chen',
        foreman_id: 'foreman2',
        member_count: 2,
        status: 'active'
      }
    ];

    res.json({
      success: true,
      data: {
        crews: crews,
        total: crews.length
      },
      meta: {
        source: 'mock_service_autopilot'
      }
    });
  } catch (error) {
    console.error('Error fetching mock crews:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch crews',
      message: error.message
    });
  }
});

/**
 * GET /mock/service-autopilot/assignments
 * Fetch job assignments (which employees worked which jobs)
 */
router.get('/assignments', (req, res) => {
  try {
    const dateParam = req.query.date;
    
    // Parse date or use yesterday as default
    const date = dateParam ? parseDate(dateParam) : (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    })();

    // Generate jobs and timesheets to create assignments
    const jobs = generateMockJobs(date, 12);
    const timesheets = generateMockTimesheets(date);
    const assignments = generateMockJobAssignments(jobs, timesheets);

    res.json({
      success: true,
      data: {
        assignments: assignments,
        total: assignments.length,
        date: date.toISOString().split('T')[0]
      },
      meta: {
        source: 'mock_service_autopilot',
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating mock assignments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate assignments',
      message: error.message
    });
  }
});

module.exports = router;

