/**
 * Validation Utilities
 * Clean Scapes P4P System - Mobile App
 * 
 * Provides validation functions for forms and user input
 */

/**
 * Validate email address
 * 
 * @param {string} email - Email address to validate
 * @returns {Object} Validation result with isValid and message
 */
export function validateEmail(email) {
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      message: 'Email is required',
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: 'Please enter a valid email address',
    };
  }

  return {
    isValid: true,
    message: '',
  };
}

/**
 * Validate required field
 * 
 * @param {*} value - Value to validate
 * @param {string} fieldName - Name of the field (for error message)
 * @returns {Object} Validation result
 */
export function validateRequired(value, fieldName = 'This field') {
  if (value === undefined || value === null || value === '') {
    return {
      isValid: false,
      message: `${fieldName} is required`,
    };
  }

  if (typeof value === 'string' && value.trim() === '') {
    return {
      isValid: false,
      message: `${fieldName} is required`,
    };
  }

  return {
    isValid: true,
    message: '',
  };
}

/**
 * Validate string length
 * 
 * @param {string} value - String to validate
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum length
 * @param {number} options.maxLength - Maximum length
 * @param {string} options.fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export function validateStringLength(value, options = {}) {
  const { minLength, maxLength, fieldName = 'This field' } = options;

  if (typeof value !== 'string') {
    return {
      isValid: false,
      message: `${fieldName} must be a string`,
    };
  }

  if (minLength !== undefined && value.length < minLength) {
    return {
      isValid: false,
      message: `${fieldName} must be at least ${minLength} characters`,
    };
  }

  if (maxLength !== undefined && value.length > maxLength) {
    return {
      isValid: false,
      message: `${fieldName} must be no more than ${maxLength} characters`,
    };
  }

  return {
    isValid: true,
    message: '',
  };
}

/**
 * Validate form data object
 * 
 * @param {Object} data - Form data to validate
 * @param {Object} rules - Validation rules object
 * @returns {Object} Validation result with isValid and errors
 */
export function validateForm(data, rules) {
  const errors = {};
  let isValid = true;

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];
    const fieldErrors = [];

    // Check required
    if (fieldRules.required) {
      const requiredCheck = validateRequired(value, fieldRules.fieldName || field);
      if (!requiredCheck.isValid) {
        fieldErrors.push(requiredCheck.message);
        isValid = false;
      }
    }

    // Skip other validations if field is empty and not required
    if ((value === undefined || value === null || value === '') && !fieldRules.required) {
      continue;
    }

    // Email validation
    if (fieldRules.email) {
      const emailCheck = validateEmail(value);
      if (!emailCheck.isValid) {
        fieldErrors.push(emailCheck.message);
        isValid = false;
      }
    }

    // String length validation
    if (fieldRules.string && (fieldRules.minLength !== undefined || fieldRules.maxLength !== undefined)) {
      const lengthCheck = validateStringLength(value, {
        minLength: fieldRules.minLength,
        maxLength: fieldRules.maxLength,
        fieldName: fieldRules.fieldName || field,
      });
      if (!lengthCheck.isValid) {
        fieldErrors.push(lengthCheck.message);
        isValid = false;
      }
    }

    // Custom validation function
    if (fieldRules.validate && typeof fieldRules.validate === 'function') {
      const customResult = fieldRules.validate(value, data);
      if (customResult !== true && customResult !== undefined) {
        fieldErrors.push(customResult);
        isValid = false;
      }
    }

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  }

  return {
    isValid,
    errors,
  };
}

