// ==========================================
// JanaoBangla — Duplicate Report Detection Controller
// BRANCH: feature-duplicate-civic-problem-report-detection
// Duplicate report detection, similarity checking, and report linking request-gulo handle kore
// ==========================================

const SimilarReportDetectionService = require('../services/SimilarReportDetectionService');
const DuplicateReportLinkingService = require('../services/DuplicateReportLinkingService');

class DuplicateReportDetectionController {

  // ==========================================
  // checkDuplicates — Notun report submit korar shomoy similar/duplicate reports khuje ber kore
  // ==========================================
  static async checkDuplicates(req, res) {
    // Ei function user er typed title, description, category ebong coordinates niye similarity analysis kore
    try {
      const {
        title = '',
        description = '',
        category = '',
        latitude = null,
        longitude = null,
        excludeReportId = null
      } = req.body;

      if (!title && !description) {
        return res.status(400).json({
          success: false,
          error: 'Title or description is required for duplicate checking.'
        });
      }

      const result = await SimilarReportDetectionService.findSimilarReports({
        title,
        description,
        category,
        latitude,
        longitude,
        excludeReportId
      });

      return res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('DuplicateReportDetectionController.checkDuplicates Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to check for duplicate reports.',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // ==========================================
  // linkDuplicateReport — Duita report ke original ebong duplicate hisebe database e link kore
  // ==========================================
  static async linkDuplicateReport(req, res) {
    // Ei function authenticated user ba admin er duplicate linking request process kore
    try {
      const { originalReportId, duplicateReportId, similarityScore } = req.body;

      if (!originalReportId || !duplicateReportId) {
        return res.status(400).json({
          success: false,
          error: 'Both originalReportId and duplicateReportId are required.'
        });
      }

      const result = await DuplicateReportLinkingService.linkReports({
        originalId: originalReportId,
        duplicateId: duplicateReportId,
        similarityScore
      });

      return res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('DuplicateReportDetectionController.linkDuplicateReport Error:', error);
      return res.status(400).json({
        success: false,
        error: error.message || 'Failed to link reports as duplicate.'
      });
    }
  }

  // ==========================================
  // getLinkedReports — Ekta specific report er sathe linked sob duplicate reports return kore
  // ==========================================
  static async getLinkedReports(req, res) {
    // Ei function report ID diye tar primary report ebong sob linked duplicates fetch kore
    try {
      const { reportId } = req.params;

      if (!reportId) {
        return res.status(400).json({
          success: false,
          error: 'Report ID is required.'
        });
      }

      const linkedData = await DuplicateReportLinkingService.getLinkedReports(reportId);

      return res.status(200).json({
        success: true,
        ...linkedData
      });
    } catch (error) {
      console.error('DuplicateReportDetectionController.getLinkedReports Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve linked duplicate reports.'
      });
    }
  }

  // ==========================================
  // unlinkDuplicateReport — Duplicate link cancel kore report ke independent kore dey
  // ==========================================
  static async unlinkDuplicateReport(req, res) {
    // Ei function duplicate report link remove kore independent report e restore kore
    try {
      const { reportId } = req.params;
      const requestingUser = req.user;

      if (!reportId) {
        return res.status(400).json({
          success: false,
          error: 'Report ID is required to unlink.'
        });
      }

      const result = await DuplicateReportLinkingService.unlinkReport(reportId, requestingUser);

      return res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('DuplicateReportDetectionController.unlinkDuplicateReport Error:', error);
      return res.status(400).json({
        success: false,
        error: error.message || 'Failed to unlink duplicate report.'
      });
    }
  }

  // ==========================================
  // getAllDuplicateClusters — System er shob duplicate groupings admin/monitoring er jonno list kore
  // ==========================================
  static async getAllDuplicateClusters(req, res) {
    // Ei function shob duplicate clusters statistics return kore
    try {
      const clusters = await DuplicateReportLinkingService.getAllDuplicateClusters();

      return res.status(200).json({
        success: true,
        clusters,
        totalClusters: clusters.length
      });
    } catch (error) {
      console.error('DuplicateReportDetectionController.getAllDuplicateClusters Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch duplicate clusters.'
      });
    }
  }
}

module.exports = DuplicateReportDetectionController;
