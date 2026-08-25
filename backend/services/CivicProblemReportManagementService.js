// ==========================================
// JanaoBangla — Civic Problem Report Management Service
// BRANCH: feature-ai-powered-civic-problem-recognition-and-smart-suggestions
// is_anonymous support add kora hoyeche
// ==========================================

const CivicProblemReportModel = require('../models/CivicProblemReportModel');

class CivicProblemReportManagementService {

  // ==========================================
  // createReport — Report create kore, location save kore, evidence save kore
  // User anonymous choose korle is_anonymous flag true (1) set hobe
  // ==========================================
  static async createReport(userId, data, files) {
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

    // Jodi GPS coordinates pathano hoye thake, location table e save korbo
    if (data.latitude && data.longitude) {
      await CivicProblemReportModel.saveLocation(reportId, {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        address: data.address || null
      });
    }

    // Jodi evidence files upload kora hoye thake, segulo save korbo
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

    // Jodi report anonymous hoy ebong viewer owner ba admin na hoy, identity hide korbe
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
