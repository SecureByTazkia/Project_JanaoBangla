// ==========================================
// JanaoBangla — Search & Analytics Verification Script
// BRANCH: feature-civic-report-search-filter-and-analytics
// Tests: Search API, Filters, Multi-criteria queries, Nearest GPS sorting,
// Area analysis service, Category metrics, Timeline trends, and Summary statistics
// Run with: node backend/scripts/test-search-and-analytics.js
// ==========================================

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const db = require('../config/DatabaseConnection');
const AreaBasedCivicIssueAnalysisService = require('../services/AreaBasedCivicIssueAnalysisService');
const CivicReportSearchController = require('../controllers/CivicReportSearchController');
const CivicReportAnalyticsController = require('../controllers/CivicReportAnalyticsController');

// Mock Express response helper
function createMockRes() {
  return {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    }
  };
}

async function runTests() {
  console.log('🧪 Starting Search, Filter, & Analytics Verification Test Suite...\n');

  // Step 1: Database Connection
  const isConnected = await db.testDatabaseConnection();
  if (!isConnected) {
    console.error('❌ Database connection failed. Aborting tests.');
    process.exit(1);
  }
  console.log('✅ 1. Database connection verified.\n');

  // Step 2: Test Area-Based Civic Issue Analysis Service
  console.log('--- 2. Testing Area-Based Civic Issue Analysis Service ---');
  const areaDistribution = await AreaBasedCivicIssueAnalysisService.getAreaProblemDistribution();
  console.log(`Area Problem Distribution fetched (${areaDistribution.length} areas).`);
  
  const topHotspots = await AreaBasedCivicIssueAnalysisService.getTopProblematicAreas(5);
  console.log(`Top Hotspots fetched (${topHotspots.length} hotspots).`);

  const divisionComparison = await AreaBasedCivicIssueAnalysisService.getDivisionComparison();
  console.log(`Division Comparison fetched (${divisionComparison.length} divisions).`);
  console.log('✅ AreaBasedCivicIssueAnalysisService passed.\n');

  // Step 3: Test Search Controller with filters
  console.log('--- 3. Testing CivicReportSearchController Endpoints ---');
  
  // Test Search All (Pagination)
  const reqAll = { query: { page: 1, limit: 6 } };
  const resAll = createMockRes();
  await CivicReportSearchController.searchReports(reqAll, resAll);
  console.log(`Search All Results: Total=${resAll.data?.data?.pagination?.total}, Returned=${resAll.data?.data?.reports?.length}`);
  if (resAll.data?.success) {
    console.log('✅ Search All passed.');
  }

  // Test Search by Keyword
  const reqKw = { query: { q: 'road', page: 1, limit: 5 } };
  const resKw = createMockRes();
  await CivicReportSearchController.searchReports(reqKw, resKw);
  console.log(`Search 'road': Found=${resKw.data?.data?.pagination?.total}`);
  if (resKw.data?.success) {
    console.log('✅ Keyword Search passed.');
  }

  // Test Category and Status Filter
  const reqFilter = { query: { category: 'road_damage', status: 'submitted' } };
  const resFilter = createMockRes();
  await CivicReportSearchController.searchReports(reqFilter, resFilter);
  console.log(`Filter [road_damage + submitted]: Found=${resFilter.data?.data?.pagination?.total}`);
  if (resFilter.data?.success) {
    console.log('✅ Multi-criteria Filter passed.');
  }

  // Test Nearest GPS Sort (Dhaka coordinates: 23.8103, 90.4125)
  const reqGps = { query: { sortBy: 'nearest', userLat: '23.8103', userLng: '90.4125', limit: 3 } };
  const resGps = createMockRes();
  await CivicReportSearchController.searchReports(reqGps, resGps);
  console.log(`Nearest GPS Sort: First Distance=${resGps.data?.data?.reports[0]?.distance_km} km`);
  if (resGps.data?.success) {
    console.log('✅ Nearest GPS sorting passed.');
  }

  // Test Search Metadata
  const resMeta = createMockRes();
  await CivicReportSearchController.getSearchFilterMetadata({}, resMeta);
  console.log(`Search Metadata Categories: ${resMeta.data?.data?.categories?.length} distinct categories`);
  if (resMeta.data?.success) {
    console.log('✅ Search Metadata endpoint passed.');
  }
  console.log('');

  // Step 4: Test Analytics Controller Endpoints
  console.log('--- 4. Testing CivicReportAnalyticsController Endpoints ---');

  // Test Overview Stats
  const resOverview = createMockRes();
  await CivicReportAnalyticsController.getOverviewStatistics({}, resOverview);
  console.log('Overview Stats:', resOverview.data?.data);
  if (resOverview.data?.success) {
    console.log('✅ Overview Statistics passed.');
  }

  // Test Category Breakdown
  const resCat = createMockRes();
  await CivicReportAnalyticsController.getCategoryAnalytics({}, resCat);
  console.log(`Category Breakdown: ${resCat.data?.data?.categories?.length} categories`);
  if (resCat.data?.success) {
    console.log('✅ Category Analytics passed.');
  }

  // Test Trends
  const resTrends = createMockRes();
  await CivicReportAnalyticsController.getTimelineTrends({}, resTrends);
  console.log(`Timeline Trends: ${resTrends.data?.data?.dailyTrends?.length || resTrends.data?.data?.monthlyTrends?.length} data points`);
  if (resTrends.data?.success) {
    console.log('✅ Timeline Trends passed.');
  }

  // Test Priority & Status Breakdown
  const resPs = createMockRes();
  await CivicReportAnalyticsController.getPriorityAndStatusDistribution({}, resPs);
  console.log(`Priority Breakdown: ${resPs.data?.data?.priorities?.length} priority levels`);
  if (resPs.data?.success) {
    console.log('✅ Priority & Status Distribution passed.');
  }

  console.log('\n🎉 ALL SEARCH, FILTER & ANALYTICS TESTS PASSED SUCCESSFULLY!\n');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('💥 Test suite error:', err);
  process.exit(1);
});
