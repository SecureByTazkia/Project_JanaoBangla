// ==========================================
// JanaoBangla — Admin Dashboard Model
// BRANCH: feature-admin-dashboard-and-system-monitoring
// Actual database schema onujayi sob admin queries ekhane ache
// reports table: locations table e report_id ache (l.report_id = r.id)
// comments table: moderation er jonno is_removed column ache
// ==========================================

const db = require('../services/DatabaseService');

class AdminDashboardModel {

  // Ei function ta admin dashboard overview stats (users, reports, comments, sos) fetch kore
  static async getSystemStats() {
    // Users table theke total, admin, verified ar active count niye ashe
    const [userStats] = await db.query(
      `SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as total_admins,
        SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) as verified_users,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_users
       FROM users`
    );

    // Reports table theke status breakdown summary fetch kore
    const [reportStats] = await db.query(
      `SELECT 
        COUNT(*) as total_reports,
        SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as pending_reports,
        SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as review_reports,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_reports,
        SUM(CASE WHEN status = 'solved' THEN 1 ELSE 0 END) as solved_reports,
        SUM(CASE WHEN visibility = 'private' THEN 1 ELSE 0 END) as private_reports,
        SUM(CASE WHEN is_duplicate = 1 THEN 1 ELSE 0 END) as duplicate_reports
       FROM reports`
    );

    // Comments table theke total ar removed count niye ashe (actual schema onujayi is_removed)
    const [commentStats] = await db.query(
      `SELECT 
        COUNT(*) as total_comments,
        SUM(CASE WHEN is_removed = 1 THEN 1 ELSE 0 END) as removed_comments
       FROM comments`
    );

    // Emergency requests table theke active, resolved ar cancelled count niye ashe
    const [sosStats] = await db.query(
      `SELECT 
        COUNT(*) as total_sos,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_sos,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_sos,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_sos
       FROM emergency_requests`
    );

    // Reports category distribution group by kore fetch kore
    const categoryStats = await db.query(
      `SELECT category, COUNT(*) as count 
       FROM reports 
       GROUP BY category`
    );

    return {
      users: userStats || {},
      reports: reportStats || {},
      comments: commentStats || {},
      sos: sosStats || {},
      categories: categoryStats || []
    };
  }

  // Ei function ta registered users list pagination ar search filter shohokare database theke niye ashe
  static async getUsersList(page = 1, limit = 10, search = '') {
    const safeLimit = Math.max(1, parseInt(limit) || 10);
    const safeOffset = Math.max(0, (Math.max(1, parseInt(page) || 1) - 1) * safeLimit);

    let query = `SELECT id, name, email, phone_number, role, is_verified, is_active, profile_picture, created_at FROM users`;
    let countQuery = `SELECT COUNT(*) as total FROM users`;
    const params = [];
    const countParams = [];

    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      const whereClause = ` WHERE name LIKE ? OR email LIKE ? OR phone_number LIKE ?`;
      query += whereClause;
      countQuery += whereClause;
      params.push(searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    // LIMIT ar OFFSET sanitized integer hisebe query te direct inject kora hoyeche binary execute compatibility jonno
    query += ` ORDER BY created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;

    const users = await db.query(query, params);
    const countResult = await db.query(countQuery, countParams);
    const total = countResult[0] ? countResult[0].total : 0;

    return { users, total, page: parseInt(page) || 1, limit: safeLimit };
  }

  // Ei function ta user role change kore (citizen <-> admin)
  static async updateUserRole(userId, newRole) {
    return await db.update(
      `UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?`,
      [newRole, userId]
    );
  }

  // Ei function ta user account activate ba deactivate kore
  static async updateUserStatus(userId, isActive) {
    return await db.update(
      `UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?`,
      [isActive ? 1 : 0, userId]
    );
  }

  // Ei function ta reports list locations table er sathe JOIN kore fetch kore (l.report_id = r.id)
  static async getAllReportsForAdmin(page = 1, limit = 10, status = '', category = '') {
    const safeLimit = Math.max(1, parseInt(limit) || 10);
    const safeOffset = Math.max(0, (Math.max(1, parseInt(page) || 1) - 1) * safeLimit);

    let query = `SELECT r.*, l.latitude, l.longitude, l.address, u.name as reporter_name, u.email as reporter_email 
                 FROM reports r
                 LEFT JOIN locations l ON l.report_id = r.id
                 JOIN users u ON r.user_id = u.id`;
    let countQuery = `SELECT COUNT(*) as total FROM reports r`;
    const conditions = [];
    const params = [];

    if (status && status !== 'all') {
      conditions.push(`r.status = ?`);
      params.push(status);
    }
    if (category && category !== 'all') {
      conditions.push(`r.category = ?`);
      params.push(category);
    }

    if (conditions.length > 0) {
      const whereClause = ` WHERE ` + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    // LIMIT ar OFFSET sanitized integer hisebe query te direct inject kora hoyeche
    query += ` ORDER BY r.created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;

    const reports = await db.query(query, params);
    const countResult = await db.query(countQuery, params);
    const total = countResult[0] ? countResult[0].total : 0;

    return { reports, total, page: parseInt(page) || 1, limit: safeLimit };
  }

  // Ei function ta report er status update kore (submitted, under_review, processing, solved)
  static async updateReportStatus(reportId, newStatus) {
    return await db.update(
      `UPDATE reports SET status = ?, updated_at = NOW() WHERE id = ?`,
      [newStatus, reportId]
    );
  }

  // Ei function ta report delete kore
  static async deleteReport(reportId) {
    return await db.query(`DELETE FROM reports WHERE id = ?`, [reportId]);
  }

  // Ei function ta comments list pagination ar filter onujayi fetch kore
  static async getCommentsForModeration(page = 1, limit = 10, filter = 'flagged') {
    const safeLimit = Math.max(1, parseInt(limit) || 10);
    const safeOffset = Math.max(0, (Math.max(1, parseInt(page) || 1) - 1) * safeLimit);

    let query = `SELECT c.*, u.name as user_name, u.email as user_email, r.title as report_title 
                 FROM comments c
                 JOIN users u ON c.user_id = u.id
                 JOIN reports r ON c.report_id = r.id`;
    let countQuery = `SELECT COUNT(*) as total FROM comments c`;
    const conditions = [];
    const params = [];

    if (filter === 'flagged' || filter === 'removed') {
      conditions.push(`c.is_removed = 1`);
    }

    if (conditions.length > 0) {
      const whereClause = ` WHERE ` + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    query += ` ORDER BY c.created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;

    const comments = await db.query(query, params);
    const countResult = await db.query(countQuery, params);
    const total = countResult[0] ? countResult[0].total : 0;

    return { comments, total, page: parseInt(page) || 1, limit: safeLimit };
  }

  // Ei function ta comment remove/restore (moderation) kore
  static async updateCommentModeration(commentId, isRemoved) {
    return await db.update(
      `UPDATE comments SET is_removed = ?, updated_at = NOW() WHERE id = ?`,
      [isRemoved ? 1 : 0, commentId]
    );
  }

  // Ei function ta comment delete kore
  static async deleteComment(commentId) {
    return await db.query(`DELETE FROM comments WHERE id = ?`, [commentId]);
  }

  // Ei function ta women safety SOS emergency requests list fetch kore
  static async getEmergencyRequests(page = 1, limit = 10, status = 'all') {
    const safeLimit = Math.max(1, parseInt(limit) || 10);
    const safeOffset = Math.max(0, (Math.max(1, parseInt(page) || 1) - 1) * safeLimit);

    let query = `SELECT er.*, u.name as user_name, u.email as user_email, u.phone_number as user_phone
                 FROM emergency_requests er
                 JOIN users u ON er.user_id = u.id`;
    let countQuery = `SELECT COUNT(*) as total FROM emergency_requests er`;
    const params = [];

    if (status && status !== 'all') {
      query += ` WHERE er.status = ?`;
      countQuery += ` WHERE er.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY er.created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;

    const sosRequests = await db.query(query, params);
    const countResult = await db.query(countQuery, params);
    const total = countResult[0] ? countResult[0].total : 0;

    return { sosRequests, total, page: parseInt(page) || 1, limit: safeLimit };
  }

  // Ei function ta SOS request status update kore (active -> resolved / cancelled)
  static async updateEmergencyRequestStatus(id, newStatus) {
    return await db.update(
      `UPDATE emergency_requests SET status = ?, updated_at = NOW() WHERE id = ?`,
      [newStatus, id]
    );
  }

  // Ei function ta recent system activity logs fetch kore
  static async getRecentSystemLogs() {
    const recentUsers = await db.query(
      `SELECT id, name, email, role, created_at, 'USER_REGISTERED' as event_type FROM users ORDER BY created_at DESC LIMIT 5`
    );
    const recentReports = await db.query(
      `SELECT id, title, category, status, created_at, 'REPORT_SUBMITTED' as event_type FROM reports ORDER BY created_at DESC LIMIT 5`
    );
    const recentSos = await db.query(
      `SELECT id, user_id, status, created_at, 'SOS_ACTIVATED' as event_type FROM emergency_requests ORDER BY created_at DESC LIMIT 5`
    );

    return [...recentUsers, ...recentReports, ...recentSos].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
}

module.exports = AdminDashboardModel;
