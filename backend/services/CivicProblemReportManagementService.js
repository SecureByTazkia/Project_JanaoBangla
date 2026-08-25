// ==========================================
// JanaoBangla — Civic Problem Report Management Service
// BRANCH: feature-ai-powered-civic-problem-recognition-and-smart-suggestions
// is_anonymous support add kora hoyeche
// ==========================================

const CivicProblemReportModel = require('../models/CivicProblemReportModel');
const DuplicateReportLinkingService = require('./DuplicateReportLinkingService');

class CivicProblemReportManagementService {

  // ==========================================
  // createReport — Report create kore, location save kore, evidence save kore ebong duplicate link handle kore
  // User anonymous choose korle is_anonymous flag true (1) set hobe
  // User duplicate link choose korle duplicate_links table e link hobe
  // ==========================================
  static async createReport(userId, data, files) {
    // Ei function report create korar shob steps eksathe manage kore
    const isAnonymous = Boolean(
      data.isAnonymous === 'true' ||
      data.isAnonymous === true ||
      data.is_anonymous === 'true' ||
      data.is_anonymous === true ||
      data.is_anonymous === 1
    );

    const duplicateOfId = data.duplicateOfId || data.duplicate_of_id || null;
    const similarityScore = data.similarityScore || data.similarity_score || null;

    const reportId = await CivicProblemReportModel.createReport({
      user_id: userId,
      title: data.title,
      description: data.description,
      category: data.category,
      visibility: data.visibility || 'public',
      is_anonymous: isAnonymous ? 1 : 0,
      is_duplicate: duplicateOfId ? 1 : 0,
      duplicate_of_id: duplicateOfId
    });

    // Jodi duplicate_of_id dewa thake, duplicate_links table e automatically link korbo
    if (duplicateOfId) {
      try {
        await DuplicateReportLinkingService.linkReports({
          originalId: duplicateOfId,
          duplicateId: reportId,
          similarityScore: similarityScore ? parseFloat(similarityScore) : null
        });
      } catch (linkErr) {
        console.warn('Auto duplicate link failed on creation:', linkErr.message);
      }
    }

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
