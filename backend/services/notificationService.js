/**
 * Notification Service
 * Handles creation, retrieval, and management of in-app notifications
 */

const { supabase } = require('../config/database');

/**
 * Create a notification for a user
 * @param {Object} data - Notification data
 * @returns {Promise<Object>} Created notification
 */
async function createNotification(data) {
  const { user_id, type, title, message, link = null } = data;

  try {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert([{
        user_id,
        type,
        title,
        message,
        link,
        read: false
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      throw new Error(`Failed to create notification: ${error.message}`);
    }

    return notification;
  } catch (error) {
    console.error('Error in createNotification:', error);
    throw error;
  }
}

/**
 * Create bulk notifications for multiple users
 * @param {Array} notifications - Array of notification objects
 * @returns {Promise<Array>} Created notifications
 */
async function createBulkNotifications(notifications) {
  try {
    const notificationData = notifications.map(n => ({
      user_id: n.user_id,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link || null,
      read: false
    }));

    const { data: createdNotifications, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select();

    if (error) {
      console.error('Error creating bulk notifications:', error);
      throw new Error(`Failed to create bulk notifications: ${error.message}`);
    }

    return createdNotifications || [];
  } catch (error) {
    console.error('Error in createBulkNotifications:', error);
    throw error;
  }
}

/**
 * Get notifications for a user
 * @param {string} userId - User ID
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} User notifications
 */
async function getNotifications(userId, filters = {}) {
  const { read, type, limit = 50, offset = 0 } = filters;

  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (read !== undefined) {
      query = query.eq('read', read);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }

    return notifications || [];
  } catch (error) {
    console.error('Error in getNotifications:', error);
    throw error;
  }
}

/**
 * Get unread notification count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Unread notification count
 */
async function getUnreadCount(userId) {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Error fetching unread count:', error);
      throw new Error(`Failed to fetch unread count: ${error.message}`);
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    throw error;
  }
}

/**
 * Mark a notification as read
 * @param {string} notificationId - Notification ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} Updated notification
 */
async function markAsRead(notificationId, userId) {
  try {
    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error marking notification as read:', error);
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }

    return notification;
  } catch (error) {
    console.error('Error in markAsRead:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of notifications marked as read
 */
async function markAllAsRead(userId) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
      .select();

    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error(`Failed to mark all notifications as read: ${error.message}`);
    }

    return data ? data.length : 0;
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    throw error;
  }
}

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<boolean>} Success status
 */
async function deleteNotification(notificationId, userId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting notification:', error);
      throw new Error(`Failed to delete notification: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    throw error;
  }
}

/**
 * Delete all read notifications for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of notifications deleted
 */
async function deleteReadNotifications(userId) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('read', true)
      .select();

    if (error) {
      console.error('Error deleting read notifications:', error);
      throw new Error(`Failed to delete read notifications: ${error.message}`);
    }

    return data ? data.length : 0;
  } catch (error) {
    console.error('Error in deleteReadNotifications:', error);
    throw error;
  }
}

/**
 * Cleanup old read notifications
 * @param {number} daysToKeep - Number of days to keep read notifications
 * @returns {Promise<number>} Number of deleted notifications
 */
async function cleanupOldNotifications(daysToKeep = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('read', true)
      .lt('created_at', cutoffDate.toISOString())
      .select();

    if (error) {
      console.error('Error cleaning up old notifications:', error);
      throw new Error(`Failed to cleanup old notifications: ${error.message}`);
    }

    return data ? data.length : 0;
  } catch (error) {
    console.error('Error in cleanupOldNotifications:', error);
    throw error;
  }
}

/**
 * Create payroll processing notifications for all roles
 * @param {Object} payrollData - Payroll processing results
 * @param {string} triggeredBy - User ID who triggered the processing
 * @returns {Promise<Array>} Created notifications
 */
async function createPayrollNotifications(payrollData, triggeredBy) {
  try {
    const { date, summary, results, errors } = payrollData;
    const notifications = [];

    // Get all users by role
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, role, employee_id, crew_id');

    if (usersError) {
      console.error('Error fetching users for notifications:', usersError);
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    // 1. Notifications for ADMINS (payroll ready for review, anomalies)
    const admins = users.filter(u => u.role === 'admin');
    for (const admin of admins) {
      if (admin.id === triggeredBy) continue; // Skip the user who triggered it

      let adminMessage = `Payroll processed for ${date}: ${summary.successful_calculations} records processed`;
      if (summary.anomalies_detected > 0) {
        adminMessage += `, ${summary.anomalies_detected} anomalies detected`;
      }
      if (summary.failed_calculations > 0) {
        adminMessage += `, ${summary.failed_calculations} errors`;
      }

      notifications.push({
        user_id: admin.id,
        type: summary.anomalies_detected > 0 || summary.failed_calculations > 0 ? 'warning' : 'info',
        title: 'Payroll Processing Complete',
        message: adminMessage,
        link: `/admin/payroll?date=${date}`
      });
    }

    // 2. Notifications for MANAGERS (daily summary)
    const managers = users.filter(u => u.role === 'manager');
    for (const manager of managers) {
      const managerMessage = `Daily payroll summary for ${date}: ${summary.total_employees} employees, $${summary.total_payout.toFixed(2)} total payout, ${(summary.average_efficiency_percentage || 0).toFixed(1)}% avg efficiency`;

      notifications.push({
        user_id: manager.id,
        type: 'info',
        title: 'Daily Payroll Summary',
        message: managerMessage,
        link: `/manager/reports?date=${date}`
      });
    }

    // 3. Notifications for FOREMEN (team results)
    const foremen = users.filter(u => u.role === 'foreman');
    for (const foreman of foremen) {
      // Get crew members for this foreman
      const crewMembers = results.filter(r => {
        const memberUser = users.find(u => u.employee_id === r.employee_id);
        return memberUser && memberUser.crew_id === foreman.crew_id;
      });

      if (crewMembers.length > 0) {
        const crewTotalPay = crewMembers.reduce((sum, m) => sum + m.total_pay, 0);
        const crewAvgEfficiency = crewMembers.reduce((sum, m, _, arr) => 
          sum + (m.efficiency || 0) / arr.length, 0
        );

        const foremanMessage = `Your team's results for ${date}: ${crewMembers.length} members, $${crewTotalPay.toFixed(2)} total, ${(crewAvgEfficiency * 100).toFixed(1)}% avg efficiency`;

        notifications.push({
          user_id: foreman.id,
          type: 'info',
          title: 'Team Payroll Results',
          message: foremanMessage,
          link: `/foreman/team?date=${date}`
        });
      }
    }

    // 4. Notifications for CREW MEMBERS (personal scores)
    const crewMembers = users.filter(u => u.role === 'crew_member');
    for (const crewMember of crewMembers) {
      // Find this crew member's payroll result
      const memberResult = results.find(r => r.employee_id === crewMember.employee_id);

      if (memberResult) {
        const efficiencyPercent = memberResult.efficiency 
          ? (memberResult.efficiency * 100).toFixed(1) 
          : 'N/A';
        
        const bonusText = memberResult.performance_bonus > 0 
          ? ` +$${memberResult.performance_bonus.toFixed(2)} bonus` 
          : '';
        
        const penaltyText = memberResult.total_penalties > 0 
          ? ` -$${memberResult.total_penalties.toFixed(2)} penalties` 
          : '';

        const crewMessage = `Your results for ${date}: $${memberResult.total_pay.toFixed(2)} total pay, ${efficiencyPercent}% efficiency${bonusText}${penaltyText}`;

        notifications.push({
          user_id: crewMember.id,
          type: memberResult.has_anomalies ? 'warning' : 'success',
          title: 'Your Daily Performance',
          message: crewMessage,
          link: `/dashboard?date=${date}`
        });
      }
    }

    // Create all notifications in bulk
    if (notifications.length > 0) {
      const createdNotifications = await createBulkNotifications(notifications);
      console.log(`📬 Created ${createdNotifications.length} payroll notifications`);
      return createdNotifications;
    }

    return [];
  } catch (error) {
    console.error('Error creating payroll notifications:', error);
    // Don't throw - notifications are not critical
    return [];
  }
}

/**
 * Create error notification for admins
 * @param {string} errorMessage - Error message
 * @param {Object} context - Additional context
 * @returns {Promise<Array>} Created notifications
 */
async function createErrorNotification(errorMessage, context = {}) {
  try {
    // Get all admins
    const { data: admins, error: adminsError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin');

    if (adminsError) {
      console.error('Error fetching admins for error notification:', adminsError);
      return [];
    }

    const notifications = admins.map(admin => ({
      user_id: admin.id,
      type: 'error',
      title: 'Payroll Processing Error',
      message: errorMessage,
      link: context.link || '/admin/executions'
    }));

    if (notifications.length > 0) {
      return await createBulkNotifications(notifications);
    }

    return [];
  } catch (error) {
    console.error('Error creating error notification:', error);
    return [];
  }
}

module.exports = {
  createNotification,
  createBulkNotifications,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  cleanupOldNotifications,
  createPayrollNotifications,
  createErrorNotification
};

