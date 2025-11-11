/**
 * Upload Routes
 * Clean Scapes P4P System
 * 
 * Handles CSV file uploads for Service Autopilot and Paychex data
 */

const express = require('express');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const { parseServiceAutopilotCSV, parsePaychexCSV, validateCSVFile } = require('../utils/csvParser');
const { supabase } = require('../config/database');

const router = express.Router();

// Configure multer for memory storage (we'll parse CSV in memory)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.toLowerCase().endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

/**
 * POST /api/upload/service-autopilot
 * Upload Service Autopilot CSV file
 * Admin only
 */
router.post('/service-autopilot', authenticateToken, requireAdmin, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Validate file
    const validation = validateCSVFile(req.file.originalname, 'service-autopilot');
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // Parse CSV
    const parseResult = await parseServiceAutopilotCSV(req.file.buffer);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to parse CSV file',
        details: parseResult.errors
      });
    }

    // Store data in jobs table
    const jobsToInsert = parseResult.data.map(job => ({
      external_id: job.external_id,
      date: job.date,
      crew_id: job.crew_id,
      service_type: job.service_type,
      budgeted_hours: job.budgeted_hours,
      actual_hours: job.actual_hours,
      status: job.status || 'pending'
    }));

    // Insert jobs (insert only, duplicates will be allowed)
    // In the future, we could add a unique constraint on (external_id, date) if needed
    const { data: insertedJobs, error: insertError } = await supabase
      .from('jobs')
      .insert(jobsToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting jobs:', insertError);
      return res.status(500).json({
        success: false,
        error: 'Failed to store job data',
        details: insertError.message
      });
    }

    res.json({
      success: true,
      message: 'Service Autopilot data uploaded successfully',
      data: {
        recordsProcessed: parseResult.count,
        recordsStored: insertedJobs?.length || 0,
        errors: parseResult.errors,
        preview: parseResult.data.slice(0, 10) // First 10 rows for preview
      }
    });

  } catch (error) {
    console.error('Error uploading Service Autopilot CSV:', error);
    next(error);
  }
});

/**
 * POST /api/upload/paychex
 * Upload Paychex CSV file
 * Admin only
 */
router.post('/paychex', authenticateToken, requireAdmin, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Validate file
    const validation = validateCSVFile(req.file.originalname, 'paychex');
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // Parse CSV
    const parseResult = await parsePaychexCSV(req.file.buffer);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to parse CSV file',
        details: parseResult.errors
      });
    }

    // Get user IDs for employee_ids
    const employeeIds = [...new Set(parseResult.data.map(t => t.employee_id))];
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, employee_id')
      .in('employee_id', employeeIds);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch user data',
        details: usersError.message
      });
    }

    // Create mapping of employee_id to user id
    const employeeIdToUserId = {};
    users.forEach(user => {
      employeeIdToUserId[user.employee_id] = user.id;
    });

    // Prepare timesheets for insertion
    const timesheetsToInsert = [];
    const missingEmployees = [];

    for (const timesheet of parseResult.data) {
      const userId = employeeIdToUserId[timesheet.employee_id];
      
      if (!userId) {
        missingEmployees.push(timesheet.employee_id);
        continue;
      }

      // Parse time strings to TIME format (HH:MM:SS)
      const parseTime = (timeStr) => {
        if (!timeStr) return null;
        try {
          // Handle ISO 8601 format: 2024-11-10T07:15:00Z
          if (timeStr.includes('T')) {
            const date = new Date(timeStr);
            return date.toTimeString().split(' ')[0]; // Extract HH:MM:SS
          }
          // Handle HH:MM:SS format
          return timeStr.split(' ')[0]; // Take first part if space-separated
        } catch (error) {
          return null;
        }
      };

      timesheetsToInsert.push({
        employee_id: userId,
        date: timesheet.date,
        clock_in: parseTime(timesheet.clock_in),
        clock_out: parseTime(timesheet.clock_out),
        lunch_start: parseTime(timesheet.lunch_start),
        lunch_end: parseTime(timesheet.lunch_end),
        total_hours: timesheet.total_hours
      });
    }

    if (timesheetsToInsert.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid timesheet records found',
        details: missingEmployees.length > 0 ? `Missing employees: ${missingEmployees.join(', ')}` : 'No matching employees found'
      });
    }

    // Insert timesheets (use upsert to handle duplicates)
    const { data: insertedTimesheets, error: insertError } = await supabase
      .from('timesheets')
      .upsert(timesheetsToInsert, {
        onConflict: 'employee_id,date',
        ignoreDuplicates: false
      })
      .select();

    if (insertError) {
      console.error('Error inserting timesheets:', insertError);
      return res.status(500).json({
        success: false,
        error: 'Failed to store timesheet data',
        details: insertError.message
      });
    }

    // Update user base_rate if provided in CSV
    const rateUpdates = {};
    parseResult.data.forEach(t => {
      if (t.base_rate && employeeIdToUserId[t.employee_id]) {
        rateUpdates[employeeIdToUserId[t.employee_id]] = t.base_rate;
      }
    });

    if (Object.keys(rateUpdates).length > 0) {
      // Update base rates (batch update)
      for (const [userId, baseRate] of Object.entries(rateUpdates)) {
        await supabase
          .from('users')
          .update({ base_rate: baseRate })
          .eq('id', userId);
      }
    }

    res.json({
      success: true,
      message: 'Paychex data uploaded successfully',
      data: {
        recordsProcessed: parseResult.count,
        recordsStored: insertedTimesheets?.length || 0,
        missingEmployees: missingEmployees.length > 0 ? missingEmployees : undefined,
        errors: parseResult.errors,
        preview: parseResult.data.slice(0, 10) // First 10 rows for preview
      }
    });

  } catch (error) {
    console.error('Error uploading Paychex CSV:', error);
    next(error);
  }
});

module.exports = router;

