/**
 * Firebase Cloud Functions Entry Point
 * Clean Scapes P4P System
 * 
 * This file exports the Express app as a Firebase Cloud Function.
 * All API routes are accessible via the 'api' function.
 */

const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

// Load environment variables (for local testing only, ignore errors in Cloud Functions)
try {
  require('dotenv').config({ path: '.env.local' });
} catch (error) {
  // Ignore dotenv errors in Cloud Functions environment
}

const app = express();

// Middleware
app.use(cors({ origin: true })); // Allow all origins in Cloud Functions
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'FieldPay Pro API - Firebase Cloud Functions',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    platform: 'Firebase Cloud Functions',
    routes: [
      'GET  / - This health check',
      'POST /auth/login',
      'GET  /auth/profile',
      'GET  /payroll/records',
      'GET  /notifications',
      'GET  /users',
      'POST /upload/service-autopilot',
      'POST /upload/paychex'
    ]
  });
});

// Legacy health check for compatibility
app.get('/health', (req, res) => {
  res.json({
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    platform: 'Firebase Cloud Functions'
  });
});

// API routes (no /api prefix - the Cloud Function URL already includes it)
app.use('/auth', require('./routes/auth'));
app.use('/payroll', require('./routes/payroll'));
app.use('/notifications', require('./routes/notifications'));
app.use('/users', require('./routes/users'));
app.use('/upload', require('./routes/upload'));

// Mock API routes (development only)
if (process.env.USE_MOCK === 'true') {
  app.use('/mock/service-autopilot', require('./routes/mock/serviceAutopilot'));
  app.use('/mock/paychex', require('./routes/mock/paychex'));
  console.log('🎭 Mock API routes registered');
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path
  });
});

// Export Express app as Cloud Function
// Access via: https://REGION-PROJECT_ID.cloudfunctions.net/api
exports.api = functions.https.onRequest(app);

// For local testing, export the app
module.exports.app = app;

