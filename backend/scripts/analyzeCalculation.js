/**
 * Analyze Calculation Values
 * Traces through the calculation to verify values are correct
 * Run: node scripts/analyzeCalculation.js
 */

require('dotenv').config({ path: '.env' });
const { calculateEmployeePayroll } = require('../services/calculationService');

// Example: Carmen Diaz (crew10, index 9 in mock data)
// From mockDataGenerator.js:
// - index 9: clockInHour = 9 % 3 === 0 ? 7 : 6 = 7 (LATE - after 7:00 AM)
// - index 9: lunchDuration = 9 % 4 === 0 ? 45 : 30 = 30 (NOT long lunch)
// - index 9: hoursWorked = 8 + (9 % 3 === 0 ? 1 : 0) = 8 + 1 = 9 hours

console.log('='.repeat(60));
console.log('📊 CALCULATION ANALYSIS');
console.log('='.repeat(60));
console.log('\nExample: Carmen Diaz (crew10)\n');

// Simulate Carmen Diaz timesheet
const carmenDiaz = {
  employee_id: 'crew10',
  name: 'Carmen Diaz',
  base_rate: 18.00,
  timesheet: {
    employee_id: 'crew10',
    employee_name: 'Carmen Diaz',
    date: '2025-11-07',
    hours_worked: 9,
    base_rate: 18.00,
    clock_in: '2025-11-07T07:15:00.000Z', // 7:15 AM (LATE - after 7:00 AM cutoff)
    clock_out: '2025-11-07T16:15:00.000Z',
    lunch_start: '2025-11-07T12:00:00.000Z',
    lunch_end: '2025-11-07T12:30:00.000Z', // 30 minutes (NOT long lunch)
    crew_id: 'foreman2'
  }
};

console.log('Input Data:');
console.log(`  Hours Worked: ${carmenDiaz.timesheet.hours_worked}`);
console.log(`  Base Rate: $${carmenDiaz.base_rate}/hr`);
console.log(`  Clock In: ${carmenDiaz.timesheet.clock_in} (7:15 AM - LATE)`);
console.log(`  Lunch: 12:00 - 12:30 (30 min - NOT long)`);
console.log('');

// Calculate
const result = calculateEmployeePayroll(carmenDiaz, []);

if (result.success) {
  const calc = result.data;
  
  console.log('Calculation Results:');
  console.log(`  Base Pay: $${calc.base_pay.toFixed(2)} (${calc.hours_worked} hrs × $${calc.base_rate}/hr)`);
  console.log(`  Late Penalty: $${calc.late_penalty.toFixed(2)} (5% of base pay if clock in after 7:00 AM)`);
  console.log(`  Long Lunch Penalty: $${calc.long_lunch_penalty.toFixed(2)} (2% of base pay if lunch > 30 min)`);
  console.log(`  Total Penalties: $${calc.total_penalties.toFixed(2)}`);
  console.log(`  Total Pay: $${calc.total_pay.toFixed(2)} (Base Pay - Total Penalties)`);
  console.log('');
  
  // Verify formula
  const expectedTotal = calc.base_pay - calc.total_penalties;
  const isCorrect = Math.abs(calc.total_pay - expectedTotal) < 0.01;
  
  console.log('Formula Verification:');
  console.log(`  Expected: $${calc.base_pay.toFixed(2)} - $${calc.total_penalties.toFixed(2)} = $${expectedTotal.toFixed(2)}`);
  console.log(`  Actual: $${calc.total_pay.toFixed(2)}`);
  console.log(`  Match: ${isCorrect ? '✅ CORRECT' : '❌ MISMATCH'}`);
  
  if (!isCorrect) {
    console.log(`\n⚠️  WARNING: Calculation doesn't match formula!`);
    console.log(`   Difference: $${Math.abs(calc.total_pay - expectedTotal).toFixed(2)}`);
  }
} else {
  console.error('❌ Calculation failed:', result.error);
}

console.log('\n' + '='.repeat(60));
console.log('Example: Employee with NO penalties\n');

// Example with no penalties
const noPenaltyEmployee = {
  employee_id: 'crew1',
  name: 'Juan Garcia',
  base_rate: 18.00,
  timesheet: {
    employee_id: 'crew1',
    employee_name: 'Juan Garcia',
    date: '2025-11-07',
    hours_worked: 9,
    base_rate: 18.00,
    clock_in: '2025-11-07T06:45:00.000Z', // 6:45 AM (NOT late - before 7:00 AM)
    clock_out: '2025-11-07T15:45:00.000Z',
    lunch_start: '2025-11-07T12:00:00.000Z',
    lunch_end: '2025-11-07T12:30:00.000Z', // 30 minutes (NOT long lunch)
    crew_id: 'foreman1'
  }
};

const result2 = calculateEmployeePayroll(noPenaltyEmployee, []);

if (result2.success) {
  const calc = result2.data;
  
  console.log('Input Data:');
  console.log(`  Hours Worked: ${calc.hours_worked}`);
  console.log(`  Base Rate: $${calc.base_rate}/hr`);
  console.log(`  Clock In: 6:45 AM (NOT late)`);
  console.log(`  Lunch: 30 min (NOT long)`);
  console.log('');
  
  console.log('Calculation Results:');
  console.log(`  Base Pay: $${calc.base_pay.toFixed(2)}`);
  console.log(`  Late Penalty: $${calc.late_penalty.toFixed(2)}`);
  console.log(`  Long Lunch Penalty: $${calc.long_lunch_penalty.toFixed(2)}`);
  console.log(`  Total Penalties: $${calc.total_penalties.toFixed(2)}`);
  console.log(`  Total Pay: $${calc.total_pay.toFixed(2)}`);
  console.log('');
  
  const expectedTotal = calc.base_pay - calc.total_penalties;
  const isCorrect = Math.abs(calc.total_pay - expectedTotal) < 0.01;
  
  console.log('Formula Verification:');
  console.log(`  Expected: $${calc.base_pay.toFixed(2)} - $${calc.total_penalties.toFixed(2)} = $${expectedTotal.toFixed(2)}`);
  console.log(`  Actual: $${calc.total_pay.toFixed(2)}`);
  console.log(`  Match: ${isCorrect ? '✅ CORRECT' : '❌ MISMATCH'}`);
  
  if (calc.total_penalties === 0 && calc.base_pay === calc.total_pay) {
    console.log('\n✅ CORRECT: When penalties = $0, Total Pay = Base Pay');
  }
}

console.log('\n' + '='.repeat(60));
console.log('📋 Summary:');
console.log('='.repeat(60));
console.log('Formula: Total Pay = Base Pay - Total Penalties');
console.log('  - Base Pay = Hours Worked × Base Rate');
console.log('  - Late Penalty = 5% of Base Pay (if clock in after 7:00 AM)');
console.log('  - Long Lunch Penalty = 2% of Base Pay (if lunch > 30 minutes)');
console.log('  - Total Penalties = Late Penalty + Long Lunch Penalty');
console.log('\nWhen Penalties = $0.00:');
console.log('  Total Pay = Base Pay - $0.00 = Base Pay');
console.log('  (They should be the SAME)\n');

