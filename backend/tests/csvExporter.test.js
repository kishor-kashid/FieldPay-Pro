/**
 * Unit Tests for CSV Exporter
 * Tests CSV generation in different formats
 */

const {
  generatePayrollCSV,
  generateDetailedPayrollCSV,
  generateSummaryCSV,
  generateFilename
} = require('../utils/csvExporter');

describe('CSV Exporter', () => {
  const sampleRecords = [
    {
      employee_id: 'emp001',
      employee_name: 'John Doe',
      date: '2024-01-15',
      base_pay: 150.00,
      efficiency_bonus: 25.00,
      performance_bonus: 10.00,
      late_penalty: 5.00,
      long_lunch_penalty: 2.00,
      total_pay: 178.00,
      efficiency_percentage: 105.5,
      efficiency: 1.055,
      hours_worked: 8.5,
      base_rate: 18.00,
      approved: true,
      approved_at: '2024-01-16T10:00:00Z',
      approved_by: 'admin1',
      has_anomalies: false,
      status: 'approved'
    },
    {
      employee_id: 'emp002',
      employee_name: 'Jane Smith',
      date: '2024-01-15',
      base_pay: 140.00,
      efficiency_bonus: 0,
      performance_bonus: 0,
      late_penalty: 0,
      long_lunch_penalty: 0,
      total_pay: 140.00,
      efficiency_percentage: 95.0,
      efficiency: 0.95,
      hours_worked: 8.0,
      base_rate: 17.50,
      approved: false,
      approved_at: null,
      approved_by: null,
      has_anomalies: true,
      status: 'pending'
    }
  ];

  describe('generatePayrollCSV - Standard Format', () => {
    test('should generate standard payroll CSV with proper headers', () => {
      const csv = generatePayrollCSV(sampleRecords);

      expect(csv).toContain('Employee ID');
      expect(csv).toContain('Employee Name');
      expect(csv).toContain('Date');
      expect(csv).toContain('Hours Worked');
      expect(csv).toContain('Total Pay');
    });

    test('should include employee data', () => {
      const csv = generatePayrollCSV(sampleRecords);

      expect(csv).toContain('emp001');
      expect(csv).toContain('"John Doe"');
      expect(csv).toContain('emp002');
      expect(csv).toContain('"Jane Smith"');
    });

    test('should format amounts to 2 decimal places', () => {
      const csv = generatePayrollCSV(sampleRecords);

      expect(csv).toContain('178.00');
      expect(csv).toContain('140.00');
    });

    test('should throw error for empty records array', () => {
      expect(() => generatePayrollCSV([])).toThrow('No records to export');
    });

    test('should throw error for null records', () => {
      expect(() => generatePayrollCSV(null)).toThrow('No records to export');
    });
  });

  describe('generateDetailedPayrollCSV', () => {
    test('should include detailed payroll columns', () => {
      const csv = generateDetailedPayrollCSV(sampleRecords);

      // Check for expected columns (using actual header names)
      expect(csv).toContain('Employee ID');
      expect(csv).toContain('Employee Name');
      expect(csv).toContain('Date');
      expect(csv).toContain('Base Pay');
      expect(csv).toContain('Late Penalty');
      expect(csv).toContain('Long Lunch Penalty');
      expect(csv).toContain('Total Penalties');
      expect(csv).toContain('Total Pay');
    });

    test('should include data rows', () => {
      const csv = generateDetailedPayrollCSV(sampleRecords);

      expect(csv).toContain('emp001');
      expect(csv).toContain('"John Doe"');
      expect(csv).toContain('2024-01-15');
    });

    test('should handle records with all fields present', () => {
      const csv = generateDetailedPayrollCSV(sampleRecords);

      expect(csv).toContain('178.00');
      expect(csv).toContain('140.00');
    });
  });

  describe('generateSummaryCSV', () => {
    test('should generate employee summary CSV', () => {
      const csv = generateSummaryCSV(sampleRecords);

      // Check headers
      expect(csv).toContain('Employee ID');
      expect(csv).toContain('Employee Name');
      expect(csv).toContain('Total Hours');
      expect(csv).toContain('Total Payout');
    });

    test('should aggregate data by employee', () => {
      const csv = generateSummaryCSV(sampleRecords);

      expect(csv).toContain('emp001');
      expect(csv).toContain('emp002');
    });

    test('should throw error for empty records', () => {
      expect(() => generateSummaryCSV([])).toThrow('No records to export');
    });
  });

  describe('generateFilename', () => {
    test('should generate filename with type and date', () => {
      const filename = generateFilename('standard', '2024-01-15');

      expect(filename).toBe('payroll_standard_2024-01-15.csv');
    });

    test('should generate filename for detailed format', () => {
      const filename = generateFilename('detailed', '2024-01-15');

      expect(filename).toContain('detailed');
      expect(filename).toContain('.csv');
      expect(filename).toBe('payroll_detailed_2024-01-15.csv');
    });

    test('should generate filename for summary format', () => {
      const filename = generateFilename('summary', '2024-01-15');

      expect(filename).toContain('summary');
      expect(filename).toContain('.csv');
      expect(filename).toBe('payroll_summary_2024-01-15.csv');
    });

    test('should use current date if no date provided', () => {
      const filename = generateFilename('standard');
      
      // Should match pattern: payroll_standard_YYYY-MM-DD.csv
      expect(filename).toMatch(/^payroll_standard_\d{4}-\d{2}-\d{2}\.csv$/);
    });

    test('should default to standard type if not specified', () => {
      const filename = generateFilename();
      
      expect(filename).toMatch(/^payroll_standard_\d{4}-\d{2}-\d{2}\.csv$/);
    });
  });

  describe('Edge Cases', () => {
    test('should handle special characters in employee names', () => {
      const records = [{
        employee_id: 'emp001',
        employee_name: 'O\'Brien, John "Jr."',
        date: '2024-01-15',
        total_pay: 150.00,
        base_pay: 150.00,
        base_rate: 18.00,
        hours_worked: 8.0,
        performance_bonus: 0,
        late_penalty: 0,
        long_lunch_penalty: 0,
        efficiency: 1.0,
        status: 'approved',
        approved: false,
        has_anomalies: false
      }];

      const csv = generatePayrollCSV(records);

      // CSV should handle quotes and special chars
      expect(csv).toContain('O\'Brien');
    });

    test('should handle zero values correctly', () => {
      const records = [{
        employee_id: 'emp001',
        employee_name: 'Test User',
        date: '2024-01-15',
        total_pay: 0,
        base_pay: 0,
        base_rate: 0,
        efficiency_bonus: 0,
        performance_bonus: 0,
        late_penalty: 0,
        long_lunch_penalty: 0,
        hours_worked: 0,
        efficiency: 0,
        status: 'approved',
        approved: false,
        has_anomalies: false
      }];

      const csv = generateDetailedPayrollCSV(records);

      expect(csv).toContain('0.00'); // Zero values formatted
    });

    test('should handle missing employee_name field', () => {
      const records = [{
        employee_id: 'emp001',
        // employee_name is missing
        date: '2024-01-15',
        total_pay: 150.00,
        base_pay: 150.00,
        base_rate: 18.00,
        hours_worked: 8.0,
        performance_bonus: 0,
        late_penalty: 0,
        long_lunch_penalty: 0,
        efficiency: 1.0,
        status: 'approved',
        approved: false,
        has_anomalies: false
      }];

      const csv = generatePayrollCSV(records);

      // Should use "Unknown" for missing name
      expect(csv).toContain('Unknown');
    });

    test('should handle null efficiency values', () => {
      const records = [{
        employee_id: 'emp001',
        employee_name: 'Test User',
        date: '2024-01-15',
        total_pay: 150.00,
        base_pay: 150.00,
        base_rate: 18.00,
        hours_worked: 8.0,
        performance_bonus: 0,
        late_penalty: 0,
        long_lunch_penalty: 0,
        efficiency: null,
        status: 'approved',
        approved: false,
        has_anomalies: false
      }];

      const csv = generateDetailedPayrollCSV(records);

      expect(csv).toContain('0.00'); // Null efficiency should default to 0.00
    });
  });
});
