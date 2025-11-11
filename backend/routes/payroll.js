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
    
    // Default to yesterday if no date provided
    const targetDate = date || (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toISOString().split('T')[0];
    })();
    
    console.log(`🚀 Admin ${req.user.uid} processing payroll for ${targetDate} (reprocess: ${reprocess || false})`);
    
    const result = await processPayroll(targetDate, { reprocess: reprocess || false });
    
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
    const { date, employee_id, crew_id, status, anomalies_only } = req.query;
    const user = req.user;
    
    // Build filters based on role
    const filters = {};
    
    if (date) filters.date = date;
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

module.exports = router;

