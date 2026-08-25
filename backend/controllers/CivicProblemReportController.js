// ==========================================
// JanaoBangla — Civic Problem Report Controller
// BRANCH: feature-ai-powered-civic-problem-recognition-and-smart-suggestions
// isAnonymous support add kora hoyeche
// ==========================================

const CivicProblemReportManagementService = require('../services/CivicProblemReportManagementService');

class CivicProblemReportController {

  // ==========================================
  // submitReport — Incoming report submission request handle korbe
  // ==========================================
  static async submitReport(req, res) {
    try {
      const userId = req.user.id;
      const reportData = req.body;
      const files = req.files;

      if (!reportData.title || !reportData.description || !reportData.category) {
        return res.status(400).json({ error: 'Title, description and category are required' });
      }

      const reportId = await CivicProblemReportManagementService.createReport(userId, reportData, files);

      return res.status(201).json({
        message: 'Report submitted successfully',
        reportId: reportId
      });
    } catch (error) {
      console.error('Error submitting report:', error.message);
      if (error.statusCode || error.isClientError) {
        return res.status(error.statusCode || 400).json({
          success: false,
          error: error.message,
          messageBn: error.reasonBn,
          flagType: error.flagType,
          isUnsafe: Boolean(error.flagType)
        });
      }
      return res.status(500).json({
        error: 'Failed to submit report. Please try again.',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // ==========================================
  // getMyReports — Logged in user er nijer shob report return korbe
  // ==========================================
  static async getMyReports(req, res) {
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
  // getPublicReports — Shob public reports return korbe, anonymous identity mask korbe
  // ==========================================
  static async getPublicReports(req, res) {
    try {
      const reports = await CivicProblemReportManagementService.getPublicReports();
      return res.status(200).json({ reports });
    } catch (error) {
      console.error('Error fetching public reports:', error);
      return res.status(500).json({ error: 'Failed to fetch public reports.' });
    }
  }

  // ==========================================
  // getReportDetails — Single report er data dibe, anonymous access control enforce kore
  // ==========================================
  static async getReportDetails(req, res) {
    try {
      const reportId = req.params.id;
      const requestingUser = req.user || null;
      const report = await CivicProblemReportManagementService.getReportDetails(reportId, requestingUser);

      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      const isOwner = requestingUser && report.user_id && report.user_id === requestingUser.id;
      const isAdmin = requestingUser && requestingUser.role === 'admin';

      if (report.visibility === 'private' && !isOwner && !isAdmin) {
        return res.status(403).json({ error: 'Access denied. This is a private report.' });
      }

      return res.status(200).json({ report });
    } catch (error) {
      console.error('Error fetching report details:', error);
      return res.status(500).json({ error: 'Failed to fetch report details.' });
    }
  }
}

module.exports = CivicProblemReportController;
