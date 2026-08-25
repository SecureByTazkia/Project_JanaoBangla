// ==========================================
// JanaoBangla — Admin Dashboard Controller
// BRANCH: feature-admin-dashboard-and-system-monitoring
// Admin panel er REST API requests handle kora hocche
// AdminAuthorizationMiddleware diye strictly authorized request ekhane ashbe
// ==========================================

const AdminDashboardService = require('../services/AdminDashboardService');

class AdminDashboardController {
  // Ei function overview system statistics return korbe
  static async getOverviewStats(req, res, next) {
    try {
      const stats = await AdminDashboardService.getOverviewStats();
      res.status(200).json({
        success: true,
        stats
      });
    } catch (error) {
      next(error);
    }
  }

  // Ei function users list fetch korbe pagination ar search filter সহ
  static async getUsers(req, res, next) {
    try {
      const { page, limit, search } = req.query;
      const data = await AdminDashboardService.getUsers(page, limit, search);
      res.status(200).json({
        success: true,
        ...data
      });
    } catch (error) {
      next(error);
    }
  }

  // Ei function user role update request process korbe (citizen <-> admin)
  static async updateUserRole(req, res, next) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({ success: false, message: 'Role parameter is required.' });
      }

      await AdminDashboardService.changeUserRole(userId, role);
      res.status(200).json({
        success: true,
        message: `User role updated to '${role}' successfully.`
      });
    } catch (error) {
      next(error);
    }
  }

  // Ei function user active/inactive toggle korbe
  static async updateUserStatus(req, res, next) {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      if (isActive === undefined) {
        return res.status(400).json({ success: false, message: 'isActive status boolean parameter is required.' });
      }

      await AdminDashboardService.changeUserStatus(userId, isActive);
      res.status(200).json({
        success: true,
        message: `User status set to ${isActive ? 'active' : 'deactivated'} successfully.`
      });
    } catch (error) {
      next(error);
    }
  }

  // Ei function admin view er reports list return korbe (both public and private)
  static async getReports(req, res, next) {
    try {
      const { page, limit, status, category } = req.query;
      const data = await AdminDashboardService.getAdminReports(page, limit, status, category);
      res.status(200).json({
        success: true,
        ...data
      });
    } catch (error) {
      next(error);
    }
  }

  // Ei function report status update korbe (submitted, under_review, processing, solved)
  static async updateReportStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, message: 'Status parameter is required.' });
      }

      await AdminDashboardService.updateReportStatus(id, status);
      res.status(200).json({
        success: true,
        message: `Report status updated to '${status}' successfully.`
      });
    } catch (error) {
      next(error);
    }
  }

  // Ei function invalid/spam report delete korbe
  static async deleteReport(req, res, next) {
    try {
      const { id } = req.params;
      await AdminDashboardService.deleteReport(id);
      res.status(200).json({
        success: true,
        message: 'Report deleted successfully by administrator.'
      });
    } catch (error) {
      next(error);
    }
  }

  // Ei function comments fetch korbe moderation er jonno
  static async getComments(req, res, next) {
    try {
      const { page, limit, filter } = req.query;
      const data = await AdminDashboardService.getComments(page, limit, filter);
      res.status(200).json({
        success: true,
        ...data
      });
    } catch (error) {
      next(error);
    }
  }

  // Ei function comment moderation status update korbe (remove / restore)
  static async moderateComment(req, res, next) {
    try {
      const { id } = req.params;
      const isRemoved = req.body.isRemoved !== undefined ? req.body.isRemoved : req.body.isHidden;

      await AdminDashboardService.moderateComment(id, isRemoved);
      res.status(200).json({
        success: true,
        message: `Comment ${isRemoved ? 'removed' : 'restored'} successfully.`
      });
    } catch (error) {
      next(error);
    }
  }

  // Ei function comment delete korbe
  static async deleteComment(req, res, next) {
    try {
      const { id } = req.params;
      await AdminDashboardService.deleteComment(id);
      res.status(200).json({
        success: true,
        message: 'Comment deleted successfully by administrator.'
      });
    } catch (error) {
      next(error);
    }
  }

  // Ei function SOS emergency requests fetch korbe
  static async getSosRequests(req, res, next) {
    try {
      const { page, limit, status } = req.query;
      const data = await AdminDashboardService.getEmergencyRequests(page, limit, status);
      res.status(200).json({
        success: true,
        ...data
      });
    } catch (error) {
      next(error);
    }
  }

  // Ei function SOS request status update korbe (resolved/cancelled)
  static async updateSosStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, message: 'Status parameter is required.' });
      }

      await AdminDashboardService.updateEmergencyRequestStatus(id, status);
      res.status(200).json({
        success: true,
        message: `SOS request status updated to '${status}' successfully.`
      });
    } catch (error) {
      next(error);
    }
  }

  // Ei function recent system activity logs return korbe
  static async getSystemLogs(req, res, next) {
    try {
      const logs = await AdminDashboardService.getSystemLogs();
      res.status(200).json({
        success: true,
        logs
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminDashboardController;
