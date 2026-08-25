// ==========================================
// JanaoBangla — Civic Problem Report Model
// BRANCH: civic-problem-reporting-visibility-and-management
// Actual database schema onujayi sob query likha hoyeche
// reports table e location_id nei — locations table directly report_id use kore
// ==========================================

const db = require('../services/DatabaseService');

class CivicProblemReportModel {

  // Ei function natun civic report create kore reports table e insert korbe
  // reports table: id, user_id, title, description, category, status, visibility, priority, is_duplicate, duplicate_of, confirmation_count, created_at, updated_at
  static async createReport(reportData) {
    const {
      user_id,
      title,
      description,
      category,
      visibility,
      is_anonymous,
      is_duplicate,
      duplicate_of_id,
      harassment_type
    } = reportData;

    const harassmentVal = (category === 'women_harassment' && harassment_type) ? harassment_type : null;

    const reportId = await db.insert(
      `INSERT INTO reports (user_id, title, description, category, harassment_type, visibility, is_anonymous, is_duplicate, duplicate_of, status, priority, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', 'medium', 0)`,
      [
        user_id,
        title,
        description,
        category,
        harassmentVal,
        visibility || 'public',
        is_anonymous ? 1 : 0,
        is_duplicate ? 1 : 0,
        duplicate_of_id || null
      ]
    );
    return reportId;
  }

  // Ei function GPS location data locations table e save korbe
  // locations table: id, report_id, latitude, longitude, address, area, city, created_at
  static async saveLocation(reportId, locationData) {
    const { latitude, longitude, address } = locationData;
    // locations table e report_id diye location insert kora hocche
    const locationId = await db.insert(
      `INSERT INTO locations (report_id, latitude, longitude, address) VALUES (?, ?, ?, ?)`,
      [reportId, latitude, longitude, address || null]
    );
    return locationId;
  }

  // Ei function uploaded file er metadata report_evidence table e save korbe
  // report_evidence table: id, report_id, file_type, file_path, original_name, file_size, created_at
  static async addEvidence(evidenceData) {
    const { report_id, file_type, file_path, original_name, file_size } = evidenceData;
    // report_evidence table e actual column names onujayi insert hobe
    const evidenceId = await db.insert(
      `INSERT INTO report_evidence (report_id, file_type, file_path, original_name, file_size)
       VALUES (?, ?, ?, ?, ?)`,
      [report_id, file_type, file_path, original_name || null, file_size || null]
    );
    return evidenceId;
  }

  // Ei function specific user er shob report gulo return korbe (My Reports page er jonno)
  static async getReportsByUserId(userId) {
    // user_id diye filter, location LEFT JOIN kora hocche
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

  // Ei function id diye ekta specific report er full details return korbe
  static async getReportById(reportId) {
    // report er sathe location ar reporter name JOIN kora hocche
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

  // Ei function ekta report er shob evidence files return korbe
  static async getEvidenceByReportId(reportId) {
    // report_id diye filter kore evidence list return hobe
    const evidence = await db.query(
      `SELECT * FROM report_evidence WHERE report_id = ?`,
      [reportId]
    );
    return evidence;
  }

  // Ei function shob public report return korbe (community feed er jonno)
  // Shudhumatro admin accept kora reports (status != 'submitted') public feed e show korbe
  static async getPublicReports() {
    // visibility = 'public' filter ebong (is_published = 1 OR status != 'submitted'), location ar user name shoho asbe
    const reports = await db.query(
      `SELECT r.*, l.latitude, l.longitude, l.address, u.name as reporter_name
       FROM reports r
       LEFT JOIN locations l ON l.report_id = r.id
       JOIN users u ON r.user_id = u.id
       WHERE r.visibility = 'public' AND (r.is_published = 1 OR r.status != 'submitted')
       ORDER BY r.created_at DESC`,
      []
    );
    return reports;
  }
}

module.exports = CivicProblemReportModel;
