/**
 * User Routes
 * API endpoints for user management (CRUD operations)
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin, requireAdminOrManager, requireAdminManagerOrForeman, requireRole } = require('../middleware/roleCheck');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats
} = require('../services/userService');

/**
 * GET /api/users
 * Get all users (with optional filters)
 * Admin, Manager, and Foreman (foremen can only see their own crew)
 */
router.get('/', authenticateToken, requireAdminManagerOrForeman, async (req, res, next) => {
  try {
    const userRole = req.user.customClaims?.role || req.user.role;
    let { role, crew_id, search } = req.query;
    
    // Foremen can only see their own crew members
    if (userRole === 'foreman') {
      const foremanCrewId = req.user.crew_id || req.user.customClaims?.crew_id;
      if (foremanCrewId) {
        // Override crew_id filter to only show foreman's crew
        crew_id = foremanCrewId;
      }
    }

    const filters = {
      role,
      crew_id,
      search
    };

    const users = await getUsers(filters);

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error in GET /users:', error);
    next(error);
  }
});

/**
 * GET /api/users/stats
 * Get user statistics
 * Admin and Manager only
 */
router.get('/stats', authenticateToken, requireAdminOrManager, async (req, res, next) => {
  try {
    const stats = await getUserStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error in GET /users/stats:', error);
    next(error);
  }
});

/**
 * GET /api/users/:id
 * Get single user by ID
 * Admin can view any user, others can only view themselves
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user.uid;
    const requestingUserRole = req.user.role;

    // Check permissions: admin can view anyone, others can only view themselves
    if (requestingUserRole !== 'admin' && id !== requestingUserId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only view your own profile'
      });
    }

    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error in GET /users/:id:', error);
    next(error);
  }
});

/**
 * POST /api/users
 * Create a new user
 * Admin only
 */
router.post('/', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const {
      email,
      name,
      role,
      employee_id,
      crew_id,
      preferred_language,
      base_rate
    } = req.body;

    // Validate required fields
    if (!email || !name || !role) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Email, name, and role are required'
      });
    }

    const userData = {
      email,
      name,
      role,
      employee_id,
      crew_id,
      preferred_language,
      base_rate
    };

    const user = await createUser(userData);

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error in POST /users:', error);
    
    // Handle specific errors
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: error.message
      });
    }

    if (error.message.includes('Invalid role')) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message
      });
    }

    next(error);
  }
});

/**
 * PATCH /api/users/:id
 * Update a user
 * Admin can update anyone, users can update their own profile (limited fields)
 */
router.patch('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user.uid;
    const requestingUserRole = req.user.role;

    // Check permissions
    const isAdmin = requestingUserRole === 'admin';
    const isOwnProfile = id === requestingUserId;

    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only update your own profile'
      });
    }

    // Non-admins can only update certain fields
    const allowedFields = isAdmin
      ? ['name', 'email', 'role', 'employee_id', 'crew_id', 'preferred_language', 'base_rate']
      : ['name', 'preferred_language'];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'No valid fields to update'
      });
    }

    const user = await updateUser(id, updateData);

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error in PATCH /users/:id:', error);

    // Handle specific errors
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: error.message
      });
    }

    if (error.message.includes('Invalid role')) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message
      });
    }

    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: error.message
      });
    }

    next(error);
  }
});

/**
 * DELETE /api/users/:id
 * Delete (deactivate) a user
 * Admin only
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user.uid;

    // Prevent admins from deleting themselves
    if (id === requestingUserId) {
      return res.status(400).json({
        success: false,
        error: 'Bad request',
        message: 'You cannot delete your own account'
      });
    }

    await deleteUser(id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /users/:id:', error);

    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: error.message
      });
    }

    next(error);
  }
});

module.exports = router;

