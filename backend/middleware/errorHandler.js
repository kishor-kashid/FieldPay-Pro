/**
 * Error Handler Middleware
 * Clean Scapes P4P System
 * 
 * Global error handling middleware that catches all errors,
 * formats error responses, and logs errors appropriately.
 */

/**
 * Global error handler middleware
 * Should be used as the last middleware in Express app
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function errorHandler(err, req, res, next) {
  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Determine status code
  let statusCode = err.status || err.statusCode || 500;
  
  // Determine error message
  let errorMessage = err.message || 'Internal server error';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorMessage = err.message || 'Validation error';
  } else if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorMessage = 'Authentication failed';
  } else if (err.code === '23505') {
    // PostgreSQL unique constraint violation
    statusCode = 409;
    errorMessage = 'Duplicate entry. This record already exists.';
  } else if (err.code === '23503') {
    // PostgreSQL foreign key constraint violation
    statusCode = 400;
    errorMessage = 'Invalid reference. Related record does not exist.';
  } else if (err.code === '23502') {
    // PostgreSQL not null constraint violation
    statusCode = 400;
    errorMessage = 'Required field is missing.';
  } else if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    statusCode = 503;
    errorMessage = 'Service unavailable. External service connection failed.';
  } else if (err.code === 'ETIMEDOUT') {
    statusCode = 504;
    errorMessage = 'Request timeout. Service took too long to respond.';
  }

  // Format error response
  const errorResponse = {
    success: false,
    error: errorMessage,
    ...(process.env.NODE_ENV === 'development' && {
      details: err.details || err.stack,
      code: err.code,
    }),
  };

  // Add error code if available
  if (err.code && err.code !== 'ENOTFOUND' && err.code !== 'ECONNREFUSED' && err.code !== 'ETIMEDOUT') {
    errorResponse.code = err.code;
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 * 
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped function
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Create custom error with status code
 * 
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code
 * @param {Object} details - Additional error details
 * @returns {Error} Custom error object
 */
function createError(message, statusCode = 500, code = null, details = null) {
  const error = new Error(message);
  error.status = statusCode;
  error.statusCode = statusCode;
  if (code) {
    error.code = code;
  }
  if (details) {
    error.details = details;
  }
  return error;
}

module.exports = {
  errorHandler,
  asyncHandler,
  createError,
};

