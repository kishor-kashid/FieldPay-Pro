/**
 * Role-Based Access Control Middleware
 * Clean Scapes P4P System
 * 
 * Checks user roles and permissions for route protection.
 */

/**
 * Middleware factory to check if user has required role(s)
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 * @returns {Function} Express middleware function
 */
function requireRole(allowedRoles) {
  // Normalize to array
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    // Ensure user is authenticated first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Get user role from custom claims (Firebase) or database
    const userRole = req.user.customClaims?.role || req.user.role;

    if (!userRole) {
      return res.status(403).json({
        success: false,
        error: 'User role not found'
      });
    }

    // Check if user has required role
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${userRole}`
      });
    }

    next();
  };
}

/**
 * Middleware to check if user is admin
 */
const requireAdmin = requireRole('admin');

/**
 * Middleware to check if user is admin or manager
 */
const requireAdminOrManager = requireRole(['admin', 'manager']);

/**
 * Middleware to check if user is admin, manager, or foreman
 */
const requireAdminManagerOrForeman = requireRole(['admin', 'manager', 'foreman']);

/**
 * Middleware to check if user is crew member
 */
const requireCrewMember = requireRole('crew_member');

/**
 * Middleware to check if user belongs to specific crew
 * @param {string} crewId - Required crew ID
 */
function requireCrew(crewId) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userCrewId = req.user.crew_id || req.user.customClaims?.crew_id;

    if (!userCrewId) {
      return res.status(403).json({
        success: false,
        error: 'User crew assignment not found'
      });
    }

    if (userCrewId !== crewId) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required crew: ${crewId}. Your crew: ${userCrewId}`
      });
    }

    next();
  };
}

/**
 * Middleware to check if user can access their own data or is admin
 */
function requireOwnDataOrAdmin(userIdParam = 'userId') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userRole = req.user.customClaims?.role || req.user.role;
    const requestedUserId = req.params[userIdParam] || req.body.userId || req.query.userId;
    const currentUserId = req.user.id || req.user.employee_id;

    // Admin can access any user's data
    if (userRole === 'admin') {
      return next();
    }

    // User can only access their own data
    if (currentUserId && requestedUserId && currentUserId.toString() === requestedUserId.toString()) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Access denied. You can only access your own data.'
    });
  };
}

module.exports = {
  requireRole,
  requireAdmin,
  requireAdminOrManager,
  requireAdminManagerOrForeman,
  requireCrewMember,
  requireCrew,
  requireOwnDataOrAdmin
};

