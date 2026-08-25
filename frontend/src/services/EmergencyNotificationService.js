// ==========================================
// JanaoBangla — Emergency Notification Service (Frontend)
// BRANCH: feature-women-safety-sos-and-emergency-notifications
// Ei file ta notification-related sob API request handle korbe
// Fetch, mark read, delete — sob ekhane
// ==========================================

import { notificationApi } from './ApiService';

// ==========================================
// getNotifications — User er sob notifications fetch kora
// Notification list page ba dropdown e dekhate use hobe
// ==========================================
export async function getNotifications(limit = 20, offset = 0) {
  // Notifications fetch request pathano hocche
  const response = await notificationApi.getAll({ limit, offset });
  return response.data;
}

// ==========================================
// getUnreadCount — User er unread notification count
// Navbar badge number update korar jonno polling e use hobe
// ==========================================
export async function getUnreadCount() {
  // Unread count fetch request pathano hocche
  const response = await notificationApi.getUnreadCount();
  return response.data;
}

// ==========================================
// markAsRead — Specific notification read mark kora
// User notification click korle call hobe
// ==========================================
export async function markAsRead(notificationId) {
  // Mark read request pathano hocche
  const response = await notificationApi.markRead(notificationId);
  return response.data;
}

// ==========================================
// markAllAsRead — Sob notifications read mark kora
// "Mark all as read" button press korle call hobe
// ==========================================
export async function markAllAsRead() {
  // Mark all read request pathano hocche
  const response = await notificationApi.markAllRead();
  return response.data;
}

// ==========================================
// deleteNotification — Specific notification delete kora
// User notification dismiss korte chaile call hobe
// ==========================================
export async function deleteNotification(notificationId) {
  // Delete notification request pathano hocche
  const response = await notificationApi.delete(notificationId);
  return response.data;
}
