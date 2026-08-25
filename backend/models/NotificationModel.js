// ==========================================
// JanaoBangla — Notification Model
// BRANCH: feature-women-safety-sos-and-emergency-notifications
// Ei file ta notifications table er sob database operation handle korbe
// User ke system notification dekhano ar manage kora ekhane hobe
// ==========================================

const db = require('../config/DatabaseConnection');

const VALID_TYPES = new Set(['report_status_change', 'new_comment', 'comment_reply', 'report_confirmed', 'emergency_alert', 'announcement']);

// ==========================================
// create — Notun notification insert kora
// SOS trigger hoile, status change hoile ei function call hobe
// ==========================================
async function create({ userId, type, title, message, relatedId }) {
  // Safe type map to prevent ENUM truncation errors
  const safeType = VALID_TYPES.has(type) ? type : 'emergency_alert';

  // Notun notification insert kora hocche
  const [result] = await db.pool.query(
    `INSERT INTO notifications (user_id, type, title, message, related_id)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, safeType, title, message, relatedId || null]
  );
  return result.insertId;
}

// ==========================================
// getByUserId — User er sob notifications fetch kora
// Notification bell icon e list dekhate use hobe
// ==========================================
async function getByUserId(userId, limit = 20, offset = 0) {
  // User er notifications fetch kora hocche, latest age ashbe
  const [rows] = await db.pool.query(
    `SELECT id, user_id, type, title, message, is_read, related_id, created_at
     FROM notifications
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );
  return rows;
}

// ==========================================
// getUnreadCount — User er unread notification count
// Navbar e badge number dekhate use hobe
// ==========================================
async function getUnreadCount(userId) {
  // Unread notification count newa hocche
  const [rows] = await db.pool.query(
    `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`,
    [userId]
  );
  return rows[0].count;
}

// ==========================================
// markAsRead — Specific notification read mark kora
// User notification click korle ei function call hobe
// ==========================================
async function markAsRead(notificationId, userId) {
  // Notification read mark kora hocche, user_id check kore ownership verify kora hocche
  const [result] = await db.pool.query(
    `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
    [notificationId, userId]
  );
  return result.affectedRows;
}

// ==========================================
// markAllAsRead — User er sob notifications read mark kora
// "Mark all as read" button press korle call hobe
// ==========================================
async function markAllAsRead(userId) {
  // User er sob unread notifications read kora hocche
  const [result] = await db.pool.query(
    `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`,
    [userId]
  );
  return result.affectedRows;
}

// ==========================================
// deleteById — Specific notification delete kora
// User notification remove korte chaile call hobe
// ==========================================
async function deleteById(notificationId, userId) {
  // Notification delete kora hocche
  const [result] = await db.pool.query(
    `DELETE FROM notifications WHERE id = ? AND user_id = ?`,
    [notificationId, userId]
  );
  return result.affectedRows;
}

// ==========================================
// deleteOldNotifications — 30 diner purano notifications cleanup
// Background cleanup task e use hobe (optional cron)
// ==========================================
async function deleteOldNotifications(daysOld = 30) {
  // 30 diner beshi purano notifications delete kora hocche
  const [result] = await db.pool.query(
    `DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [daysOld]
  );
  return result.affectedRows;
}

module.exports = {
  create,
  getByUserId,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteById,
  deleteOldNotifications
};
