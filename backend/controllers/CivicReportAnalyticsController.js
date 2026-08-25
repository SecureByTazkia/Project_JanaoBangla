// ==========================================
// JanaoBangla — Civic Report Analytics Controller
// BRANCH: feature-civic-report-search-filter-and-analytics
// Ei controller ta civic report er overall statistics, category trends,
// timeline data, area analysis, ar priority-status breakdown provide kore
// ==========================================

const db = require('../config/DatabaseConnection');
const AreaBasedCivicIssueAnalysisService = require('../services/AreaBasedCivicIssueAnalysisService');

// ==========================================
// getOverviewStatistics — High-level summary metrics for analytics cards
// GET /api/analytics/overview
// ==========================================
async function getOverviewStatistics(req, res) {
  try {
    // 1. Reports counts and resolution stats
    // confirmation_count column safely aggregate kora hocche
    const [reportStats] = await db.pool.query(
      `SELECT 
         COUNT(*) AS total_reports,
         SUM(CASE WHEN status = 'solved' THEN 1 ELSE 0 END) AS solved_reports,
         SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) AS processing_reports,
         SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) AS under_review_reports,
         SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) AS submitted_reports,
         SUM(CASE WHEN is_duplicate = 1 THEN 1 ELSE 0 END) AS duplicate_reports,
         SUM(COALESCE(confirmation_count, 0)) AS total_verifications,
         AVG(COALESCE(confirmation_count, 0)) AS avg_verifications_per_report
       FROM reports`
    );

    // 2. Total active users contributing
    const [userStats] = await db.pool.query(
      `SELECT COUNT(DISTINCT user_id) AS active_reporters FROM reports`
    );

    // 3. Total emergency SOS requests (for cross-system health summary)
    const [sosStats] = await db.pool.query(
      `SELECT COUNT(*) AS total_sos FROM emergency_requests`
    );

    const stats = reportStats[0] || {};
    const total = parseInt(stats.total_reports || 0, 10);
    const solved = parseInt(stats.solved_reports || 0, 10);
    const resolutionRate = total > 0 ? Math.round((solved / total) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalReports: total,
        solvedReports: solved,
        processingReports: parseInt(stats.processing_reports || 0, 10),
        underReviewReports: parseInt(stats.under_review_reports || 0, 10),
        submittedReports: parseInt(stats.submitted_reports || 0, 10),
        duplicateReports: parseInt(stats.duplicate_reports || 0, 10),
        totalVerifications: parseInt(stats.total_verifications || 0, 10),
        avgVerifications: parseFloat(Number(stats.avg_verifications_per_report || 0).toFixed(1)),
        activeReporters: userStats[0]?.active_reporters || 0,
        totalSOSAlerts: sosStats[0]?.total_sos || 0,
        resolutionRate
      }
    });
  } catch (error) {
    console.error('getOverviewStatistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overview statistics'
    });
  }
}

// ==========================================
// getCategoryAnalytics — Category-wise distribution & resolution breakdown
// GET /api/analytics/categories
// ==========================================
async function getCategoryAnalytics(req, res) {
  try {
    const ALL_CATEGORIES = [
      'road_damage',
      'garbage_waste',
      'street_light',
      'water_drainage',
      'traffic_accident',
      'public_safety',
      'women_harassment',
      'extortion_chanda'
    ];

    const [rows] = await db.pool.query(
      `SELECT 
         category,
         COUNT(id) AS total,
         SUM(CASE WHEN status = 'solved' THEN 1 ELSE 0 END) AS solved,
         SUM(CASE WHEN status != 'solved' THEN 1 ELSE 0 END) AS pending,
         SUM(CASE WHEN priority IN ('critical', 'urgent', 'high') THEN 1 ELSE 0 END) AS high_priority_count,
         AVG(COALESCE(confirmation_count, 0)) AS avg_verifications
       FROM reports
       GROUP BY category`
    );

    const dbMap = new Map();
    rows.forEach((r) => {
      if (r.category) {
        dbMap.set(r.category, r);
      }
    });

    // Ensure all 8 categories are included in formatted list
    const formatted = ALL_CATEGORIES.map((catKey) => {
      const r = dbMap.get(catKey) || {};
      const total = parseInt(r.total || 0, 10);
      const solved = parseInt(r.solved || 0, 10);
      return {
        category: catKey,
        total,
        solved,
        pending: parseInt(r.pending || 0, 10),
        highPriority: parseInt(r.high_priority_count || 0, 10),
        avgVerifications: parseFloat(Number(r.avg_verifications || 0).toFixed(1)),
        resolutionRate: total > 0 ? Math.round((solved / total) * 100) : 0
      };
    });

    // Sort by total reports descending, preserving all 8 categories
    formatted.sort((a, b) => b.total - a.total);

    res.json({
      success: true,
      data: {
        categories: formatted
      }
    });
  } catch (error) {
    console.error('getCategoryAnalytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category analytics'
    });
  }
}

// ==========================================
// getTimelineTrends — Monthly & recent reports over time for line/area charts
// GET /api/analytics/trends
// ==========================================
async function getTimelineTrends(req, res) {
  try {
    // Last 6 months aggregate
    const [monthlyRows] = await db.pool.query(
      `SELECT 
         DATE_FORMAT(created_at, '%Y-%m') AS month_label,
         COUNT(id) AS total_submitted,
         SUM(CASE WHEN status = 'solved' THEN 1 ELSE 0 END) AS total_solved
       FROM reports
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month_label ASC`
    );

    // Recent 14 days aggregate
    const [dailyRows] = await db.pool.query(
      `SELECT 
         DATE_FORMAT(created_at, '%Y-%m-%d') AS date_label,
         COUNT(id) AS submitted,
         SUM(CASE WHEN status = 'solved' THEN 1 ELSE 0 END) AS solved
       FROM reports
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
       ORDER BY date_label ASC`
    );

    res.json({
      success: true,
      data: {
        monthlyTrends: monthlyRows.map((m) => ({
          month: m.month_label,
          submitted: parseInt(m.total_submitted, 10),
          solved: parseInt(m.total_solved, 10)
        })),
        dailyTrends: dailyRows.map((d) => ({
          date: d.date_label,
          submitted: parseInt(d.submitted, 10),
          solved: parseInt(d.solved, 10)
        }))
      }
    });
  } catch (error) {
    console.error('getTimelineTrends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timeline trends'
    });
  }
}

// ==========================================
// getAreaAnalytics — Area based analytics & problem distribution
// GET /api/analytics/areas
// ==========================================
async function getAreaAnalytics(req, res) {
  try {
    const [areaDistribution, topHotspots, divisionComparison] = await Promise.all([
      AreaBasedCivicIssueAnalysisService.getAreaProblemDistribution(),
      AreaBasedCivicIssueAnalysisService.getTopProblematicAreas(6),
      AreaBasedCivicIssueAnalysisService.getDivisionComparison()
    ]);

    res.json({
      success: true,
      data: {
        areaDistribution,
        topHotspots,
        divisionComparison
      }
    });
  } catch (error) {
    console.error('getAreaAnalytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch area-based analytics'
    });
  }
}

// ==========================================
// getPriorityAndStatusDistribution — Priority breakdown & Status funnel
// GET /api/analytics/priority-status
// ==========================================
async function getPriorityAndStatusDistribution(req, res) {
  try {
    // 1. Priority distribution
    const [priorityRows] = await db.pool.query(
      `SELECT priority, COUNT(id) AS count
       FROM reports
       GROUP BY priority`
    );

    // 2. Status distribution
    const [statusRows] = await db.pool.query(
      `SELECT status, COUNT(id) AS count
       FROM reports
       GROUP BY status`
    );

    res.json({
      success: true,
      data: {
        priorities: priorityRows.map((p) => ({
          priority: p.priority,
          count: parseInt(p.count, 10)
        })),
        statuses: statusRows.map((s) => ({
          status: s.status,
          count: parseInt(s.count, 10)
        }))
      }
    });
  } catch (error) {
    console.error('getPriorityAndStatusDistribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch priority and status distribution'
    });
  }
}

module.exports = {
  getOverviewStatistics,
  getCategoryAnalytics,
  getTimelineTrends,
  getAreaAnalytics,
  getPriorityAndStatusDistribution
};
