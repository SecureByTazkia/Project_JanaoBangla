const CivicProblemReportManagementService = require('../services/CivicProblemReportManagementService');

class CivicProblemReportController {
  // Ei function incoming report submission request handle korbe
  static async submitReport(req, res) {
    try {
      const userId = req.user.id; // user authenticate howar por token theke asbe
      const reportData = req.body;
      const files = req.files; // multer diye asbe

      if (!reportData.title || !reportData.description || !reportData.category) {
        return res.status(400).json({ error: 'Title, description and category are required' });
      }

      const reportId = await CivicProblemReportManagementService.createReport(userId, reportData, files);

      return res.status(201).json({
        message: 'Report submitted successfully. Awaiting admin review before public display.',
        reportId: reportId
      });
    } catch (error) {
      // Actual error ta log ar response e pathano hocche debug er jonno
      console.error('Error submitting report:', error.message, error.stack);
      return res.status(500).json({
        error: 'Failed to submit report. Please try again.',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Ei function logged in user er nijer report gulo dekhanor jonno return korbe
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

  // Ei function shob public report gulo return korbe
  static async getPublicReports(req, res) {
    try {
      const reports = await CivicProblemReportManagementService.getPublicReports();
      return res.status(200).json({ reports });
    } catch (error) {
      console.error('Error fetching public reports:', error);
      return res.status(500).json({ error: 'Failed to fetch public reports.' });
    }
  }

  // Ei function specific ekta report er data dibe
  static async getReportDetails(req, res) {
    try {
      const reportId = req.params.id;
      const report = await CivicProblemReportManagementService.getReportDetails(reportId);
      
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }
      
      const isOwner = req.user && report.user_id && report.user_id === req.user.id;
      const isAdmin = req.user && req.user.role === 'admin';

      // Jodi report private hoy ebong requester owner na hoy ba admin na hoy, tahole block korbe
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
