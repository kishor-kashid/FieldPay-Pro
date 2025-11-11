/**
 * User Service
 * Handles user CRUD operations, role management, and user data
 */

const { supabase } = require('../config/database');
const bcrypt = require('bcrypt');

/**
 * Get all users with optional filters
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Users
 */
async function getUsers(filters = {}) {
  const { role, crew_id, search } = filters;

  try {
    let query = supabase
      .from('users')
      .select('*')
      .order('name', { ascending: true });

    // Apply filters
    if (role) {
      query = query.eq('role', role);
    }

    if (crew_id) {
      query = query.eq('crew_id', crew_id);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,employee_id.ilike.%${search}%`);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return users || [];
  } catch (error) {
    console.error('Error in getUsers:', error);
    throw error;
  }
}

/**
 * Get a single user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User
 */
async function getUserById(userId) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return user;
  } catch (error) {
    console.error('Error in getUserById:', error);
    throw error;
  }
}

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<Object>} User
 */
async function getUserByEmail(email) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching user by email:', error);
      throw new Error(`Failed to fetch user by email: ${error.message}`);
    }

    return user;
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    throw error;
  }
}

/**
 * Get user by employee ID
 * @param {string} employeeId - Employee ID
 * @returns {Promise<Object>} User
 */
async function getUserByEmployeeId(employeeId) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('employee_id', employeeId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user by employee ID:', error);
      throw new Error(`Failed to fetch user by employee ID: ${error.message}`);
    }

    return user;
  } catch (error) {
    console.error('Error in getUserByEmployeeId:', error);
    throw error;
  }
}

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
async function createUser(userData) {
  const {
    email,
    name,
    role,
    employee_id,
    crew_id,
    preferred_language = 'en',
    base_rate
  } = userData;

  try {
    // Validate required fields
    if (!email || !name || !role) {
      throw new Error('Email, name, and role are required');
    }

    // Validate role
    const validRoles = ['admin', 'manager', 'foreman', 'crew_member'];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    // Check if email already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Check if employee_id already exists
    if (employee_id) {
      const existingEmployeeId = await getUserByEmployeeId(employee_id);
      if (existingEmployeeId) {
        throw new Error('User with this employee ID already exists');
      }
    }

    // Create user in database
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        email,
        name,
        role,
        employee_id,
        crew_id,
        preferred_language,
        base_rate
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }

    console.log(`✅ User created: ${user.email} (${user.role})`);
    return user;
  } catch (error) {
    console.error('Error in createUser:', error);
    throw error;
  }
}

/**
 * Update a user
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated user
 */
async function updateUser(userId, updateData) {
  try {
    // Validate role if provided
    if (updateData.role) {
      const validRoles = ['admin', 'manager', 'foreman', 'crew_member'];
      if (!validRoles.includes(updateData.role)) {
        throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
      }
    }

    // Check if email is being changed and if it already exists
    if (updateData.email) {
      const existingUser = await getUserByEmail(updateData.email);
      if (existingUser && existingUser.id !== userId) {
        throw new Error('User with this email already exists');
      }
    }

    // Check if employee_id is being changed and if it already exists
    if (updateData.employee_id) {
      const existingEmployeeId = await getUserByEmployeeId(updateData.employee_id);
      if (existingEmployeeId && existingEmployeeId.id !== userId) {
        throw new Error('User with this employee ID already exists');
      }
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }

    console.log(`✅ User updated: ${user.email}`);
    return user;
  } catch (error) {
    console.error('Error in updateUser:', error);
    throw error;
  }
}

/**
 * Delete a user (soft delete by setting inactive)
 * Note: This doesn't actually delete from database, just marks as inactive
 * In the current schema, we don't have an 'active' field, so this will actually delete
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteUser(userId) {
  try {
    // Check if user exists
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // For now, we'll actually delete the user
    // In production, you might want to add an 'active' field and set it to false instead
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }

    console.log(`✅ User deleted: ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error in deleteUser:', error);
    throw error;
  }
}

/**
 * Get users by role
 * @param {string} role - User role
 * @returns {Promise<Array>} Users
 */
async function getUsersByRole(role) {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching users by role:', error);
      throw new Error(`Failed to fetch users by role: ${error.message}`);
    }

    return users || [];
  } catch (error) {
    console.error('Error in getUsersByRole:', error);
    throw error;
  }
}

/**
 * Get users by crew
 * @param {string} crewId - Crew ID
 * @returns {Promise<Array>} Users
 */
async function getUsersByCrew(crewId) {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('crew_id', crewId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching users by crew:', error);
      throw new Error(`Failed to fetch users by crew: ${error.message}`);
    }

    return users || [];
  } catch (error) {
    console.error('Error in getUsersByCrew:', error);
    throw error;
  }
}

/**
 * Get user statistics
 * @returns {Promise<Object>} User statistics
 */
async function getUserStats() {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('role');

    if (error) {
      console.error('Error fetching user stats:', error);
      throw new Error(`Failed to fetch user stats: ${error.message}`);
    }

    // Calculate statistics
    const stats = {
      total_users: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      managers: users.filter(u => u.role === 'manager').length,
      foremen: users.filter(u => u.role === 'foreman').length,
      crew_members: users.filter(u => u.role === 'crew_member').length
    };

    return stats;
  } catch (error) {
    console.error('Error in getUserStats:', error);
    throw error;
  }
}

module.exports = {
  getUsers,
  getUserById,
  getUserByEmail,
  getUserByEmployeeId,
  createUser,
  updateUser,
  deleteUser,
  getUsersByRole,
  getUsersByCrew,
  getUserStats
};

