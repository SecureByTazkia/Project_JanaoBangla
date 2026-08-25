// ==========================================
// JanaoBangla — Admin Dashboard Service
// BRANCH: feature-admin-dashboard-and-system-monitoring
// Admin panel business logic ar data processing ekhane thakbe
// Controller er requirement fulfill kora ar data sanitize kora hocche
// ==========================================

const AdminDashboardModel = require('../models/AdminDashboardModel');

class AdminDashboardService {
  // Ei function global overview stats fetch kore format korbe
  static async getOverviewStats() {
    const rawStats = await AdminDashboardModel.getSystemStats();

    return {
      totalUsers: parseInt(rawStats.users.total_users || 0),
      totalAdmins: parseInt(rawStats.users.total_admins || 0),
      verifiedUsers: parseInt(rawStats.users.verified_users || 0),
      activeUsers: parseInt(rawStats.users.active_users || 0),
      totalReports: parseInt(rawStats.reports.total_reports || 0),
      pendingReports: parseInt(rawStats.reports.pending_reports || 0),
      underReviewReports: parseInt(rawStats.reports.review_reports || 0),
      processingReports: parseInt(rawStats.reports.processing_reports || 0),
      solvedReports: parseInt(rawStats.reports.solved_reports || 0),
      privateReports: parseInt(rawStats.reports.private_reports || 0),
      duplicateReports: parseInt(rawStats.reports.duplicate_reports || 0),
      totalComments: parseInt(rawStats.comments.total_comments || 0),
      removedComments: parseInt(rawStats.comments.removed_comments || 0),
      totalSos: parseInt(rawStats.sos.total_sos || 0),
      activeSos: parseInt(rawStats.sos.active_sos || 0),
      resolvedSos: parseInt(rawStats.sos.resolved_sos || 0),
      categoriesBreakdown: rawStats.categories || []
    };
  }

  // Ei function user list pagination ar search query handle korbe
  static async getUsers(page, limit, search) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    return await AdminDashboardModel.getUsersList(pageNum, limitNum, search);
  }

  // Ei function user role change validation handle korbe (citizen/admin)
  static async changeUserRole(userId, newRole) {
    const validRoles = ['citizen', 'admin'];
    if (!validRoles.includes(newRole)) {
      throw new Error('Invalid user role specified. Must be citizen or admin.');
    }
    return await AdminDashboardModel.updateUserRole(userId, newRole);
  }

  // Ei function user activation status update korbe
  static async changeUserStatus(userId, isActive) {
    return await AdminDashboardModel.updateUserStatus(userId, isActive);
  }

  // Ei function admin view er jonno reports fetch korbe
  static async getAdminReports(page, limit, status, category) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    return await AdminDashboardModel.getAllReportsForAdmin(pageNum, limitNum, status, category);
  }

  // Ei function report status update validate kore execute korbe
  static async updateReportStatus(reportId, newStatus) {
    const validStatuses = ['submitted', 'under_review', 'processing', 'solved'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Invalid report status. Must be submitted, under_review, processing, or solved.');
    }
    return await AdminDashboardModel.updateReportStatus(reportId, newStatus);
  }

  // Ei function report delete request process korbe
  static async deleteReport(reportId) {
    return await AdminDashboardModel.deleteReport(reportId);
  }

  // Ei function comments fetch korbe moderation er jonno
  static async getComments(page, limit, filter) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    return await AdminDashboardModel.getCommentsForModeration(pageNum, limitNum, filter);
  }

  // Ei function comment moderation status update korbe (is_removed: 1 or 0)
  static async moderateComment(commentId, isRemoved) {
    return await AdminDashboardModel.updateCommentModeration(commentId, isRemoved);
  }

  // Ei function comment delete korbe
  static async deleteComment(commentId) {
    return await AdminDashboardModel.deleteComment(commentId);
  }

  // Ei function SOS emergency requests list fetch korbe
  static async getEmergencyRequests(page, limit, status) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    return await AdminDashboardModel.getEmergencyRequests(pageNum, limitNum, status);
  }

  // Ei function SOS request status update korbe (resolved, cancelled, active)
  static async updateEmergencyRequestStatus(id, newStatus) {
    const validStatuses = ['active', 'resolved', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Invalid status. Must be active, resolved, or cancelled.');
    }
    return await AdminDashboardModel.updateEmergencyRequestStatus(id, newStatus);
  }

  // Ei function recent system logs return korbe
  static async getSystemLogs() {
    return await AdminDashboardModel.getRecentSystemLogs();
  }
}

module.exports = AdminDashboardService;
