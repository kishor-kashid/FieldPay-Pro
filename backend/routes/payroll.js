/**
 * Payroll Routes
 * API endpoints for payroll processing, analysis, and management
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin, requireRole } = require('../middleware/roleCheck');
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
    // Use database user ID (UUID) instead of Firebase UID
    const triggeredBy = req.user.id; // Get database user ID (UUID) from authenticated user
    
    if (!triggeredBy) {
      return res.status(400).json({
        success: false,
        error: 'User ID not found. Please ensure user exists in database.'
      });
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
    
    res.json({
      success: true,
      ...result
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
      filters.employee_id = user.uid;
    } else if (user.role === 'foreman') {
      // Foremen can see their crew's records
      if (employee_id) {
        filters.employee_id = employee_id;
      } else {
        filters.crew_id = user.uid; // Foreman's crew
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
    if (user.role === 'crew_member' && record.employee_id !== user.uid) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    if (user.role === 'foreman' && record.crew_id !== user.uid) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
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

