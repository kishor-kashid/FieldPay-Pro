/**
 * P4P Calculation Rules Configuration
 * Defines all rules, thresholds, and multipliers for payroll calculations
 */

/**
 * Penalty Configuration
 */
const penalties = {
  // Late clock-in penalty (clock in after 7:00 AM)
  late: {
    enabled: true,
    cutoffTime: '07:00:00', // 7:00 AM
    penaltyPercentage: 0.05, // 5% of base pay
    description: 'Penalty for clocking in after 7:00 AM'
  },
  
  // Long lunch penalty (lunch break > 30 minutes)
  longLunch: {
    enabled: true,
    maxDuration: 30, // minutes
    penaltyPercentage: 0.02, // 2% of base pay
    description: 'Penalty for lunch break exceeding 30 minutes'
  }
};

/**
 * Bonus Configuration
 * Efficiency-based performance bonuses
 */
const bonuses = {
  // High performance bonus (efficiency >= 100%)
  highPerformance: {
    enabled: true,
    minEfficiency: 1.0, // 100%
    multiplier: 1.0, // 100% of (efficiency - 1.0) * base pay
    description: 'Bonus for efficiency at or above 100%'
  },
  
  // Good performance bonus (efficiency >= 90% and < 100%)
  goodPerformance: {
    enabled: true,
    minEfficiency: 0.9, // 90%
    maxEfficiency: 0.999, // Just under 100%
    multiplier: 0.5, // 50% of (efficiency - 0.9) * base pay
    description: 'Bonus for efficiency between 90% and 99%'
  }
};

/**
 * Anomaly Detection Thresholds
 */
const anomalies = {
  // Low efficiency flag
  lowEfficiency: {
    enabled: true,
    threshold: 0.6, // 60%
    description: 'Flag efficiency below 60% as anomaly'
  },
  
  // High efficiency flag (suspiciously high)
  highEfficiency: {
    enabled: true,
    threshold: 1.2, // 120%
    description: 'Flag efficiency above 120% as potential data error'
  },
  
  // Missing data flag
  missingData: {
    enabled: true,
    description: 'Flag records with missing required fields'
  },
  
  // Negative pay flag
  negativePay: {
    enabled: true,
    description: 'Flag records with negative total pay (should never happen)'
  }
};

/**
 * Service Type Budgeted Hours
 * Default budgeted hours for different service types
 */
const serviceTypeBudgets = {
  'Full Service': 4.0,
  'Mowing': 2.0,
  'Trimming & Edging': 1.5,
  'Cleanup': 1.0,
  'Landscaping': 6.0,
  'Maintenance': 3.0,
  // Default for unknown service types
  'default': 2.0
};

/**
 * Calculation Settings
 */
const settings = {
  // Minimum total pay (cannot be negative)
  minTotalPay: 0.0,
  
  // Round efficiency to decimal places
  efficiencyDecimalPlaces: 4,
  
  // Round money to decimal places
  moneyDecimalPlaces: 2,
  
  // Default base rate if not found
  defaultBaseRate: 15.00
};

/**
 * Get service type budgeted hours
 * @param {string} serviceType - Service type name
 * @returns {number} Budgeted hours
 */
function getServiceTypeBudget(serviceType) {
  return serviceTypeBudgets[serviceType] || serviceTypeBudgets['default'];
}

/**
 * Check if efficiency is anomalous
 * @param {number} efficiency - Efficiency value
 * @returns {Object} Anomaly check result
 */
function checkEfficiencyAnomaly(efficiency) {
  const result = {
    isAnomaly: false,
    reasons: []
  };
  
  if (anomalies.lowEfficiency.enabled && efficiency < anomalies.lowEfficiency.threshold) {
    result.isAnomaly = true;
    result.reasons.push(`Low efficiency: ${(efficiency * 100).toFixed(1)}% (below ${anomalies.lowEfficiency.threshold * 100}%)`);
  }
  
  if (anomalies.highEfficiency.enabled && efficiency > anomalies.highEfficiency.threshold) {
    result.isAnomaly = true;
    result.reasons.push(`High efficiency: ${(efficiency * 100).toFixed(1)}% (above ${anomalies.highEfficiency.threshold * 100}%)`);
  }
  
  return result;
}

/**
 * Calculate late penalty amount
 * @param {number} basePay - Base pay amount
 * @param {string} clockInTime - Clock in time (ISO string or HH:MM:SS)
 * @returns {Object} Penalty result
 */
function calculateLatePenalty(basePay, clockInTime) {
  if (!penalties.late.enabled) {
    return { amount: 0, applied: false };
  }
  
  try {
    const clockIn = new Date(clockInTime);
    
    // Create cutoff time at 7:00 AM on the same day as clock in (using UTC to avoid timezone issues)
    const cutoff = new Date(clockIn);
    const [hours, minutes, seconds] = penalties.late.cutoffTime.split(':');
    cutoff.setUTCHours(parseInt(hours), parseInt(minutes), parseInt(seconds || 0), 0);
    
    if (clockIn > cutoff) {
      const amount = basePay * penalties.late.penaltyPercentage;
      return {
        amount: parseFloat(amount.toFixed(settings.moneyDecimalPlaces)),
        applied: true,
        reason: penalties.late.description,
        minutesLate: Math.round((clockIn - cutoff) / 1000 / 60)
      };
    }
  } catch (error) {
    console.error('Error calculating late penalty:', error);
  }
  
  return { amount: 0, applied: false };
}

/**
 * Calculate long lunch penalty amount
 * @param {number} basePay - Base pay amount
 * @param {string} lunchStart - Lunch start time (ISO string)
 * @param {string} lunchEnd - Lunch end time (ISO string)
 * @returns {Object} Penalty result
 */
function calculateLongLunchPenalty(basePay, lunchStart, lunchEnd) {
  if (!penalties.longLunch.enabled) {
    return { amount: 0, applied: false };
  }
  
  try {
    const start = new Date(lunchStart);
    const end = new Date(lunchEnd);
    const durationMinutes = (end - start) / 1000 / 60;
    
    if (durationMinutes > penalties.longLunch.maxDuration) {
      const amount = basePay * penalties.longLunch.penaltyPercentage;
      return {
        amount: parseFloat(amount.toFixed(settings.moneyDecimalPlaces)),
        applied: true,
        reason: penalties.longLunch.description,
        durationMinutes: Math.round(durationMinutes),
        excessMinutes: Math.round(durationMinutes - penalties.longLunch.maxDuration)
      };
    }
  } catch (error) {
    console.error('Error calculating long lunch penalty:', error);
  }
  
  return { amount: 0, applied: false };
}

/**
 * Calculate performance bonus amount
 * @param {number} basePay - Base pay amount
 * @param {number} efficiency - Efficiency value (0.0 to 2.0+)
 * @returns {Object} Bonus result
 */
function calculatePerformanceBonus(basePay, efficiency) {
  let amount = 0;
  const bonusDetails = [];
  
  // High performance bonus (>= 100%)
  if (bonuses.highPerformance.enabled && efficiency >= bonuses.highPerformance.minEfficiency) {
    const bonus = basePay * (efficiency - 1.0) * bonuses.highPerformance.multiplier;
    amount += bonus;
    bonusDetails.push({
      type: 'high_performance',
      amount: parseFloat(bonus.toFixed(settings.moneyDecimalPlaces)),
      description: bonuses.highPerformance.description,
      efficiency: efficiency
    });
  }
  // Good performance bonus (90-99%)
  else if (bonuses.goodPerformance.enabled && 
           efficiency >= bonuses.goodPerformance.minEfficiency && 
           efficiency <= bonuses.goodPerformance.maxEfficiency) {
    const bonus = basePay * (efficiency - bonuses.goodPerformance.minEfficiency) * bonuses.goodPerformance.multiplier;
    amount += bonus;
    bonusDetails.push({
      type: 'good_performance',
      amount: parseFloat(bonus.toFixed(settings.moneyDecimalPlaces)),
      description: bonuses.goodPerformance.description,
      efficiency: efficiency
    });
  }
  
  return {
    amount: parseFloat(amount.toFixed(settings.moneyDecimalPlaces)),
    applied: amount > 0,
    details: bonusDetails
  };
}

module.exports = {
  penalties,
  bonuses,
  anomalies,
  serviceTypeBudgets,
  settings,
  getServiceTypeBudget,
  checkEfficiencyAnomaly,
  calculateLatePenalty,
  calculateLongLunchPenalty,
  calculatePerformanceBonus
};

