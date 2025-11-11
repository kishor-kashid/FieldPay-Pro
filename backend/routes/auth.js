/**
 * Authentication Routes
 * Clean Scapes P4P System
 * 
 * Handles user authentication, profile, and language preferences.
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

/**
 * POST /api/auth/login
 * Login endpoint (handled by Firebase client SDK)
 * This endpoint is mainly for documentation - actual login happens client-side
 */
router.post('/login', async (req, res) => {
  try {
    // Note: Firebase Authentication is handled client-side
    // This endpoint can be used for additional server-side logic if needed
    // The client should send the Firebase ID token after successful login
    
    res.json({
      success: true,
      message: 'Please use Firebase client SDK for login. Send the ID token to protected endpoints.',
      instructions: 'After Firebase login, include the ID token in Authorization header: Bearer <token>'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout endpoint (handled by Firebase client SDK)
 * This endpoint can be used for server-side cleanup if needed
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Logout is handled client-side by Firebase
    // This endpoint can be used for server-side session cleanup if needed
    
    res.json({
      success: true,
      message: 'Logout successful (client-side). Server-side cleanup completed if needed.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/auth/profile
 * Get current user profile
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // User is already attached to req by authenticateToken middleware
    const user = req.user;

    // Remove sensitive information
    const { id, email, role, name, employee_id, crew_id, preferred_language, base_rate, created_at, updated_at } = user;

    res.json({
      success: true,
      user: {
        id,
        email,
        role,
        name,
        employee_id,
        crew_id,
        preferred_language,
        base_rate,
        created_at,
        updated_at
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/auth/language
 * Update user's preferred language
 * Users can only update their own language preference
 */
router.patch('/language', authenticateToken, async (req, res) => {
  try {
    const { preferred_language } = req.body;

    // Validate language
    if (!preferred_language || !['en', 'es'].includes(preferred_language)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid language. Must be "en" or "es"'
      });
    }

    // Update user language in database
    const { data, error } = await supabase
      .from('users')
      .update({ preferred_language })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update custom claims in Firebase (optional, for consistency)
    try {
      const { setCustomClaims } = require('../config/firebase');
      await setCustomClaims(req.user.uid, {
        role: req.user.role,
        employee_id: req.user.employee_id,
        crew_id: req.user.crew_id,
        preferred_language: preferred_language
      });
    } catch (firebaseError) {
      // Log but don't fail if Firebase update fails
      console.warn('Failed to update Firebase custom claims:', firebaseError);
    }

    res.json({
      success: true,
      message: 'Language preference updated',
      user: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/auth/verify
 * Verify token and return user info
 * Useful for checking if token is still valid
 */
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      valid: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        name: req.user.name
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      valid: false,
      error: error.message
    });
  }
});

module.exports = router;

