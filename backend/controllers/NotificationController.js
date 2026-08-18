// ==========================================
// JanaoBangla — Notification Controller
// BRANCH: feature-women-safety-sos-and-emergency-notifications
// Ei controller ta user er system notifications handle korbe
// Fetch, mark read, mark all read, delete — sob ekhane
// ==========================================

const NotificationModel = require('../models/NotificationModel');

// ==========================================
// getNotifications — User er sob notifications list kora
// GET /api/notifications
// ==========================================
async function getNotifications(req, res) {
  try {
    // Logged-in user er ID JWT theke newa hocche
    const userId = req.user.id;
    const limit  = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = parseInt(req.query.offset) || 0;

    // User er notifications ar unread count fetch kora hocche
    const [notifications, unreadCount] = await Promise.all([
      NotificationModel.getByUserId(userId, limit, offset),
      NotificationModel.getUnreadCount(userId)
    ]);

    res.json({
      success: true,
      message: 'Notifications fetched successfully',
      data: {
        notifications,
        unreadCount,
        total: notifications.length,
        limit,
        offset
      }
    });

  } catch (error) {
    // Fetch fail hoile error pathano hocche
    console.error('getNotifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
}

// ==========================================
// markAsRead — Specific notification read mark kora
// PUT /api/notifications/:id/read
// ==========================================
async function markAsRead(req, res) {
  try {
    // Notification ID URL theke ar user ID JWT theke newa hocche
    const notificationId = parseInt(req.params.id);
    const userId         = req.user.id;

    // Notification ID valid kina check kora hocche
    if (!notificationId || isNaN(notificationId)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID' });
    }

    // Notification read mark kora hocche
    const affected = await NotificationModel.markAsRead(notificationId, userId);

    if (affected === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notificationId }
    });

  } catch (error) {
    // Mark read fail hoile error pathano hocche
    console.error('markAsRead error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
  }
}

// ==========================================
// markAllAsRead — User er sob notifications read mark kora
// PUT /api/notifications/read-all
// ==========================================
async function markAllAsRead(req, res) {
  try {
    // Logged-in user er ID JWT theke newa hocche
    const userId = req.user.id;

    // User er sob unread notifications read kora hocche
    const count = await NotificationModel.markAllAsRead(userId);

    res.json({
      success: true,
      message: `${count} notifications marked as read`,
      data: { updatedCount: count }
    });

  } catch (error) {
    // Mark all fail hoile error pathano hocche
    console.error('markAllAsRead error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notifications as read' });
  }
}

// ==========================================
// deleteNotification — Specific notification delete kora
// DELETE /api/notifications/:id
// ==========================================
async function deleteNotification(req, res) {
  try {
    // Notification ID URL theke ar user ID JWT theke newa hocche
    const notificationId = parseInt(req.params.id);
    const userId         = req.user.id;

    // Notification ID valid kina check kora hocche
    if (!notificationId || isNaN(notificationId)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID' });
    }

    // Notification delete kora hocche
    const affected = await NotificationModel.deleteById(notificationId, userId);

    if (affected === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully',
      data: { deletedId: notificationId }
    });

  } catch (error) {
    // Delete fail hoile error pathano hocche
    console.error('deleteNotification error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
}

// ==========================================
// getUnreadCount — User er unread notification count only
// GET /api/notifications/unread-count
// Navbar badge update korar jonno polling e use hobe
// ==========================================
async function getUnreadCount(req, res) {
  try {
    // Logged-in user er ID JWT theke newa hocche
    const userId = req.user.id;

    // Unread count only fetch kora hocche (efficient query)
    const count = await NotificationModel.getUnreadCount(userId);

    res.json({
      success: true,
      data: { unreadCount: count }
    });

  } catch (error) {
    // Count fetch fail hoile error pathano hocche
    console.error('getUnreadCount error:', error);
    res.status(500).json({ success: false, message: 'Failed to get unread count' });
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
};
