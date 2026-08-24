// ==========================================
// JanaoBangla — Civic Problem Report Model
// BRANCH: feature-civic-problem-reporting-visibility-and-management
// Actual database schema onujayi sob query likha hoyeche
// reports table: id, user_id, title, description, category, status, visibility, is_anonymous, priority, is_duplicate, duplicate_of, confirmation_count, created_at, updated_at
// ==========================================

const db = require('../services/DatabaseService');

class CivicProblemReportModel {

  // ==========================================
  // createReport — Natun report create kore reports table e insert kore
  // is_anonymous boolean/tinyint support kora hoyeche jate citizen identity hide korte pare
  // ==========================================
  static async createReport(reportData) {
    // Ei function user-er problem report database e insert korbe
    const { user_id, title, description, category, visibility, is_anonymous, harassment_type } = reportData;
    
    // User anonymous choose korle 1 hobe, noile default 0
    const anonymousValue = is_anonymous ? 1 : 0;
    // Harassment type শুধু women_harassment category-র জন্য store হবে, অন্য category-তে NULL
    const harassmentTypeValue = (category === 'women_harassment' && harassment_type) ? harassment_type : null;

    const reportId = await db.insert(
      `INSERT INTO reports (user_id, title, description, category, harassment_type, visibility, is_anonymous, status, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted', 'medium')`,
      [user_id, title, description, category, harassmentTypeValue, visibility || 'public', anonymousValue]
    );
    return reportId;
  }

  // ==========================================
  // saveLocation — GPS coordinates locations table e save kore
  // ==========================================
  static async saveLocation(reportId, locationData) {
    // Ei function report er sathe attached latitude, longitude ebong address save kore
    const { latitude, longitude, address } = locationData;
    const locationId = await db.insert(
      `INSERT INTO locations (report_id, latitude, longitude, address) VALUES (?, ?, ?, ?)`,
      [reportId, latitude, longitude, address || null]
    );
    return locationId;
  }

  // ==========================================
  // addEvidence — Upload kora image/video report_evidence table e store kore
  // ==========================================
  static async addEvidence(evidenceData) {
    // Ei function evidence image/video file path DB te save korbe
    const { report_id, file_type, file_path, original_name, file_size } = evidenceData;
    const evidenceId = await db.insert(
      `INSERT INTO report_evidence (report_id, file_type, file_path, original_name, file_size)
       VALUES (?, ?, ?, ?, ?)`,
      [report_id, file_type, file_path, original_name || null, file_size || null]
    );
    return evidenceId;
  }

  // ==========================================
  // getReportsByUserId — Specific user er nijer shob report list return kore (My Reports page)
  // ==========================================
  static async getReportsByUserId(userId) {
    // User nijer submitted shob reports dekhte parbe, chaile nijer anonymous status o dekhte parbe
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
  // getReportById — Single report er details ID diye return kore
  // ==========================================
  static async getReportById(reportId) {
    // Single report er information, location ar real user name fetch korbe
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
  // getEvidenceByReportId — Specific report er shob evidence files return kore
  // ==========================================
  static async getEvidenceByReportId(reportId) {
    // Report ID diye evidence list retrieve kore
    const evidence = await db.query(
      `SELECT * FROM report_evidence WHERE report_id = ?`,
      [reportId]
    );
    return evidence;
  }

  // ==========================================
  // getPublicReports — Shob public reports return kore, anonymous reports er user identity hide kore
  // ==========================================
  static async getPublicReports() {
    // Public community feed er jonno: Jodi report anonymous hoy, tobe user_id null ebong reporter_name 'Anonymous Citizen' hobe
    const reports = await db.query(
      `SELECT 
         r.id,
         CASE WHEN r.is_anonymous = 1 THEN NULL ELSE r.user_id END as user_id,
         r.title,
         r.description,
         r.category,
         r.harassment_type,
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
