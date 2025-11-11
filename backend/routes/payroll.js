/**
 * Payroll Routes
 * API endpoints for payroll processing, analysis, and management
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin, requireRole } = require('../middleware/roleCheck');
const { supabase } = require('../config/database');
const {
  analyzePayroll,
  processPayroll,
  getPayrollRecords,
  getPayrollRecord,
  approvePayrollRecord,
  bulkApprovePayrollRecords
} = require('../services/payrollService');
const {
  generatePayrollCSV,
  generateDetailedPayrollCSV,
  generateSummaryCSV,
  generateFilename
} = require('../utils/csvExporter');
const {
  getExecutionLogs,
  getExecutionLogById,
  getExecutionStats
} = require('../services/executionLogService');

/**
 * POST /api/payroll/analyze
 * Analyze payroll without saving (preview mode)
 * Admin only
 */
router.post('/analyze', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { date } = req.body;
    
    // Default to yesterday if no date provided
    const targetDate = date || (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toISOString().split('T')[0];
    })();
    
    console.log(`📊 Admin ${req.user.uid} analyzing payroll for ${targetDate}`);
    
    const result = await analyzePayroll(targetDate);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        date: targetDate
      });
    }
    
    res.json({
      success: true,
      ...result
    });
    
  } catch (error) {
    console.error('Error in analyze payroll endpoint:', error);
    next(error);
  }
});

/**
 * POST /api/payroll/process
 * Process and save payroll to database
 * Admin only
 */
router.post('/process', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { date, reprocess } = req.body;
    
    // Log request details for debugging
    console.log('📥 Process payroll request:', {
      date,
      reprocess,
      userEmail: req.user?.email,
      userId: req.user?.id,
      userUid: req.user?.uid,
      userRole: req.user?.role
    });
    
    // Use database user ID (UUID) - the auth middleware spreads ...user which includes the database id field
    // The database user object from Supabase has an 'id' field (UUID)
    // Note: The spread order matters - ...user comes after uid/email, so user.id should be present
    let triggeredBy = req.user.id;
    
    // Fallback: If id is not available, try to get it from the database using email
    if (!triggeredBy) {
      console.warn('req.user.id not found, attempting to fetch from database...');
      try {
        const { data: user, error } = await supabase
          .from('users')
          .select('id')
          .eq('email', req.user.email)
          .single();
        
        if (user && user.id) {
          triggeredBy = user.id;
          console.log(`✅ Found user ID from database: ${triggeredBy}`);
        } else {
          throw new Error('User not found in database');
        }
      } catch (dbError) {
        console.error('User ID not found in req.user:', {
          hasId: !!req.user.id,
          hasUid: !!req.user.uid,
          userKeys: Object.keys(req.user),
          email: req.user.email,
          role: req.user.role,
          dbError: dbError.message
        });
        return res.status(400).json({
          success: false,
          error: 'User ID not found. Please ensure user exists in database. Authentication may have failed.'
        });
      }
    }
    
    // Default to yesterday if no date provided
    const targetDate = date || (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toISOString().split('T')[0];
    })();
    
    console.log(`🚀 Admin ${req.user.email} (ID: ${triggeredBy}) processing payroll for ${targetDate} (reprocess: ${reprocess || false})`);
    
    const result = await processPayroll(targetDate, triggeredBy, { reprocess: reprocess || false });
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        date: targetDate,
        existing_count: result.existing_count,
        message: result.message
      });
    }
    
    // Transform response to match frontend expectations
    res.json({
      success: true,
      ...result,
      recordsProcessed: result.summary?.saved_records || result.summary?.successful_calculations || 0,
      notificationsSent: result.notifications_sent || 0
    });
    
  } catch (error) {
    console.error('Error in process payroll endpoint:', error);
    next(error);
  }
});

/**
 * GET /api/payroll/records
 * Get payroll records with optional filters
 * Accessible by: admin (all), manager (all), foreman (own crew), crew_member (own records)
 */
router.get('/records', authenticateToken, async (req, res, next) => {
  try {
    const { date, start_date, end_date, employee_id, crew_id, status, anomalies_only } = req.query;
    const user = req.user;
    
    // Build filters based on role
    const filters = {};
    
    if (date) filters.date = date;
    if (start_date) filters.start_date = start_date;
    if (end_date) filters.end_date = end_date;
    if (status) filters.status = status;
    if (anomalies_only === 'true') filters.anomalies_only = true;
    
    // Role-based filtering
    if (user.role === 'crew_member') {
      // Crew members can only see their own records
      filters.employee_id = user.id || user.uid;
    } else if (user.role === 'foreman') {
      // Foremen can see their crew's records
      if (employee_id) {
        filters.employee_id = employee_id;
      } else {
        // Use foreman's crew_id from user object, not uid
        const foremanCrewId = user.crew_id || user.customClaims?.crew_id;
        if (foremanCrewId) {
          filters.crew_id = foremanCrewId;
        }
        // If crew_id is provided in query, use it (but still restricted to foreman's crew)
        if (crew_id && foremanCrewId) {
          // Allow if it matches foreman's crew (with flexible matching)
          const normalizedQueryCrew = String(crew_id).trim().toLowerCase();
          const normalizedForemanCrew = String(foremanCrewId).trim().toLowerCase();
          
          // Extract numbers for matching (CREW1 vs foreman1)
          const queryNumMatch = normalizedQueryCrew.match(/\d+/);
          const foremanNumMatch = normalizedForemanCrew.match(/\d+/);
          
          if (queryNumMatch && foremanNumMatch && queryNumMatch[0] === foremanNumMatch[0]) {
            // Numbers match, use the query crew_id
            filters.crew_id = crew_id;
          } else if (normalizedQueryCrew === normalizedForemanCrew) {
            // Exact match
            filters.crew_id = crew_id;
          } else {
            // Use foreman's crew_id
            filters.crew_id = foremanCrewId;
          }
        }
      }
    } else if (user.role === 'manager' || user.role === 'admin') {
      // Managers and admins can see all, with optional filtering
      if (employee_id) filters.employee_id = employee_id;
      if (crew_id) filters.crew_id = crew_id;
    }
    
    const result = await getPayrollRecords(filters);
    
    res.json({
      success: true,
      ...result
    });
    
  } catch (error) {
    console.error('Error fetching payroll records:', error);
    next(error);
  }
});

/**
 * GET /api/payroll/records/:id
 * Get single payroll record details
 * Accessible by: admin (all), manager (all), foreman (own crew), crew_member (own record)
 */
router.get('/records/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    const result = await getPayrollRecord(id);
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }
    
    const record = result.record;
    
    // Check permissions
    if (user.role === 'crew_member') {
      // Crew members can only see their own records
      // Compare with user.id (database ID) or user.employee_id, not user.uid
      const userEmployeeId = user.id || user.employee_id;
      if (record.employee_id !== userEmployeeId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. You can only view your own records.'
        });
      }
    }
    
    if (user.role === 'foreman') {
      // Foremen can only see their crew's records
      // Use crew_id from user object, not uid
      const foremanCrewId = user.crew_id || user.customClaims?.crew_id;
      if (foremanCrewId && record.crew_id) {
        // Flexible crew matching (handles CREW1/foreman1 mismatches)
        const normalizedRecordCrew = String(record.crew_id).trim().toLowerCase();
        const normalizedForemanCrew = String(foremanCrewId).trim().toLowerCase();
        
        // Extract numbers for matching (CREW1 vs foreman1)
        const recordNumMatch = normalizedRecordCrew.match(/\d+/);
        const foremanNumMatch = normalizedForemanCrew.match(/\d+/);
        
        const crewMatches = 
          (recordNumMatch && foremanNumMatch && recordNumMatch[0] === foremanNumMatch[0]) ||
          normalizedRecordCrew === normalizedForemanCrew;
        
        if (!crewMatches) {
          return res.status(403).json({
            success: false,
            error: 'Access denied. You can only view records for your crew.'
          });
        }
      } else if (foremanCrewId && !record.crew_id) {
        // Record has no crew_id but foreman has one - deny access
        return res.status(403).json({
          success: false,
          error: 'Access denied. Record does not belong to your crew.'
        });
      }
    }
    
    res.json({
      success: true,
      ...result
    });
    
  } catch (error) {
    console.error('Error fetching payroll record:', error);
    next(error);
  }
});

/**
 * DELETE /api/payroll/records/:id
 * Delete a payroll record (for reprocessing)
 * Admin only
 */
router.delete('/records/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('payroll_records')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Record not found'
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      message: 'Record deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting payroll record:', error);
    next(error);
  }
});

/**
 * PATCH /api/payroll/records/:id/approve
 * Approve a payroll record
 * Admin only
 */
router.patch('/records/:id/approve', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const adminId = req.user.uid;
    
    console.log(`✅ Admin ${adminId} approving payroll record ${id}`);
    
    const result = await approvePayrollRecord(id, adminId, notes);
    
    res.json({
      success: true,
      ...result
    });
    
  } catch (error) {
    console.error('Error approving payroll record:', error);
    next(error);
  }
});

/**
 * POST /api/payroll/approve-bulk
 * Bulk approve multiple payroll records
 * Admin only
 */
router.post('/approve-bulk', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { record_ids } = req.body;
    const adminId = req.user.uid;
    
    if (!record_ids || !Array.isArray(record_ids) || record_ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'record_ids array is required'
      });
    }
    
    console.log(`✅ Admin ${adminId} bulk approving ${record_ids.length} records`);
    
    const result = await bulkApprovePayrollRecords(record_ids, adminId);
    
    res.json({
      success: true,
      ...result
    });
    
  } catch (error) {
    console.error('Error bulk approving payroll records:', error);
    next(error);
  }
});

/**
 * GET /api/payroll/export
 * Export payroll records to CSV
 * Admin and Manager only
 */
router.get('/export', authenticateToken, requireRole(['admin', 'manager']), async (req, res, next) => {
  try {
    const { date, type, format } = req.query;
    
    // Get records for the specified date
    const filters = {};
    if (date) filters.date = date;
    
    const result = await getPayrollRecords(filters);
    
    if (!result.success || result.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'No records found to export'
      });
    }
    
    // Generate CSV based on format
    let csv;
    const exportType = format || 'standard';
    
    switch (exportType) {
      case 'detailed':
        csv = generateDetailedPayrollCSV(result.records);
        break;
      case 'summary':
        csv = generateSummaryCSV(result.records);
        break;
      default:
        csv = generatePayrollCSV(result.records);
    }
    
    // Generate filename
    const filename = generateFilename(exportType, date);
    
    // Send CSV file
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
    
  } catch (error) {
    console.error('Error exporting payroll:', error);
    next(error);
  }
});

/**
 * GET /api/payroll/summary
 * Get payroll summary statistics
 * Admin and Manager only
 */
router.get('/summary', authenticateToken, requireRole(['admin', 'manager']), async (req, res, next) => {
  try {
    const { date, start_date, end_date } = req.query;
    
    // Build filters
    const filters = {};
    if (date) {
      filters.date = date;
    }
    
    const result = await getPayrollRecords(filters);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch payroll records'
      });
    }
    
    // Calculate summary statistics
    const records = result.records;
    const totalRecords = records.length;
    const approvedRecords = records.filter(r => r.approved).length;
    const pendingRecords = records.filter(r => !r.approved).length;
    const anomalyRecords = records.filter(r => r.has_anomalies).length;
    
    const totalBasePay = records.reduce((sum, r) => sum + r.base_pay, 0);
    const totalBonuses = records.reduce((sum, r) => sum + r.performance_bonus, 0);
    const totalPenalties = records.reduce((sum, r) => sum + r.late_penalty + r.long_lunch_penalty, 0);
    const totalPayout = records.reduce((sum, r) => sum + r.total_pay, 0);
    
    const avgEfficiency = records.filter(r => r.efficiency !== null)
      .reduce((sum, r, _, arr) => sum + (r.efficiency / arr.length), 0);
    
    res.json({
      success: true,
      summary: {
        total_records: totalRecords,
        approved_records: approvedRecords,
        pending_records: pendingRecords,
        anomaly_records: anomalyRecords,
        total_base_pay: parseFloat(totalBasePay.toFixed(2)),
        total_bonuses: parseFloat(totalBonuses.toFixed(2)),
        total_penalties: parseFloat(totalPenalties.toFixed(2)),
        total_payout: parseFloat(totalPayout.toFixed(2)),
        average_efficiency: avgEfficiency ? parseFloat(avgEfficiency.toFixed(4)) : null,
        average_efficiency_percentage: avgEfficiency ? parseFloat((avgEfficiency * 100).toFixed(2)) : null
      },
      filters: filters
    });
    
  } catch (error) {
    console.error('Error fetching payroll summary:', error);
    next(error);
  }
});

/**
 * GET /api/payroll/executions
 * Get execution logs with optional filters
 * Admin only
 */
router.get('/executions', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const {
      execution_date,
      status,
      is_reprocess,
      start_date,
      end_date,
      limit,
      offset
    } = req.query;
    
    const filters = {
      execution_date,
      status,
      is_reprocess: is_reprocess === 'true' ? true : is_reprocess === 'false' ? false : undefined,
      start_date,
      end_date,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0
    };
    
    const logs = await getExecutionLogs(filters);
    
    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
    
  } catch (error) {
    console.error('Error fetching execution logs:', error);
    next(error);
  }
});

/**
 * GET /api/payroll/executions/:id
 * Get single execution log by ID
 * Admin only
 */
router.get('/executions/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const log = await getExecutionLogById(id);
    
    res.json({
      success: true,
      data: log
    });
    
  } catch (error) {
    console.error('Error fetching execution log:', error);
    next(error);
  }
});

/**
 * GET /api/payroll/executions/stats
 * Get execution statistics
 * Admin only
 */
router.get('/executions/stats', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    
    const stats = await getExecutionStats({ start_date, end_date });
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Error fetching execution stats:', error);
    next(error);
  }
});

module.exports = router;

