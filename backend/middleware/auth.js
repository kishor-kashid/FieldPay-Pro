/**
 * Authentication Middleware
 * Clean Scapes P4P System
 * 
 * Verifies Firebase JWT tokens and extracts user information.
 */

const { verifyIdToken } = require('../config/firebase');
const { supabase } = require('../config/database');

/**
 * Middleware to verify Firebase ID token
 * Extracts user information and attaches to request object
 */
async function authenticateToken(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided. Please include Authorization: Bearer <token>'
      });
    }

    // Extract token
    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format'
      });
    }

    // Verify token with Firebase
    const decodedToken = await verifyIdToken(idToken);

    // Get user from database using email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', decodedToken.email)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'User not found in database'
      });
    }

    // Attach user information to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      ...user, // Include all database user fields
      customClaims: decodedToken // Include Firebase custom claims (role, etc.)
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
      details: error.message
    });
  }
}

/**
 * Optional authentication middleware
 * Doesn't fail if token is missing, but attaches user if token is valid
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await verifyIdToken(idToken);

      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', decodedToken.email)
        .single();

      if (user) {
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          ...user,
          customClaims: decodedToken
        };
      }
    }
    
    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
}

module.exports = {
  authenticateToken,
  optionalAuth
};

