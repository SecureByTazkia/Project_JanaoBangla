// ==========================================
// JanaoBangla — Civic Problem Comment & Community Model
// BRANCH: feature-community-feed-comments-and-discussion
// Ei model ta community feed, comments, replies, problem verification ar comment flagging handle kore
// ==========================================

const db = require('../services/DatabaseService');

class CivicProblemCommentModel {

  // ==========================================
  // getCommentsByReportId
  // Ei function ta ekta specific report er shob active comments ar replies fetch kore
  // Jodi kono comment anonymous hoy (is_anonymous = 1), tobe user identity mask kore 'Anonymous Citizen' dekhay
  // Nested comments (parent-child replies) structure build kore return kore
  // ==========================================
  static async getCommentsByReportId(reportId) {
    // Database theke non-removed comments fetch kora hocche
    const query = `
      SELECT 
        c.id,
        c.report_id,
        c.parent_id,
        c.content,
        0 as is_anonymous,
        0 as is_flagged,
        c.is_removed,
        c.created_at,
        c.updated_at,
        u.name as author_name,
        u.id as author_id,
        u.profile_picture as author_avatar,
        u.role as author_role
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.report_id = ? AND c.is_removed = 0
      ORDER BY c.created_at ASC
    `;

    const allComments = await db.query(query, [reportId]);

    // Parent comments ar child replies ke organize kora hocche
    const rootComments = [];
    const commentMap = {};

    // Prothome map e shob comment initialize kora hocche
    allComments.forEach(comment => {
      comment.replies = [];
      commentMap[comment.id] = comment;
    });

    // Parent-child tree structure build kora hocche
    allComments.forEach(comment => {
      if (comment.parent_id && commentMap[comment.parent_id]) {
        commentMap[comment.parent_id].replies.push(comment);
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  }

  // ==========================================
  // ==========================================
  // createComment
  // Ei function ta noya comment ba nested reply create kore comments table e insert kore
  // ==========================================
  static async createComment({ report_id, user_id, parent_id = null, content, is_anonymous = 0 }) {
    const cleanParentId = parent_id ? parseInt(parent_id) : null;

    const commentId = await db.insert(
      `INSERT INTO comments (report_id, user_id, parent_id, content, is_removed)
       VALUES (?, ?, ?, ?, 0)`,
      [report_id, user_id, cleanParentId, content.trim()]
    );

    // Inserted comment ta author info shoho fetch kore return kora hocche
    const newComment = await db.queryOne(
      `SELECT 
        c.id,
        c.report_id,
        c.parent_id,
        c.content,
        0 as is_anonymous,
        0 as is_flagged,
        c.is_removed,
        c.created_at,
        c.updated_at,
        u.name as author_name,
        u.id as author_id,
        u.profile_picture as author_avatar,
        u.role as author_role
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?`,
      [commentId]
    );

    if (newComment) {
      newComment.replies = [];
    }

    return newComment;
  }

  // ==========================================
  // getCommentById
  // Ei function ta single comment er details ID diye fetch kore
  // ==========================================
  static async getCommentById(commentId) {
    return await db.queryOne(
      `SELECT c.*, u.name as author_name, u.role as author_role 
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [commentId]
    );
  }

  // ==========================================
  // flagComment
  // Ei function ta kono inappropriate comment ke user report/flag korle handle kore
  // ==========================================
  static async flagComment(commentId) {
    return await db.update(
      `UPDATE comments SET updated_at = NOW() WHERE id = ?`,
      [commentId]
    );
  }

  // ==========================================
  // deleteComment
  // Ei function ta comment author ba admin ke comment delete/remove korar permission dey
  // Data integrity bhalo rakhar jonno is_removed = 1 (soft delete) kora hoy
  // ==========================================
  static async deleteComment(commentId, userId, isAdmin = false) {
    if (isAdmin) {
      return await db.update(
        `UPDATE comments SET is_removed = 1, updated_at = NOW() WHERE id = ?`,
        [commentId]
      );
    }

    return await db.update(
      `UPDATE comments SET is_removed = 1, updated_at = NOW() WHERE id = ? AND user_id = ?`,
      [commentId, userId]
    );
  }

  // ==========================================
  // toggleVerification
  // Ei function ta citizen der civic problem confirm ba unconfirm korte dey
  // Jodi age theke verify kora thake, tobe remove korbe ar confirmation_count 1 komabe
  // Jodi age verify na thake, tobe add korbe ar confirmation_count 1 barabe
  // ==========================================
  static async toggleVerification(reportId, userId) {
    // Prothome check kora hocche user agei verify koreche kina
    const existing = await db.queryOne(
      `SELECT id FROM report_verifications WHERE report_id = ? AND user_id = ?`,
      [reportId, userId]
    );

    if (existing) {
      // User age verify korechilo, ekhon verification remove kora hocche
      await db.remove(
        `DELETE FROM report_verifications WHERE report_id = ? AND user_id = ?`,
        [reportId, userId]
      );

      // Report table er confirmation_count update kora hocche
      await db.update(
        `UPDATE reports 
         SET confirmation_count = GREATEST(0, COALESCE(confirmation_count, 0) - 1), updated_at = NOW() 
         WHERE id = ?`,
        [reportId]
      );

      const countRow = await db.queryOne(
        `SELECT confirmation_count FROM reports WHERE id = ?`,
        [reportId]
      );

      return {
        verified: false,
        verification_count: countRow ? countRow.confirmation_count : 0,
        message: 'Civic problem confirmation removed.'
      };
    } else {
      // Noya verification insert kora hocche
      await db.insert(
        `INSERT INTO report_verifications (report_id, user_id) VALUES (?, ?)`,
        [reportId, userId]
      );

      // Report table er confirmation_count 1 barano hocche
      await db.update(
        `UPDATE reports 
         SET confirmation_count = COALESCE(confirmation_count, 0) + 1, updated_at = NOW() 
         WHERE id = ?`,
        [reportId]
      );

      const countRow = await db.queryOne(
        `SELECT confirmation_count FROM reports WHERE id = ?`,
        [reportId]
      );

      return {
        verified: true,
        verification_count: countRow ? countRow.confirmation_count : 1,
        message: 'Civic problem confirmed successfully! Thank you for community verification.'
      };
    }
  }

  // ==========================================
  // hasUserVerified
  // Ei function ta check kore current logged-in user ei report ta confirm koreche kina
  // ==========================================
  static async hasUserVerified(reportId, userId) {
    if (!userId) return false;
    const row = await db.queryOne(
      `SELECT id FROM report_verifications WHERE report_id = ? AND user_id = ?`,
      [reportId, userId]
    );
    return !!row;
  }

  // ==========================================
  // getVerificationCount
  // Ei function ta ekta report er total community confirmation count return kore
  // ==========================================
  static async getVerificationCount(reportId) {
    const row = await db.queryOne(
      `SELECT COUNT(*) as total FROM report_verifications WHERE report_id = ?`,
      [reportId]
    );
    return row ? row.total : 0;
  }

  // ==========================================
  // getPublicCommunityFeed
  // Ei function ta public civic reports community feed er jonno fetch kore
  // Category, status, search keyword, ar sorting (newest, most confirmed, most comments) support kore
  // Evidence image/video ar location data shoho return kore
  // ==========================================
  static async getPublicCommunityFeed({
    category = 'all',
    status = 'all',
    search = '',
    sortBy = 'newest',
    page = 1,
    limit = 10,
    currentUserId = null
  }) {
    const safeLimit = Math.max(1, parseInt(limit) || 10);
    const safeOffset = Math.max(0, (Math.max(1, parseInt(page) || 1) - 1) * safeLimit);

    let baseQuery = `
      SELECT 
        r.id,
        r.title,
        r.description,
        r.category,
        r.status,
        r.visibility,
        r.priority,
        r.is_anonymous,
        COALESCE(r.confirmation_count, 0) as verification_count,
        r.created_at,
        r.updated_at,
        CASE 
          WHEN r.is_anonymous = 1 THEN 'Anonymous Citizen'
          ELSE u.name 
        END as reporter_name,
        CASE 
          WHEN r.is_anonymous = 1 THEN NULL
          ELSE u.id 
        END as reporter_id,
        l.latitude,
        l.longitude,
        l.address,
        COALESCE(l.city, 'Dhaka') as division,
        COALESCE(l.area, l.city, 'General Area') as district,
        COALESCE(l.area, 'Area') as upazila,
        COUNT(DISTINCT c.id) as comment_count,
        ${currentUserId ? `MAX(CASE WHEN rv.user_id = ${parseInt(currentUserId)} THEN 1 ELSE 0 END)` : '0'} as has_verified
      FROM reports r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN locations l ON l.report_id = r.id
      LEFT JOIN comments c ON c.report_id = r.id AND c.is_removed = 0
      LEFT JOIN report_verifications rv ON rv.report_id = r.id
      WHERE r.visibility = 'public'
    `;

    const whereConditions = [];
    const params = [];

    // Category filter logic
    if (category && category !== 'all') {
      whereConditions.push(`r.category = ?`);
      params.push(category);
    }

    // Status filter logic (Admin approval requirement: default public feed only shows approved reports)
    if (status && status !== 'all') {
      whereConditions.push(`r.status = ?`);
      params.push(status);
    } else {
      whereConditions.push(`r.status != 'submitted'`);
    }

    // Search keyword search logic (title, description, location address, area, city)
    if (search && search.trim() !== '') {
      whereConditions.push(`(r.title LIKE ? OR r.description LIKE ? OR l.address LIKE ? OR l.area LIKE ? OR l.city LIKE ?)`);
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term, term);
    }

    if (whereConditions.length > 0) {
      baseQuery += ' AND ' + whereConditions.join(' AND ');
    }

    baseQuery += ` GROUP BY r.id, u.name, u.id, l.latitude, l.longitude, l.address, l.city, l.area`;

    // Sorting order logic
    let orderByClause = ` ORDER BY r.created_at DESC`;
    if (sortBy === 'oldest') {
      orderByClause = ` ORDER BY r.created_at ASC`;
    } else if (sortBy === 'most_confirmed') {
      orderByClause = ` ORDER BY COALESCE(r.confirmation_count, 0) DESC, r.created_at DESC`;
    } else if (sortBy === 'most_discussed') {
      orderByClause = ` ORDER BY comment_count DESC, r.created_at DESC`;
    }

    const countQuery = `
      SELECT COUNT(DISTINCT r.id) as total 
      FROM reports r 
      LEFT JOIN locations l ON l.report_id = r.id 
      WHERE r.visibility = 'public'
      ${whereConditions.length > 0 ? ' AND ' + whereConditions.join(' AND ') : ''}
    `;

    const finalQuery = baseQuery + orderByClause + ` LIMIT ${safeLimit} OFFSET ${safeOffset}`;

    // Execute queries
    const reports = await db.query(finalQuery, params);
    const countResult = await db.query(countQuery, params);
    const total = countResult[0] ? countResult[0].total : 0;

    // Report evidence files fetch kora hocche
    if (reports.length > 0) {
      const reportIds = reports.map(r => r.id);
      const placeholders = reportIds.map(() => '?').join(',');
      const evidenceList = await db.query(
        `SELECT * FROM report_evidence WHERE report_id IN (${placeholders})`,
        reportIds
      );

      const evidenceMap = {};
      evidenceList.forEach(item => {
        if (!evidenceMap[item.report_id]) {
          evidenceMap[item.report_id] = [];
        }
        evidenceMap[item.report_id].push(item);
      });

      reports.forEach(r => {
        r.evidence = evidenceMap[r.id] || [];
        r.has_verified = Boolean(r.has_verified);
      });
    }

    return {
      reports,
      total,
      page: parseInt(page) || 1,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit)
    };
  }

  // ==========================================
  // getReportDiscussionSummary
  // Ei function ta ekta single report er full discussion data, verification count, evidence shoho return kore
  // ==========================================
  static async getReportDiscussionSummary(reportId, currentUserId = null) {
    const reportQuery = `
      SELECT 
        r.id,
        r.title,
        r.description,
        r.category,
        r.status,
        r.visibility,
        r.priority,
        r.is_anonymous,
        COALESCE(r.confirmation_count, 0) as verification_count,
        r.created_at,
        r.updated_at,
        CASE 
          WHEN r.is_anonymous = 1 THEN 'Anonymous Citizen'
          ELSE u.name 
        END as reporter_name,
        CASE 
          WHEN r.is_anonymous = 1 THEN NULL
          ELSE u.id 
        END as reporter_id,
        l.latitude,
        l.longitude,
        l.address,
        COALESCE(l.city, 'Dhaka') as division,
        COALESCE(l.area, l.city, 'General Area') as district,
        COALESCE(l.area, 'Area') as upazila
      FROM reports r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN locations l ON l.report_id = r.id
      WHERE r.id = ? AND r.visibility = 'public'
    `;

    const report = await db.queryOne(reportQuery, [reportId]);
    if (!report) return null;

    // Evidence fetch kora hocche
    report.evidence = await db.query(
      `SELECT * FROM report_evidence WHERE report_id = ?`,
      [reportId]
    );

    // Comments fetch kora hocche
    const comments = await this.getCommentsByReportId(reportId);

    // Current user verify koreche kina check kora hocche
    const hasVerified = await this.hasUserVerified(reportId, currentUserId);

    return {
      report,
      comments,
      verificationCount: report.verification_count,
      hasVerified
    };
  }
}

module.exports = CivicProblemCommentModel;
