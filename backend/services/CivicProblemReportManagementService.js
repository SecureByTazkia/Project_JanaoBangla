// ==========================================
// JanaoBangla — Civic Problem Report Management Service
// BRANCH: feature-ai-powered-civic-problem-recognition-and-smart-suggestions
// Uploaded evidence files AI content safety (nudity/adult moderation) check integrated
// ==========================================

const CivicProblemReportModel = require('../models/CivicProblemReportModel');
const ImageContentSafetyModerationService = require('./ImageContentSafetyModerationService');

class CivicProblemReportManagementService {

  // ==========================================
  // createReport — Report create kore, location save kore, evidence save kore
  // Evidence upload e AI Nudity/NSFW Content Safety check enforce kore
  // ==========================================
  static async createReport(userId, data, files) {
    // 1. Content Safety Inspection on all uploaded evidence files
    if (files && files.length > 0) {
      for (const file of files) {
        if (file.mimetype && file.mimetype.startsWith('image/')) {
          const safetyCheck = await ImageContentSafetyModerationService.inspectImage(file.path, file.originalname);
          if (!safetyCheck.isSafe) {
            // Delete all uploaded files immediately to keep server clean
            for (const f of files) {
              ImageContentSafetyModerationService.safelyRemoveFile(f.path);
            }
            const safetyError = new Error(safetyCheck.reason || 'Uploaded image contains inappropriate or adult content.');
            safetyError.statusCode = 400;
            safetyError.isClientError = true;
            safetyError.flagType = safetyCheck.flagType;
            safetyError.reasonBn = safetyCheck.reasonBn;
            throw safetyError;
          }
        }
      }
    }

    const isAnonymous = Boolean(
      data.isAnonymous === 'true' ||
      data.isAnonymous === true ||
      data.is_anonymous === 'true' ||
      data.is_anonymous === true ||
      data.is_anonymous === 1
    );

    const reportId = await CivicProblemReportModel.createReport({
      user_id: userId,
      title: data.title,
      description: data.description,
      category: data.category,
      visibility: data.visibility || 'public',
      is_anonymous: isAnonymous ? 1 : 0
    });

    // Save location coordinates if provided
    if (data.latitude && data.longitude) {
      await CivicProblemReportModel.saveLocation(reportId, {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        address: data.address || null
      });
    }

    // Save verified evidence files
    if (files && files.length > 0) {
      for (const file of files) {
        const fileType = file.mimetype.startsWith('video/') ? 'video' : 'image';
        await CivicProblemReportModel.addEvidence({
          report_id: reportId,
          file_type: fileType,
          file_path: `/uploads/${file.filename}`,
          original_name: file.originalname,
          file_size: file.size
        });
      }
    }

    return reportId;
  }

  // ==========================================
  // getUserReports — User er nijer shob report evidence shoho return korbe
  // ==========================================
  static async getUserReports(userId) {
    const reports = await CivicProblemReportModel.getReportsByUserId(userId);
    for (const report of reports) {
      report.evidence = await CivicProblemReportModel.getEvidenceByReportId(report.id);
    }
    return reports;
  }

  // ==========================================
  // getPublicReports — Shob public report evidence shoho return korbe
  // ==========================================
  static async getPublicReports() {
    const reports = await CivicProblemReportModel.getPublicReports();
    for (const report of reports) {
      report.evidence = await CivicProblemReportModel.getEvidenceByReportId(report.id);
    }
    return reports;
  }

  // ==========================================
  // getReportDetails — Single report details fetch kore, anonymous hole identity mask kore
  // ==========================================
  static async getReportDetails(reportId, requestingUser = null) {
    const report = await CivicProblemReportModel.getReportById(reportId);
    if (!report) return null;

    report.evidence = await CivicProblemReportModel.getEvidenceByReportId(reportId);

    // Identity masking for anonymous reports
    const isOwner = requestingUser && requestingUser.id === report.user_id;
    const isAdmin = requestingUser && requestingUser.role === 'admin';

    if (report.is_anonymous && !isOwner && !isAdmin) {
      report.reporter_name = 'Anonymous Citizen';
      delete report.user_id;
    }

    return report;
  }
}

module.exports = CivicProblemReportManagementService;
