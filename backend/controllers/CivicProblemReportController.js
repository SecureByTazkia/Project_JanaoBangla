// ==========================================
// JanaoBangla — Civic Problem Report Controller
// BRANCH: feature-civic-problem-reporting-visibility-and-management
// Civic problem reporting endpoints er request receive kore ebong response pathay
// ==========================================

const CivicProblemReportManagementService = require('../services/CivicProblemReportManagementService');

class CivicProblemReportController {

  // ==========================================
  // submitReport — Incoming report submission request handle korbe
  // ==========================================
  static async submitReport(req, res) {
    // Authenticated user token theke userId nibe ebong isAnonymous support korbe
    try {
      const userId = req.user.id;
      const reportData = req.body;
      const files = req.files; // multer diye asbe

      if (!reportData.title || !reportData.description || !reportData.category) {
        return res.status(400).json({ error: 'Title, description and category are required' });
      }

      // Valid categories validation (existing + 2 new ones)
      const validCategories = [
        'road_damage', 'garbage_waste', 'street_light', 'water_drainage',
        'traffic_accident', 'public_safety', 'women_harassment', 'extortion_chanda'
      ];
      if (!validCategories.includes(reportData.category)) {
        return res.status(400).json({ error: 'Invalid category selected' });
      }

      // Women harassment er jonno harassment_type validate kora hocche
      if (reportData.category === 'women_harassment') {
        if (!reportData.harassment_type || !['online', 'offline'].includes(reportData.harassment_type)) {
          return res.status(400).json({ error: 'Harassment type (online or offline) is required for Women Harassment reports' });
        }
      }

      const reportId = await CivicProblemReportManagementService.createReport(userId, reportData, files);

      return res.status(201).json({
        message: 'Report submitted successfully. Awaiting admin review before public display.',
        reportId: reportId
      });
    } catch (error) {
      console.error('Error submitting report:', error.message, error.stack);
      return res.status(500).json({
        error: 'Failed to submit report. Please try again.',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // ==========================================
  // getMyReports — Logged in user er nijer shob report (with anonymous tag) return korbe
  // ==========================================
  static async getMyReports(req, res) {
    // User nijer shob submitted reports dekhte parbe
    try {
      const userId = req.user.id;
      const reports = await CivicProblemReportManagementService.getUserReports(userId);
      return res.status(200).json({ reports });
    } catch (error) {
      console.error('Error fetching user reports:', error);
      return res.status(500).json({ error: 'Failed to fetch your reports.' });
    }
  }

  // ==========================================
  // getPublicReports — Shob public reports return korbe, anonymous reports er identity mask korbe
  // ==========================================
  static async getPublicReports(req, res) {
    // Public feed er jonno shob public reports return korbe (shudhu admin accept kora reports)
    try {
      const reports = await CivicProblemReportManagementService.getPublicReports();
      return res.status(200).json({ reports });
    } catch (error) {
      console.error('Error fetching public reports:', error);
      return res.status(500).json({ error: 'Failed to fetch public reports.' });
    }
  }

  // ==========================================
  // getReportDetails — Single report er data dibe, anonymous & private access control enforce kore
  // ==========================================
  static async getReportDetails(req, res) {
    // Specific report details return korbe ebong identity mask korbe jodi requester owner/admin na hoy
    try {
      const reportId = req.params.id;
      const requestingUser = req.user || null;
      const report = await CivicProblemReportManagementService.getReportDetails(reportId, requestingUser);
      
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }
      
      // Jodi report private hoy ebong requester owner na hoy ebong admin na hoy, tahole block korbe
      const isOwner = requestingUser && report.user_id && report.user_id === requestingUser.id;
      const isAdmin = requestingUser && requestingUser.role === 'admin';

      if (report.visibility === 'private' && !isOwner && !isAdmin) {
        return res.status(403).json({ error: 'Access denied. This is a private report.' });
      }

      // Jodi report submitted status e thake (awaiting admin review) ebong requester owner ba admin na hoy, tahole block korbe
      if (report.status === 'submitted' && !isOwner && !isAdmin) {
        return res.status(403).json({ error: 'Access denied. This report is awaiting admin review.' });
      }

      return res.status(200).json({ report });
    } catch (error) {
      console.error('Error fetching report details:', error);
      return res.status(500).json({ error: 'Failed to fetch report details.' });
    }
  }
}

module.exports = CivicProblemReportController;
