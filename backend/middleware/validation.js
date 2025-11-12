/**
 * Validation Middleware
 * Clean Scapes P4P System
 * 
 * Request validation middleware for validating request bodies,
 * query parameters, and route parameters.
 */

const { createError } = require('./errorHandler');

/**
 * Validate request body against schema
 * 
 * @param {Object} schema - Validation schema with field rules
 * @returns {Function} Express middleware function
 */
function validateBody(schema) {
  return (req, res, next) => {
    const errors = [];
    const body = req.body || {};

    // Check each field in schema
    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];

      // Check required fields
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field,
          message: `${field} is required`,
        });
        continue;
      }

      // Skip validation if field is optional and not provided
      if (!rules.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Type validation
      if (rules.type) {
        const typeCheck = validateType(value, rules.type);
        if (!typeCheck.valid) {
          errors.push({
            field,
            message: `${field} must be of type ${rules.type}. ${typeCheck.message || ''}`,
          });
          continue;
        }
      }

      // String validations
      if (rules.type === 'string' || typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push({
            field,
            message: `${field} must be at least ${rules.minLength} characters`,
          });
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push({
            field,
            message: `${field} must be no more than ${rules.maxLength} characters`,
          });
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push({
            field,
            message: `${field} format is invalid`,
          });
        }
      }

      // Number validations
      if (rules.type === 'number' || typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          errors.push({
            field,
            message: `${field} must be at least ${rules.min}`,
          });
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push({
            field,
            message: `${field} must be no more than ${rules.max}`,
          });
        }
      }

      // Array validations
      if (rules.type === 'array' || Array.isArray(value)) {
        if (rules.minItems && value.length < rules.minItems) {
          errors.push({
            field,
            message: `${field} must have at least ${rules.minItems} items`,
          });
        }
        if (rules.maxItems && value.length > rules.maxItems) {
          errors.push({
            field,
            message: `${field} must have no more than ${rules.maxItems} items`,
          });
        }
      }

      // Custom validation function
      if (rules.validate && typeof rules.validate === 'function') {
        const customResult = rules.validate(value);
        if (customResult !== true) {
          errors.push({
            field,
            message: customResult || `${field} validation failed`,
          });
        }
      }
    }

    if (errors.length > 0) {
      return next(createError('Validation failed', 400, 'VALIDATION_ERROR', { errors }));
    }

    next();
  };
}

/**
 * Validate query parameters
 * 
 * @param {Object} schema - Validation schema
 * @returns {Function} Express middleware function
 */
function validateQuery(schema) {
  return (req, res, next) => {
    const errors = [];
    const query = req.query || {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = query[field];

      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field,
          message: `Query parameter ${field} is required`,
        });
        continue;
      }

      if (!rules.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      if (rules.type) {
        const typeCheck = validateType(value, rules.type);
        if (!typeCheck.valid) {
          errors.push({
            field,
            message: `Query parameter ${field} must be of type ${rules.type}`,
          });
        }
      }
    }

    if (errors.length > 0) {
      return next(createError('Query validation failed', 400, 'VALIDATION_ERROR', { errors }));
    }

    next();
  };
}

/**
 * Validate route parameters
 * 
 * @param {Object} schema - Validation schema
 * @returns {Function} Express middleware function
 */
function validateParams(schema) {
  return (req, res, next) => {
    const errors = [];
    const params = req.params || {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = params[field];

      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field,
          message: `Route parameter ${field} is required`,
        });
        continue;
      }

      if (rules.type) {
        const typeCheck = validateType(value, rules.type);
        if (!typeCheck.valid) {
          errors.push({
            field,
            message: `Route parameter ${field} must be of type ${rules.type}`,
          });
        }
      }
    }

    if (errors.length > 0) {
      return next(createError('Parameter validation failed', 400, 'VALIDATION_ERROR', { errors }));
    }

    next();
  };
}

/**
 * Validate data type
 * 
 * @param {*} value - Value to validate
 * @param {string} type - Expected type
 * @returns {Object} Validation result
 */
function validateType(value, type) {
  switch (type) {
    case 'string':
      return { valid: typeof value === 'string', message: 'Expected string' };
    case 'number':
      return { valid: typeof value === 'number' && !isNaN(value), message: 'Expected number' };
    case 'boolean':
      return { valid: typeof value === 'boolean', message: 'Expected boolean' };
    case 'array':
      return { valid: Array.isArray(value), message: 'Expected array' };
    case 'object':
      return { valid: typeof value === 'object' && value !== null && !Array.isArray(value), message: 'Expected object' };
    case 'date':
      return { valid: !isNaN(Date.parse(value)), message: 'Expected valid date' };
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return { valid: typeof value === 'string' && emailRegex.test(value), message: 'Expected valid email address' };
    case 'uuid':
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return { valid: typeof value === 'string' && uuidRegex.test(value), message: 'Expected valid UUID' };
    default:
      return { valid: true, message: '' };
  }
}

/**
 * Common validation schemas
 */
const schemas = {
  date: {
    type: 'date',
    required: true,
  },
  email: {
    type: 'email',
    required: true,
  },
  uuid: {
    type: 'uuid',
    required: true,
  },
  role: {
    type: 'string',
    required: true,
    validate: (value) => {
      const validRoles = ['admin', 'manager', 'foreman', 'crew_member'];
      return validRoles.includes(value) || `Role must be one of: ${validRoles.join(', ')}`;
    },
  },
  language: {
    type: 'string',
    required: true,
    validate: (value) => {
      const validLanguages = ['en', 'es'];
      return validLanguages.includes(value) || `Language must be one of: ${validLanguages.join(', ')}`;
    },
  },
};

module.exports = {
  validateBody,
  validateQuery,
  validateParams,
  validateType,
  schemas,
};

