// ==========================================
// JanaoBangla — Duplicate Report Linking Service
// BRANCH: feature-duplicate-civic-problem-report-detection
// Ei service duplicate civic reports-gulo MySQL duplicate_links table
// ebong reports table er duplicate_of_id diye ekta arektar sathe link kore
// ==========================================

const db = require('./DatabaseService');

class DuplicateReportLinkingService {

  // ==========================================
  // linkReports — Duita report ke original ebong duplicate hisebe database e link kore
  // ==========================================
  static async linkReports({ originalId, duplicateId, similarityScore = null }) {
    // Ei function duplicate_links table e record insert kore ebong reports table update kore
    if (!originalId || !duplicateId) {
      throw new Error('Both originalId and duplicateId are required for linking.');
    }

    if (parseInt(originalId) === parseInt(duplicateId)) {
      throw new Error('Cannot link a report to itself.');
    }

    // 1. Check if original and duplicate reports exist in DB
    const originalReport = await db.queryOne(
      'SELECT id, title, duplicate_of AS duplicate_of_id FROM reports WHERE id = ?',
      [originalId]
    );
    const duplicateReport = await db.queryOne(
      'SELECT id, title, user_id FROM reports WHERE id = ?',
      [duplicateId]
    );

    if (!originalReport || !duplicateReport) {
      throw new Error('One or both reports do not exist.');
    }

    // Jodi original report-o arekta parent er duplicate hoy, tahole root parent er sathe link korbo
    const rootOriginalId = originalReport.duplicate_of_id || originalReport.id;

    // 2. Insert or update duplicate_links relationship
    const scoreVal = similarityScore ? parseFloat(similarityScore) : null;
    await db.query(
      `INSERT INTO duplicate_links (original_id, duplicate_id, similarity_score)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE similarity_score = VALUES(similarity_score)`,
      [rootOriginalId, duplicateId, scoreVal]
    );

    // 3. Update duplicate report flags in reports table
    await db.query(
      `UPDATE reports 
       SET is_duplicate = 1, duplicate_of = ? 
       WHERE id = ?`,
      [rootOriginalId, duplicateId]
    );

    return {
      success: true,
      originalId: rootOriginalId,
      duplicateId,
      similarityScore: scoreVal,
      message: `Report #${duplicateId} successfully linked as duplicate of Report #${rootOriginalId}.`
    };
  }

  // ==========================================
  // getLinkedReports — Ekta report er sathe linked shob duplicate reports fetch kore
  // ==========================================
  static async getLinkedReports(reportId) {
    // Ei function report ta parent hole tar shob children, ar child hole tar parent ebong siblings fetch kore
    const report = await db.queryOne(
      `SELECT r.id, r.title, r.is_duplicate, r.duplicate_of AS duplicate_of_id 
       FROM reports r WHERE r.id = ?`,
      [reportId]
    );

    if (!report) {
      return {
        isLinked: false,
        primaryReport: null,
        linkedDuplicates: []
      };
    }

    // Root parent ID nirdharon kora hocche
    const rootId = report.duplicate_of_id || report.id;

    // 1. Root / Primary report fetch kora
    const primaryReport = await db.queryOne(
      `SELECT 
         r.id, r.user_id, r.title, r.description, r.category, r.status,
         r.visibility, r.is_anonymous, COALESCE(r.confirmation_count, 0) AS verification_count, r.created_at,
         l.latitude, l.longitude, l.address,
         CASE WHEN r.is_anonymous = 1 THEN 'Anonymous Citizen' ELSE u.name END as reporter_name
       FROM reports r
       LEFT JOIN locations l ON l.report_id = r.id
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [rootId]
    );

    // 2. Sob linked child duplicate reports fetch kora
    const duplicates = await db.query(
      `SELECT 
         r.id, r.user_id, r.title, r.description, r.category, r.status,
         r.visibility, r.is_anonymous, COALESCE(r.confirmation_count, 0) AS verification_count, r.created_at,
         dl.similarity_score, dl.created_at as linked_at,
         l.latitude, l.longitude, l.address,
         CASE WHEN r.is_anonymous = 1 THEN 'Anonymous Citizen' ELSE u.name END as reporter_name
       FROM duplicate_links dl
       JOIN reports r ON dl.duplicate_id = r.id
       LEFT JOIN locations l ON l.report_id = r.id
       LEFT JOIN users u ON r.user_id = u.id
       WHERE dl.original_id = ?
       ORDER BY dl.similarity_score DESC, dl.created_at DESC`,
      [rootId]
    );

    const isCurrentReportPrimary = parseInt(reportId) === parseInt(rootId);

    return {
      isLinked: duplicates.length > 0 || Boolean(report.is_duplicate),
      currentReportId: parseInt(reportId),
      isPrimary: isCurrentReportPrimary,
      primaryReport: primaryReport || null,
      linkedDuplicates: duplicates || [],
      totalLinkedCount: duplicates.length
    };
  }

  // ==========================================
  // unlinkReport — Duplicate link remove kore ebong report ke independent kore dey
  // ==========================================
  static async unlinkReport(duplicateId, requestingUser = null) {
    // Ei function duplicate_links theke record delete kore ebong reports table er duplicate flag clear kore
    const report = await db.queryOne(
      'SELECT id, user_id, duplicate_of AS duplicate_of_id FROM reports WHERE id = ?',
      [duplicateId]
    );

    if (!report) {
      throw new Error('Report not found.');
    }

    // Permission check: owner or admin can unlink
    if (requestingUser) {
      const isOwner = requestingUser.id === report.user_id;
      const isAdmin = requestingUser.role === 'admin';
      if (!isOwner && !isAdmin) {
        throw new Error('Unauthorized to unlink this duplicate report.');
      }
    }

    const originalId = report.duplicate_of_id;

    // Delete link entry
    if (originalId) {
      await db.query(
        'DELETE FROM duplicate_links WHERE (original_id = ? AND duplicate_id = ?) OR duplicate_id = ?',
        [originalId, duplicateId, duplicateId]
      );
    } else {
      await db.query(
        'DELETE FROM duplicate_links WHERE duplicate_id = ?',
        [duplicateId]
      );
    }

    // Reset report duplicate flags
    await db.query(
      'UPDATE reports SET is_duplicate = 0, duplicate_of = NULL WHERE id = ?',
      [duplicateId]
    );

    return {
      success: true,
      duplicateId,
      message: `Report #${duplicateId} has been successfully unlinked and restored as an independent report.`
    };
  }

  // ==========================================
  // getAllDuplicateClusters — Admin / System dashboard er jonno shob duplicate clusters list kore
  // ==========================================
  static async getAllDuplicateClusters() {
    // Ei function system er shob duplicate groupings summary statistics shoho return kore
    const clusters = await db.query(
      `SELECT 
         dl.original_id,
         orig.title as original_title,
         orig.category as original_category,
         orig.status as original_status,
         COUNT(dl.duplicate_id) as total_duplicates,
         AVG(dl.similarity_score) as avg_similarity,
         MAX(dl.created_at) as latest_linked_at
       FROM duplicate_links dl
       JOIN reports orig ON dl.original_id = orig.id
       GROUP BY dl.original_id, orig.title, orig.category, orig.status
       ORDER BY total_duplicates DESC, latest_linked_at DESC`
    );

    return clusters;
  }
}

module.exports = DuplicateReportLinkingService;
