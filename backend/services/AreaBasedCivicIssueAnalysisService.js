// ==========================================
// JanaoBangla — Area-Based Civic Issue Analysis Service
// BRANCH: feature-civic-report-search-filter-and-analytics
// Ei service ta area (division, district, upazila) onujayi civic problem aggregate ar analyze korbe
// Kon elakay kon problem beshi, resolution rate koto — sob ekhane calculate hoy
// ==========================================

const db = require('../config/DatabaseConnection');

// ==========================================
// getAreaProblemDistribution — Area/Division onujayi category breakdown analyze kora
// ==========================================
async function getAreaProblemDistribution() {
  // Area/Division wise civic problem count and breakdown fetch kora hocche
  // Database er l.city ba l.area theke elaka identify kora hocche
  const [rows] = await db.pool.query(
    `SELECT 
       COALESCE(NULLIF(l.city, ''), NULLIF(l.area, ''), 'General Area') AS area_name,
       r.category,
       COUNT(r.id) AS report_count,
       SUM(CASE WHEN r.status = 'solved' THEN 1 ELSE 0 END) AS solved_count,
       SUM(CASE WHEN r.status = 'processing' OR r.status = 'under_review' THEN 1 ELSE 0 END) AS pending_count
     FROM reports r
     LEFT JOIN locations l ON l.report_id = r.id
     WHERE r.visibility = 'public'
     GROUP BY COALESCE(NULLIF(l.city, ''), NULLIF(l.area, ''), 'General Area'), r.category
     ORDER BY report_count DESC`
  );

  // Data ke area-based nested structure e format kora hocche
  const areaMap = {};

  rows.forEach((row) => {
    const area = row.area_name;
    if (!areaMap[area]) {
      areaMap[area] = {
        areaName: area,
        totalReports: 0,
        solvedReports: 0,
        pendingReports: 0,
        categoryBreakdown: {}
      };
    }

    const count = parseInt(row.report_count, 10);
    const solved = parseInt(row.solved_count, 10);
    const pending = parseInt(row.pending_count, 10);

    areaMap[area].totalReports += count;
    areaMap[area].solvedReports += solved;
    areaMap[area].pendingReports += pending;
    areaMap[area].categoryBreakdown[row.category] = count;
  });

  // Array format e convert kora hocche charting er jonno
  const result = Object.values(areaMap).map((item) => ({
    ...item,
    resolutionRate: item.totalReports > 0 
      ? Math.round((item.solvedReports / item.totalReports) * 100) 
      : 0
  }));

  return result.sort((a, b) => b.totalReports - a.totalReports);
}

// ==========================================
// getTopProblematicAreas — Sobcheye beshi problem thaka top districts/areas identify kora
// Hotspot ranking calculate kore
// ==========================================
async function getTopProblematicAreas(limit = 6) {
  // Top affected districts/cities query kora hocche
  const [rows] = await db.pool.query(
    `SELECT 
       COALESCE(NULLIF(l.area, ''), NULLIF(l.city, ''), 'General Area') AS district_name,
       COALESCE(NULLIF(l.city, ''), 'Bangladesh') AS division_name,
       COUNT(r.id) AS total_issues,
       SUM(CASE WHEN r.status = 'solved' THEN 1 ELSE 0 END) AS solved_issues,
       SUM(CASE WHEN r.priority = 'high' OR r.priority = 'critical' OR r.priority = 'urgent' THEN 1 ELSE 0 END) AS critical_issues
     FROM reports r
     LEFT JOIN locations l ON l.report_id = r.id
     WHERE r.visibility = 'public'
     GROUP BY COALESCE(NULLIF(l.area, ''), NULLIF(l.city, ''), 'General Area'), COALESCE(NULLIF(l.city, ''), 'Bangladesh')
     ORDER BY total_issues DESC
     LIMIT ?`,
    [limit]
  );

  return rows.map((row) => ({
    district: row.district_name,
    division: row.division_name,
    totalIssues: parseInt(row.total_issues, 10),
    solvedIssues: parseInt(row.solved_issues, 10),
    criticalIssues: parseInt(row.critical_issues, 10),
    resolutionRate: row.total_issues > 0 
      ? Math.round((row.solved_issues / row.total_issues) * 100) 
      : 0
  }));
}

// ==========================================
// getDivisionComparison — Bangladesh er division comparative stats
// ==========================================
async function getDivisionComparison() {
  // Division comparison aggregate query — confirmation_count use kora hocche
  const [rows] = await db.pool.query(
    `SELECT 
       COALESCE(NULLIF(l.city, ''), 'Dhaka') AS division,
       COUNT(r.id) AS total_reports,
       SUM(CASE WHEN r.status = 'solved' THEN 1 ELSE 0 END) AS solved,
       SUM(CASE WHEN r.status = 'submitted' THEN 1 ELSE 0 END) AS submitted,
       SUM(CASE WHEN r.status = 'under_review' OR r.status = 'processing' THEN 1 ELSE 0 END) AS in_progress,
       AVG(COALESCE(r.confirmation_count, 0)) AS avg_verifications
     FROM reports r
     LEFT JOIN locations l ON l.report_id = r.id
     WHERE r.visibility = 'public'
     GROUP BY COALESCE(NULLIF(l.city, ''), 'Dhaka')
     ORDER BY total_reports DESC`
  );

  return rows.map((row) => ({
    division: row.division,
    totalReports: parseInt(row.total_reports, 10),
    solved: parseInt(row.solved, 10),
    submitted: parseInt(row.submitted, 10),
    inProgress: parseInt(row.in_progress, 10),
    avgVerifications: parseFloat(Number(row.avg_verifications || 0).toFixed(1))
  }));
}

module.exports = {
  getAreaProblemDistribution,
  getTopProblematicAreas,
  getDivisionComparison
};
