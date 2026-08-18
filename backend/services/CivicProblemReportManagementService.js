// ==========================================
// JanaoBangla — Civic Problem Report Management Service
// BRANCH: civic-problem-reporting-visibility-and-management
// Controller theke call hobe, model ke orchestrate korbe
// ==========================================

const CivicProblemReportModel = require('../models/CivicProblemReportModel');

class CivicProblemReportManagementService {

  // Ei function report create kore, tahole location save kore, tahole evidence save kore
  static async createReport(userId, data, files) {
    // Step 1: Report table e natun row insert kora hocche
    const reportId = await CivicProblemReportModel.createReport({
      user_id: userId,
      title: data.title,
      description: data.description,
      category: data.category,
      visibility: data.visibility || 'public'
    });

    // Step 2: Jodi GPS coordinates pathano hoye thake, location table e save korbo
    // locations table e report_id foreign key ache — so report create er pore location save hobe
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
        // mime type diye image naki video determine kora hocche
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

  // Ei function specific user er shob report evidence shoho return korbe
  static async getUserReports(userId) {
    const reports = await CivicProblemReportModel.getReportsByUserId(userId);
    // Proti report er jonno evidence separately fetch kora hocche
    for (const report of reports) {
      report.evidence = await CivicProblemReportModel.getEvidenceByReportId(report.id);
    }
    return reports;
  }

  // Ei function shob public report evidence shoho return korbe
  static async getPublicReports() {
    const reports = await CivicProblemReportModel.getPublicReports();
    for (const report of reports) {
      report.evidence = await CivicProblemReportModel.getEvidenceByReportId(report.id);
    }
    return reports;
  }

  // Ei function id diye ekta report er full details return korbe
  static async getReportDetails(reportId) {
    const report = await CivicProblemReportModel.getReportById(reportId);
    if (!report) return null;
    report.evidence = await CivicProblemReportModel.getEvidenceByReportId(reportId);
    return report;
  }
}

module.exports = CivicProblemReportManagementService;
