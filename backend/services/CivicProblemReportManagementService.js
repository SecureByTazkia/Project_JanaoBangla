// ==========================================
// JanaoBangla — Civic Problem Report Management Service
// BRANCH: feature-ai-powered-civic-problem-recognition-and-smart-suggestions
// is_anonymous support add kora hoyeche
// ==========================================

const CivicProblemReportModel = require('../models/CivicProblemReportModel');
const ImageContentSafetyModerationService = require('./ImageContentSafetyModerationService');

class CivicProblemReportManagementService {

  // ==========================================
  // createReport — Report create kore, location save kore, ebong evidence save kore
  // User anonymous choose korle is_anonymous flag true (1) set hobe
  // ==========================================
  static async createReport(userId, data, files) {
    // Ei function report create korar shob steps eksathe manage kore

    // 0. Content Safety Inspection on all uploaded evidence files
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

    const harassmentType = (data.category === 'women_harassment' && (data.harassment_type || data.harassmentType))
      ? (data.harassment_type || data.harassmentType)
      : null;

    const reportId = await CivicProblemReportModel.createReport({
      user_id: userId,
      title: data.title,
      description: data.description,
      category: data.category,
      harassment_type: harassmentType,
      visibility: data.visibility || 'public',
      is_anonymous: isAnonymous ? 1 : 0
    });

    // Location data save kora hocche (GPS coordinates or fallback center)
    const reportLat = (data.latitude && !isNaN(parseFloat(data.latitude))) ? parseFloat(data.latitude) : 23.8103;
    const reportLng = (data.longitude && !isNaN(parseFloat(data.longitude))) ? parseFloat(data.longitude) : 90.4125;
    await CivicProblemReportModel.saveLocation(reportId, {
      latitude: reportLat,
      longitude: reportLng,
      address: data.address || 'Dhaka, Bangladesh'
    });

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
