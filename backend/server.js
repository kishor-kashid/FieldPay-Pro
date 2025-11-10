/**
 * Clean Scapes P4P System - Backend Server
 * Express.js API server for Pay-for-Performance system
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes will be added here
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/payroll', require('./routes/payroll'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/notifications', require('./routes/notifications'));
// app.use('/api/upload', require('./routes/upload'));

// Mock API routes (development only)
if (process.env.USE_MOCK === 'true') {
  // app.use('/mock/service-autopilot', require('./routes/mock/serviceAutopilot'));
  // app.use('/mock/paychex', require('./routes/mock/paychex'));
}

// Error handling middleware (will be implemented in PR #22)
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
    error: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 Mock APIs: ${process.env.USE_MOCK === 'true' ? 'Enabled' : 'Disabled'}`);
});

module.exports = app;

