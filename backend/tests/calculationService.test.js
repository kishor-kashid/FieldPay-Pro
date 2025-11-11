/**
 * Unit Tests for Calculation Service
 * Tests P4P calculation logic, efficiency, bonuses, penalties, and anomaly detection
 */

const {
  calculateEfficiency,
  calculateAggregateEfficiency,
  calculateBasePay,
  detectAnomalies,
  calculateEmployeePayroll,
  calculateBatchPayroll
} = require('../services/calculationService');

describe('Calculation Service', () => {
  
  describe('calculateEfficiency', () => {
    test('should calculate efficiency correctly for exact match', () => {
      const efficiency = calculateEfficiency(8, 8);
      expect(efficiency).toBe(1.0);
    });
    
    test('should calculate efficiency correctly for high performance', () => {
      const efficiency = calculateEfficiency(8, 7);
      expect(efficiency).toBeCloseTo(1.1429, 4);
    });
    
    test('should calculate efficiency correctly for low performance', () => {
      const efficiency = calculateEfficiency(8, 10);
      expect(efficiency).toBe(0.8);
    });
    
    test('should throw error for zero actual hours', () => {
      expect(() => calculateEfficiency(8, 0)).toThrow('actual hours is zero');
    });
    
    test('should throw error for zero budgeted hours', () => {
      expect(() => calculateEfficiency(0, 8)).toThrow('budgeted hours is zero');
    });
  });
  
  describe('calculateAggregateEfficiency', () => {
    test('should calculate aggregate efficiency for multiple jobs', () => {
      const jobs = [
        { job_id: 'JOB-001', service_type: 'Mowing', budgeted_hours: 2.0, location: 'Site A' },
        { job_id: 'JOB-002', service_type: 'Cleanup', budgeted_hours: 1.0, location: 'Site B' }
      ];
      const totalActualHours = 3.0;
      
      const result = calculateAggregateEfficiency(jobs, totalActualHours);
      
      expect(result.overall_efficiency).toBe(1.0);
      expect(result.total_budgeted_hours).toBe(3.0);
      expect(result.total_actual_hours).toBe(3.0);
      expect(result.job_count).toBe(2);
      expect(result.job_breakdown).toHaveLength(2);
    });
    
    test('should handle high aggregate efficiency', () => {
      const jobs = [
        { job_id: 'JOB-001', service_type: 'Mowing', budgeted_hours: 4.0, location: 'Site A' }
      ];
      const totalActualHours = 3.0;
      
      const result = calculateAggregateEfficiency(jobs, totalActualHours);
      
      expect(result.overall_efficiency).toBeCloseTo(1.3333, 4);
    });
    
    test('should throw error for empty jobs array', () => {
      expect(() => calculateAggregateEfficiency([], 8)).toThrow('No jobs provided');
    });
    
    test('should throw error for zero total actual hours', () => {
      const jobs = [
        { job_id: 'JOB-001', service_type: 'Mowing', budgeted_hours: 2.0, location: 'Site A' }
      ];
      expect(() => calculateAggregateEfficiency(jobs, 0)).toThrow('total actual hours is zero');
    });
  });
  
  describe('calculateBasePay', () => {
    test('should calculate base pay correctly', () => {
      const basePay = calculateBasePay(8, 18.00);
      expect(basePay).toBe(144.00);
    });
    
    test('should round to 2 decimal places', () => {
      const basePay = calculateBasePay(7.5, 17.33);
      // 7.5 * 17.33 = 129.975, which JavaScript rounds to 129.97 due to floating point
      expect(basePay).toBe(129.97);
    });
    
    test('should handle zero hours', () => {
      const basePay = calculateBasePay(0, 18.00);
      expect(basePay).toBe(0.00);
    });
    
    test('should throw error for negative hours', () => {
      expect(() => calculateBasePay(-1, 18.00)).toThrow('Invalid hours worked');
    });
    
    test('should throw error for invalid base rate', () => {
      expect(() => calculateBasePay(8, -5)).toThrow('Invalid base rate');
    });
  });
  
  describe('detectAnomalies', () => {
    test('should detect no anomalies for normal calculation', () => {
      const calculation = {
        efficiency: 0.95,
        base_pay: 144.00,
        hours_worked: 8,
        total_pay: 150.00,
        clock_in: '2024-11-10T06:45:00Z',
        clock_out: '2024-11-10T15:00:00Z'
      };
      
      const result = detectAnomalies(calculation);
      
      expect(result.has_anomalies).toBe(false);
      expect(result.anomaly_flags).toHaveLength(0);
    });
    
    test('should detect low efficiency anomaly', () => {
      const calculation = {
        efficiency: 0.55,
        base_pay: 144.00,
        hours_worked: 8,
        total_pay: 144.00,
        clock_in: '2024-11-10T06:45:00Z',
        clock_out: '2024-11-10T15:00:00Z'
      };
      
      const result = detectAnomalies(calculation);
      
      expect(result.has_anomalies).toBe(true);
      expect(result.anomaly_flags.some(f => f.includes('Low efficiency'))).toBe(true);
    });
    
    test('should detect high efficiency anomaly', () => {
      const calculation = {
        efficiency: 1.25,
        base_pay: 144.00,
        hours_worked: 8,
        total_pay: 180.00,
        clock_in: '2024-11-10T06:45:00Z',
        clock_out: '2024-11-10T15:00:00Z'
      };
      
      const result = detectAnomalies(calculation);
      
      expect(result.has_anomalies).toBe(true);
      expect(result.anomaly_flags.some(f => f.includes('High efficiency'))).toBe(true);
    });
    
    test('should detect negative total pay anomaly', () => {
      const calculation = {
        efficiency: 0.8,
        base_pay: 144.00,
        hours_worked: 8,
        total_pay: -10.00,
        clock_in: '2024-11-10T06:45:00Z',
        clock_out: '2024-11-10T15:00:00Z'
      };
      
      const result = detectAnomalies(calculation);
      
      expect(result.has_anomalies).toBe(true);
      expect(result.anomaly_flags.some(f => f.includes('Negative total pay'))).toBe(true);
    });
    
    test('should detect missing clock data anomaly', () => {
      const calculation = {
        efficiency: 0.95,
        base_pay: 144.00,
        hours_worked: 8,
        total_pay: 150.00,
        clock_in: null,
        clock_out: null
      };
      
      const result = detectAnomalies(calculation);
      
      expect(result.has_anomalies).toBe(true);
      expect(result.anomaly_flags.some(f => f.includes('Missing clock'))).toBe(true);
    });
  });
  
  describe('calculateEmployeePayroll', () => {
    test('should calculate complete payroll for employee with good performance', () => {
      const employee = {
        employee_id: 'crew1',
        name: 'John Doe',
        base_rate: 18.00,
        timesheet: {
          hours_worked: 8,
          base_rate: 18.00,
          clock_in: '2024-11-10T06:45:00Z',
          clock_out: '2024-11-10T15:00:00Z',
          lunch_start: '2024-11-10T12:00:00Z',
          lunch_end: '2024-11-10T12:30:00Z',
          date: '2024-11-10',
          crew_id: 'foreman1'
        }
      };
      
      const jobs = [
        { job_id: 'JOB-001', service_type: 'Mowing', budgeted_hours: 8.0, location: 'Site A' }
      ];
      
      const result = calculateEmployeePayroll(employee, jobs);
      
      expect(result.success).toBe(true);
      expect(result.data.base_pay).toBe(144.00);
      expect(result.data.efficiency).toBe(1.0);
      expect(result.data.performance_bonus).toBe(0.00); // At 100%, no bonus (bonus starts above 100%)
      expect(result.data.late_penalty).toBe(0.00);
      expect(result.data.long_lunch_penalty).toBe(0.00);
      expect(result.data.total_pay).toBe(144.00);
    });
    
    test('should calculate payroll with high performance bonus', () => {
      const employee = {
        employee_id: 'crew1',
        name: 'John Doe',
        timesheet: {
          hours_worked: 7,
          base_rate: 18.00,
          clock_in: '2024-11-10T06:45:00Z',
          clock_out: '2024-11-10T14:00:00Z',
          lunch_start: '2024-11-10T12:00:00Z',
          lunch_end: '2024-11-10T12:30:00Z',
          date: '2024-11-10',
          crew_id: 'foreman1'
        }
      };
      
      const jobs = [
        { job_id: 'JOB-001', service_type: 'Mowing', budgeted_hours: 8.0, location: 'Site A' }
      ];
      
      const result = calculateEmployeePayroll(employee, jobs);
      
      expect(result.success).toBe(true);
      expect(result.data.base_pay).toBe(126.00);
      expect(result.data.efficiency).toBeCloseTo(1.1429, 4);
      expect(result.data.performance_bonus).toBeGreaterThan(0);
      expect(result.data.total_pay).toBeGreaterThan(126.00);
    });
    
    test('should calculate payroll with late penalty', () => {
      const employee = {
        employee_id: 'crew1',
        name: 'John Doe',
        timesheet: {
          hours_worked: 8,
          base_rate: 18.00,
          clock_in: '2024-11-10T07:15:00Z', // Late (after 7:00 AM)
          clock_out: '2024-11-10T16:00:00Z',
          lunch_start: '2024-11-10T12:00:00Z',
          lunch_end: '2024-11-10T12:30:00Z',
          date: '2024-11-10',
          crew_id: 'foreman1'
        }
      };
      
      const jobs = [
        { job_id: 'JOB-001', service_type: 'Mowing', budgeted_hours: 8.0, location: 'Site A' }
      ];
      
      const result = calculateEmployeePayroll(employee, jobs);
      
      expect(result.success).toBe(true);
      expect(result.data.late_penalty).toBeGreaterThan(0);
      expect(result.data.late_penalty).toBe(7.20); // 5% of 144.00
    });
    
    test('should calculate payroll with long lunch penalty', () => {
      const employee = {
        employee_id: 'crew1',
        name: 'John Doe',
        timesheet: {
          hours_worked: 8,
          base_rate: 18.00,
          clock_in: '2024-11-10T06:45:00Z',
          clock_out: '2024-11-10T15:00:00Z',
          lunch_start: '2024-11-10T12:00:00Z',
          lunch_end: '2024-11-10T12:45:00Z', // 45 minute lunch (> 30)
          date: '2024-11-10',
          crew_id: 'foreman1'
        }
      };
      
      const jobs = [
        { job_id: 'JOB-001', service_type: 'Mowing', budgeted_hours: 8.0, location: 'Site A' }
      ];
      
      const result = calculateEmployeePayroll(employee, jobs);
      
      expect(result.success).toBe(true);
      expect(result.data.long_lunch_penalty).toBeGreaterThan(0);
      expect(result.data.long_lunch_penalty).toBe(2.88); // 2% of 144.00
    });
    
    test('should handle employee with no jobs assigned', () => {
      const employee = {
        employee_id: 'crew1',
        name: 'John Doe',
        timesheet: {
          hours_worked: 8,
          base_rate: 18.00,
          clock_in: '2024-11-10T06:45:00Z',
          clock_out: '2024-11-10T15:00:00Z',
          lunch_start: '2024-11-10T12:00:00Z',
          lunch_end: '2024-11-10T12:30:00Z',
          date: '2024-11-10',
          crew_id: 'foreman1'
        }
      };
      
      const result = calculateEmployeePayroll(employee, []);
      
      expect(result.success).toBe(true);
      expect(result.data.efficiency).toBeNull();
      expect(result.data.performance_bonus).toBe(0.00);
    });
  });
  
  describe('calculateBatchPayroll', () => {
    test('should calculate payroll for multiple employees', () => {
      const employees = [
        {
          employee_id: 'crew1',
          name: 'John Doe',
          timesheet: {
            hours_worked: 8,
            base_rate: 18.00,
            clock_in: '2024-11-10T06:45:00Z',
            clock_out: '2024-11-10T15:00:00Z',
            lunch_start: '2024-11-10T12:00:00Z',
            lunch_end: '2024-11-10T12:30:00Z',
            date: '2024-11-10',
            crew_id: 'foreman1',
            employee_id: 'crew1'
          }
        },
        {
          employee_id: 'crew2',
          name: 'Jane Smith',
          timesheet: {
            hours_worked: 7,
            base_rate: 17.50,
            clock_in: '2024-11-10T06:50:00Z',
            clock_out: '2024-11-10T14:30:00Z',
            lunch_start: '2024-11-10T12:00:00Z',
            lunch_end: '2024-11-10T12:30:00Z',
            date: '2024-11-10',
            crew_id: 'foreman1',
            employee_id: 'crew2'
          }
        }
      ];
      
      const jobs = [
        { job_id: 'JOB-001', service_type: 'Mowing', budgeted_hours: 4.0, location: 'Site A' },
        { job_id: 'JOB-002', service_type: 'Cleanup', budgeted_hours: 4.0, location: 'Site B' }
      ];
      
      const assignments = [
        { job_id: 'JOB-001', employee_id: 'crew1' },
        { job_id: 'JOB-002', employee_id: 'crew2' }
      ];
      
      const result = calculateBatchPayroll(employees, jobs, assignments);
      
      expect(result.success).toBe(true);
      expect(result.summary.total_employees).toBe(2);
      expect(result.summary.successful_calculations).toBe(2);
      expect(result.summary.failed_calculations).toBe(0);
      expect(result.results).toHaveLength(2);
    });
    
    test('should handle empty employee list', () => {
      const result = calculateBatchPayroll([], [], []);
      
      expect(result.success).toBe(true);
      expect(result.summary.total_employees).toBe(0);
      expect(result.results).toHaveLength(0);
    });
  });
  
});

