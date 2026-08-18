// ==========================================
// JanaoBangla — Civic Report Search & Filter Controller
// BRANCH: feature-civic-report-search-filter-and-analytics
// Ei controller ta civic problem report search, multi-criteria filter, ar sorting handle korbe
// Keyword, category, location, status, priority, nearest GPS sorting shob ekhane process hoy
// ==========================================

const db = require('../config/DatabaseConnection');

// ==========================================
// searchReports — Advanced Search, Filter, and Sort API
// GET /api/search
// ==========================================
async function searchReports(req, res) {
  try {
    const {
      q,              // Search query string (keyword)
      category,       // Category filter
      status,         // Status filter
      priority,       // Priority filter
      division,       // Division filter
      district,       // District filter
      startDate,      // Date range start
      endDate,        // Date range end
      minVerifications, // Minimum confirmations
      sortBy = 'newest', // newest, oldest, most_confirmed, highest_priority, nearest
      userLat,        // User current latitude for nearest sorting
      userLng,        // User current longitude for nearest sorting
      page = 1,       // Page number
      limit = 12      // Items per page
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const offset = (pageNum - 1) * limitNum;

    // Base WHERE conditions
    const whereConditions = ["r.visibility = 'public'"];
    const queryParams = [];

    // 1. Keyword search (Title, description, address, label, district, division)
    if (q && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      whereConditions.push(
        `(r.title LIKE ? OR r.description LIKE ? OR l.address LIKE ? OR l.label LIKE ? OR l.district LIKE ? OR l.division LIKE ?)`
      );
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // 2. Category filter
    if (category && category !== 'all') {
      whereConditions.push('r.category = ?');
      queryParams.push(category);
    }

    // 3. Status filter
    if (status && status !== 'all') {
      whereConditions.push('r.status = ?');
      queryParams.push(status);
    }

    // 4. Priority filter
    if (priority && priority !== 'all') {
      whereConditions.push('r.priority = ?');
      queryParams.push(priority);
    }

    // 5. Division filter
    if (division && division !== 'all') {
      whereConditions.push('(l.division = ? OR l.address LIKE ?)');
      queryParams.push(division, `%${division}%`);
    }

    // 6. District filter
    if (district && district !== 'all') {
      whereConditions.push('(l.district = ? OR l.address LIKE ?)');
      queryParams.push(district, `%${district}%`);
    }

    // 7. Date range filter
    if (startDate) {
      whereConditions.push('r.created_at >= ?');
      queryParams.push(`${startDate} 00:00:00`);
    }
    if (endDate) {
      whereConditions.push('r.created_at <= ?');
      queryParams.push(`${endDate} 23:59:59`);
    }

    // 8. Minimum confirmations / verifications
    if (minVerifications && !isNaN(parseInt(minVerifications, 10))) {
      whereConditions.push('r.verification_count >= ?');
      queryParams.push(parseInt(minVerifications, 10));
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total matching records for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT r.id) AS total
      FROM reports r
      LEFT JOIN locations l ON l.report_id = r.id
      ${whereClause}
    `;
    const [countResult] = await db.pool.query(countQuery, queryParams);
    const totalReports = countResult[0]?.total || 0;

    // Sorting Clause logic
    let orderByClause = 'ORDER BY r.created_at DESC';
    let selectDistance = '';

    const lat = parseFloat(userLat);
    const lng = parseFloat(userLng);
    const hasValidCoords = !isNaN(lat) && !isNaN(lng);

    if (hasValidCoords) {
      // Haversine formula calculation for distance in KM
      selectDistance = `, (6371 * acos(cos(radians(${lat})) * cos(radians(l.latitude)) * cos(radians(l.longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(l.latitude)))) AS distance_km`;
    }

    switch (sortBy) {
      case 'oldest':
        orderByClause = 'ORDER BY r.created_at ASC';
        break;
      case 'most_confirmed':
        orderByClause = 'ORDER BY r.verification_count DESC, r.created_at DESC';
        break;
      case 'highest_priority':
        orderByClause = `ORDER BY FIELD(r.priority, 'critical', 'high', 'medium', 'low'), r.created_at DESC`;
        break;
      case 'nearest':
        if (hasValidCoords) {
          orderByClause = 'ORDER BY distance_km ASC, r.created_at DESC';
        } else {
          orderByClause = 'ORDER BY r.created_at DESC';
        }
        break;
      case 'newest':
      default:
        orderByClause = 'ORDER BY r.created_at DESC';
        break;
    }

    // Fetch reports with location and evidence
    const fetchQuery = `
      SELECT 
        r.id,
        r.user_id,
        r.title,
        r.description,
        r.category,
        r.status,
        r.visibility,
        r.is_anonymous,
        r.priority,
        r.verification_count,
        r.is_duplicate,
        r.duplicate_of_id,
        r.created_at,
        r.updated_at,
        l.id AS location_id,
        l.label AS location_label,
        l.address AS location_address,
        l.division AS location_division,
        l.district AS location_district,
        l.upazila AS location_upazila,
        l.latitude,
        l.longitude,
        CASE WHEN r.is_anonymous = 1 THEN 'Anonymous Citizen' ELSE u.name END AS reporter_name
        ${selectDistance}
      FROM reports r
      LEFT JOIN locations l ON l.report_id = r.id
      LEFT JOIN users u ON r.user_id = u.id
      ${whereClause}
      ${orderByClause}
      LIMIT ? OFFSET ?
    `;

    const fetchParams = [...queryParams, limitNum, offset];
    const [reports] = await db.pool.query(fetchQuery, fetchParams);

    // Collect report IDs to fetch evidence attachments
    const reportIds = reports.map((rep) => rep.id);
    let evidenceMap = {};

    if (reportIds.length > 0) {
      const [evidenceRows] = await db.pool.query(
        `SELECT id, report_id, file_type, file_name, file_path, mime_type
         FROM report_evidence
         WHERE report_id IN (?)`,
        [reportIds]
      );

      evidenceRows.forEach((ev) => {
        if (!evidenceMap[ev.report_id]) {
          evidenceMap[ev.report_id] = [];
        }
        evidenceMap[ev.report_id].push(ev);
      });
    }

    // Format reports with attached evidence and distance
    const formattedReports = reports.map((rep) => ({
      ...rep,
      distance_km: rep.distance_km ? parseFloat(Number(rep.distance_km).toFixed(2)) : null,
      evidence: evidenceMap[rep.id] || []
    }));

    res.json({
      success: true,
      message: 'Reports search completed',
      data: {
        reports: formattedReports,
        pagination: {
          total: totalReports,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalReports / limitNum) || 1,
          hasNextPage: pageNum < Math.ceil(totalReports / limitNum),
          hasPrevPage: pageNum > 1
        },
        filtersApplied: {
          q: q || null,
          category: category || 'all',
          status: status || 'all',
          priority: priority || 'all',
          division: division || 'all',
          district: district || 'all',
          sortBy
        }
      }
    });
  } catch (error) {
    console.error('searchReports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search civic reports'
    });
  }
}

// ==========================================
// getSearchFilterMetadata — Filter options & distinct categories/locations fetch kora
// GET /api/search/metadata
// ==========================================
async function getSearchFilterMetadata(req, res) {
  try {
    // 1. Categories with report counts
    const [categoryCounts] = await db.pool.query(
      `SELECT category, COUNT(id) AS count
       FROM reports
       WHERE visibility = 'public'
       GROUP BY category`
    );

    // 2. Distinct divisions with counts
    const [divisionCounts] = await db.pool.query(
      `SELECT l.division, COUNT(r.id) AS count
       FROM reports r
       JOIN locations l ON l.report_id = r.id
       WHERE r.visibility = 'public' AND l.division IS NOT NULL AND l.division != ''
       GROUP BY l.division
       ORDER BY count DESC`
    );

    // 3. Status breakdown
    const [statusCounts] = await db.pool.query(
      `SELECT status, COUNT(id) AS count
       FROM reports
       WHERE visibility = 'public'
       GROUP BY status`
    );

    res.json({
      success: true,
      data: {
        categories: categoryCounts,
        divisions: divisionCounts,
        statuses: statusCounts
      }
    });
  } catch (error) {
    console.error('getSearchFilterMetadata error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch search filter metadata'
    });
  }
}

module.exports = {
  searchReports,
  getSearchFilterMetadata
};
