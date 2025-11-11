/**
 * Validation Utilities
 * Clean Scapes P4P System - Web Frontend
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
 * Validate number range
 * 
 * @param {number} value - Number to validate
 * @param {Object} options - Validation options
 * @param {number} options.min - Minimum value
 * @param {number} options.max - Maximum value
 * @param {string} options.fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export function validateNumberRange(value, options = {}) {
  const { min, max, fieldName = 'This field' } = options;

  // Check if value is a number
  if (typeof value !== 'number' || isNaN(value)) {
    return {
      isValid: false,
      message: `${fieldName} must be a valid number`,
    };
  }

  if (min !== undefined && value < min) {
    return {
      isValid: false,
      message: `${fieldName} must be at least ${min}`,
    };
  }

  if (max !== undefined && value > max) {
    return {
      isValid: false,
      message: `${fieldName} must be no more than ${max}`,
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
 * Validate date
 * 
 * @param {string|Date} date - Date to validate
 * @param {Object} options - Validation options
 * @param {Date} options.minDate - Minimum date
 * @param {Date} options.maxDate - Maximum date
 * @param {string} options.fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export function validateDate(date, options = {}) {
  const { minDate, maxDate, fieldName = 'This field' } = options;

  if (!date) {
    return {
      isValid: false,
      message: `${fieldName} is required`,
    };
  }

  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return {
      isValid: false,
      message: `${fieldName} must be a valid date`,
    };
  }

  if (minDate && dateObj < minDate) {
    return {
      isValid: false,
      message: `${fieldName} must be on or after ${minDate.toLocaleDateString()}`,
    };
  }

  if (maxDate && dateObj > maxDate) {
    return {
      isValid: false,
      message: `${fieldName} must be on or before ${maxDate.toLocaleDateString()}`,
    };
  }

  return {
    isValid: true,
    message: '',
  };
}

/**
 * Validate phone number (basic validation)
 * 
 * @param {string} phone - Phone number to validate
 * @returns {Object} Validation result
 */
export function validatePhone(phone) {
  if (!phone || phone.trim() === '') {
    return {
      isValid: false,
      message: 'Phone number is required',
    };
  }

  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check if it's a valid phone number (10 digits for US)
  const phoneRegex = /^\+?[\d]{10,15}$/;
  if (!phoneRegex.test(cleaned)) {
    return {
      isValid: false,
      message: 'Please enter a valid phone number',
    };
  }

  return {
    isValid: true,
    message: '',
  };
}

/**
 * Validate password strength
 * 
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum length (default: 8)
 * @returns {Object} Validation result
 */
export function validatePassword(password, options = {}) {
  const { minLength = 8 } = options;

  if (!password || password.trim() === '') {
    return {
      isValid: false,
      message: 'Password is required',
    };
  }

  if (password.length < minLength) {
    return {
      isValid: false,
      message: `Password must be at least ${minLength} characters`,
    };
  }

  // Optional: Add more password strength checks
  // const hasUpperCase = /[A-Z]/.test(password);
  // const hasLowerCase = /[a-z]/.test(password);
  // const hasNumber = /\d/.test(password);
  // const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

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

    // Number range validation
    if (fieldRules.number && (fieldRules.min !== undefined || fieldRules.max !== undefined)) {
      const numberCheck = validateNumberRange(value, {
        min: fieldRules.min,
        max: fieldRules.max,
        fieldName: fieldRules.fieldName || field,
      });
      if (!numberCheck.isValid) {
        fieldErrors.push(numberCheck.message);
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

    // Date validation
    if (fieldRules.date) {
      const dateCheck = validateDate(value, {
        minDate: fieldRules.minDate,
        maxDate: fieldRules.maxDate,
        fieldName: fieldRules.fieldName || field,
      });
      if (!dateCheck.isValid) {
        fieldErrors.push(dateCheck.message);
        isValid = false;
      }
    }

    // Phone validation
    if (fieldRules.phone) {
      const phoneCheck = validatePhone(value);
      if (!phoneCheck.isValid) {
        fieldErrors.push(phoneCheck.message);
        isValid = false;
      }
    }

    // Password validation
    if (fieldRules.password) {
      const passwordCheck = validatePassword(value, {
        minLength: fieldRules.minLength,
      });
      if (!passwordCheck.isValid) {
        fieldErrors.push(passwordCheck.message);
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

