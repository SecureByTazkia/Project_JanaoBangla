// ==========================================
// JanaoBangla — Civic Problem Report Management Service
// BRANCH: feature-civic-problem-reporting-visibility-and-management
// Controller theke call hobe, model ke orchestrate korbe
// ==========================================

const CivicProblemReportModel = require('../models/CivicProblemReportModel');

class CivicProblemReportManagementService {

  // ==========================================
  // createReport — Report create kore, location save kore, ebong evidence save kore
  // ==========================================
  static async createReport(userId, data, files) {
    // User anonymous reporting choose korle is_anonymous flag true (1) set hobe
    const isAnonymous = Boolean(
      data.isAnonymous === 'true' ||
      data.isAnonymous === true ||
      data.is_anonymous === 'true' ||
      data.is_anonymous === true ||
      data.is_anonymous === 1
    );

    // Step 1: Report table e natun row insert kora hocche
    const reportId = await CivicProblemReportModel.createReport({
      user_id: userId,
      title: data.title,
      description: data.description,
      category: data.category,
      visibility: data.visibility || 'public',
      is_anonymous: isAnonymous ? 1 : 0
    });

    // Step 2: Jodi GPS coordinates pathano hoye thake, location table e save korbo
    if (data.latitude && data.longitude) {
      await CivicProblemReportModel.saveLocation(reportId, {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        address: data.address || null
      });
    }

    // Step 3: Jodi evidence files upload kora hoye thake, segulo save korbo
    if (files && files.length > 0) {
      for (const file of files) {
        const fileType = file.mimetype.startsWith('video/') ? 'video' : 'image';
        await CivicProblemReportModel.addEvidence({
          report_id: reportId,
          file_type: fileType,
          file_path: `/uploads/${file.filename}`,  // Static URL frontend er jonno
          original_name: file.originalname,         // actual DB column name: original_name
          file_size: file.size
        });
      }
    }

    return reportId;
  }

  // ==========================================
  // getUserReports — Specific user er nijer shob report evidence shoho return korbe
  // ==========================================
  static async getUserReports(userId) {
    // User nijer shob reports (both anonymous and regular) fetch kore
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
    // Shob public reports load kore evidence attach korbe
    const reports = await CivicProblemReportModel.getPublicReports();
    for (const report of reports) {
      report.evidence = await CivicProblemReportModel.getEvidenceByReportId(report.id);
    }
    return reports;
  }

  // ==========================================
  // getReportDetails — Single report details fetch kore requester onujayi identity sanitize kore
  // ==========================================
  static async getReportDetails(reportId, requestingUser = null) {
    // Single report fetch kore
    const report = await CivicProblemReportModel.getReportById(reportId);
    if (!report) return null;

    report.evidence = await CivicProblemReportModel.getEvidenceByReportId(reportId);

    // Security Check: Jodi report anonymous hoy ebong viewer owner ba admin na hoy:
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
