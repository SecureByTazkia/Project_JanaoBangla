// ==========================================
// JanaoBangla — Civic Problem Report Model
// BRANCH: feature-ai-powered-civic-problem-recognition-and-smart-suggestions
// is_anonymous support add kora hoyeche — public feed e identity mask korbe
// ==========================================

const db = require('../services/DatabaseService');

class CivicProblemReportModel {

  // ==========================================
  // createReport — Natun civic report create kore DB te insert kore
  // is_anonymous, is_duplicate ebong duplicate_of_id support kora hoyeche
  // ==========================================
  static async createReport(reportData) {
    // Ei function form data theke notun civic report MySQL reports table e insert kore
    const { user_id, title, description, category, visibility, is_anonymous, is_duplicate, duplicate_of_id } = reportData;
    // User anonymous choose korle 1 hobe, noile default 0
    const anonymousValue = is_anonymous ? 1 : 0;
    const isDuplicateValue = (is_duplicate || duplicate_of_id) ? 1 : 0;
    const duplicateOfValue = duplicate_of_id ? parseInt(duplicate_of_id) : null;

    const reportId = await db.insert(
      `INSERT INTO reports (user_id, title, description, category, visibility, is_anonymous, is_duplicate, duplicate_of, status, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'submitted', 'medium')`,
      [user_id, title, description, category, visibility || 'public', anonymousValue, isDuplicateValue, duplicateOfValue]
    );
    return reportId;
  }

  // ==========================================
  // saveLocation — GPS coordinates locations table e save kore
  // ==========================================
  static async saveLocation(reportId, locationData) {
    const { latitude, longitude, address } = locationData;
    const locationId = await db.insert(
      `INSERT INTO locations (report_id, latitude, longitude, address) VALUES (?, ?, ?, ?)`,
      [reportId, latitude, longitude, address || null]
    );
    return locationId;
  }

  // ==========================================
  // addEvidence — Uploaded image/video metadata DB te save kore
  // ==========================================
  static async addEvidence(evidenceData) {
    const { report_id, file_type, file_path, original_name, file_size } = evidenceData;
    const evidenceId = await db.insert(
      `INSERT INTO report_evidence (report_id, file_type, file_path, original_name, file_size)
       VALUES (?, ?, ?, ?, ?)`,
      [report_id, file_type, file_path, original_name || null, file_size || null]
    );
    return evidenceId;
  }

  // ==========================================
  // getReportsByUserId — User er nijer shob report return kore (My Reports)
  // Owner nijer anonymous report-o dekhte parbe is_anonymous flag sahit
  // ==========================================
  static async getReportsByUserId(userId) {
    const reports = await db.query(
      `SELECT r.*, l.latitude, l.longitude, l.address
       FROM reports r
       LEFT JOIN locations l ON l.report_id = r.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [userId]
    );
    return reports;
  }

  // ==========================================
  // getReportById — Single report er full details return kore (real reporter_name shoho)
  // ==========================================
  static async getReportById(reportId) {
    const report = await db.queryOne(
      `SELECT r.*, l.latitude, l.longitude, l.address, u.name as reporter_name
       FROM reports r
       LEFT JOIN locations l ON l.report_id = r.id
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [reportId]
    );
    return report;
  }

  // ==========================================
  // getEvidenceByReportId — Report er shob evidence files return kore
  // ==========================================
  static async getEvidenceByReportId(reportId) {
    const evidence = await db.query(
      `SELECT * FROM report_evidence WHERE report_id = ?`,
      [reportId]
    );
    return evidence;
  }

  // ==========================================
  // getPublicReports — Shob public report return kore
  // Anonymous report e reporter_name = 'Anonymous Citizen', user_id = NULL dekhabe
  // ==========================================
  static async getPublicReports() {
    // CASE statement diye anonymous reports er identity mask kora hocche
    const reports = await db.query(
      `SELECT
         r.id,
         CASE WHEN r.is_anonymous = 1 THEN NULL ELSE r.user_id END as user_id,
         r.title,
         r.description,
         r.category,
         r.status,
         r.visibility,
         r.is_anonymous,
         r.priority,
         r.created_at,
         r.updated_at,
         l.latitude,
         l.longitude,
         l.address,
         CASE WHEN r.is_anonymous = 1 THEN 'Anonymous Citizen' ELSE u.name END as reporter_name
       FROM reports r
       LEFT JOIN locations l ON l.report_id = r.id
       JOIN users u ON r.user_id = u.id
       WHERE r.visibility = 'public'
       ORDER BY r.created_at DESC`,
      []
    );
    return reports;
  }
}

module.exports = CivicProblemReportModel;
