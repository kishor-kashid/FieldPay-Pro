/**
 * Notification Routes
 * API endpoints for managing in-app notifications
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications
} = require('../services/notificationService');

/**
 * GET /api/notifications
 * Get all notifications for the authenticated user
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { read, type, limit, offset } = req.query;

    const filters = {
      read: read !== undefined ? read === 'true' : undefined,
      type,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0
    };

    const notifications = await getNotifications(userId, filters);

    res.json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('Error in GET /notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
      message: error.message
    });
  }
});

/**
 * GET /api/notifications/unread
 * Get count of unread notifications for the authenticated user
 */
router.get('/unread', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const count = await getUnreadCount(userId);

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error in GET /notifications/unread:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unread count',
      message: error.message
    });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a notification as read
 */
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    const notification = await markAsRead(id, userId);

    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error in PATCH /notifications/:id/read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read',
      message: error.message
    });
  }
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for the authenticated user
 */
router.patch('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const count = await markAllAsRead(userId);

    res.json({
      success: true,
      count,
      message: `${count} notification(s) marked as read`
    });
  } catch (error) {
    console.error('Error in PATCH /notifications/read-all:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read',
      message: error.message
    });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a specific notification
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    await deleteNotification(id, userId);

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error in DELETE /notifications/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification',
      message: error.message
    });
  }
});

/**
 * DELETE /api/notifications/read
 * Delete all read notifications for the authenticated user
 */
router.delete('/read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const count = await deleteReadNotifications(userId);

    res.json({
      success: true,
      count,
      message: `${count} read notification(s) deleted`
    });
  } catch (error) {
    console.error('Error in DELETE /notifications/read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete read notifications',
      message: error.message
    });
  }
});

module.exports = router;

