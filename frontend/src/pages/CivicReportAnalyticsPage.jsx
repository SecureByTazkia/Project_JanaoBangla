// ==========================================
// JanaoBangla — CivicReportAnalyticsPage Page
// BRANCH: feature-civic-report-search-filter-and-analytics
// Comprehensive Civic Analytics & Statistics Dashboard
// Category breakdown, Area hotspots, Timeline activity, and Division comparisons
// ==========================================

import { useState, useEffect } from 'react';
import CivicReportStatisticsCard from '../components/CivicReportStatisticsCard';
import CivicReportAnalyticsChart from '../components/CivicReportAnalyticsChart';
import {
  getOverviewStatistics,
  getCategoryAnalytics,
  getTimelineTrends,
  getAreaAnalytics,
  getPriorityAndStatusDistribution
} from '../services/CivicReportAnalyticsService';

function CivicReportAnalyticsPage() {
  const [overviewStats, setOverviewStats] = useState({});
  const [categoryData, setCategoryData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [areaData, setAreaData] = useState([]);
  const [topHotspots, setTopHotspots] = useState([]);
  const [divisionComparison, setDivisionComparison] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==========================================
  // useEffect — Initial mount e shob analytics data parallel load kora
  // ==========================================
  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  // ==========================================
  // fetchAllAnalytics — Backend theke sob analytics endpoints parallel fetch kora
  // ==========================================
  const fetchAllAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        overviewRes,
        categoryRes,
        timelineRes,
        areaRes,
        priorityRes
      ] = await Promise.all([
        getOverviewStatistics(),
        getCategoryAnalytics(),
        getTimelineTrends(),
        getAreaAnalytics(),
        getPriorityAndStatusDistribution()
      ]);

      if (overviewRes.success) setOverviewStats(overviewRes.data || {});
      if (categoryRes.success) setCategoryData(categoryRes.data.categories || []);
      if (timelineRes.success) {
        setTimelineData(timelineRes.data.dailyTrends || timelineRes.data.monthlyTrends || []);
      }
      if (areaRes.success) {
        setAreaData(areaRes.data.areaDistribution || []);
        setTopHotspots(areaRes.data.topHotspots || []);
        setDivisionComparison(areaRes.data.divisionComparison || []);
      }
      if (priorityRes.success) setPriorityData(priorityRes.data.priorities || []);
    } catch (err) {
      console.error('Analytics load error:', err);
      setError(err.response?.data?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-content py-4" style={{ backgroundColor: '#F8FAFC', minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        
        {/* Page Header */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span style={{ fontSize: '1.8rem' }}>📊</span>
              <h1 className="fw-bold text-dark mb-0" style={{ fontSize: '1.8rem' }}>
                Civic Insights &amp; Analytics
              </h1>
            </div>
            <p className="text-secondary small mb-0">
              Evidence-based transparency: Real-time statistics, area-based problem density, and resolution performance across Bangladesh.
            </p>
          </div>

          <button
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 shadow-sm bg-white"
            onClick={fetchAllAnalytics}
            disabled={loading}
          >
            <span>🔄</span> Refresh Analytics
          </button>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small mb-4">
            {error}
          </div>
        )}

        {/* 1. Overall Statistics Metrics Cards */}
        <CivicReportStatisticsCard
          statistics={overviewStats}
          loading={loading}
        />

        {/* 2. Recharts Interactive Visualisations */}
        <CivicReportAnalyticsChart
          categoryData={categoryData}
          timelineData={timelineData}
          areaData={areaData}
          priorityData={priorityData}
        />

        {/* 3. Division Comparison & Hotspots Tables */}
        <div className="row g-4 mb-4">
          
          {/* Division Performance Breakdown */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
              <h5 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                <span>🇧🇩</span> Division-Wise Resolution Comparison
              </h5>
              <p className="text-secondary small mb-3">
                Tracking resolution rates and active caseload across Bangladesh's 8 administrative divisions.
              </p>

              {divisionComparison.length === 0 ? (
                <div className="text-center py-4 text-muted small">No division data available</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 small">
                    <thead className="table-light">
                      <tr>
                        <th>Division</th>
                        <th>Total Reports</th>
                        <th>Solved</th>
                        <th>In Progress</th>
                        <th>Resolution Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {divisionComparison.map((div) => {
                        const rate = div.totalReports > 0
                          ? Math.round((div.solved / div.totalReports) * 100)
                          : 0;
                        return (
                          <tr key={div.division}>
                            <td className="fw-bold text-dark">{div.division}</td>
                            <td>{div.totalReports}</td>
                            <td className="text-success fw-semibold">{div.solved}</td>
                            <td className="text-warning fw-semibold">{div.inProgress + div.submitted}</td>
                            <td style={{ minWidth: '130px' }}>
                              <div className="d-flex align-items-center gap-2">
                                <div className="progress flex-grow-1" style={{ height: '6px' }}>
                                  <div
                                    className="progress-bar bg-success"
                                    role="progressbar"
                                    style={{ width: `${rate}%` }}
                                  ></div>
                                </div>
                                <span className="text-muted fw-semibold" style={{ fontSize: '0.75rem', width: '32px' }}>
                                  {rate}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Top Problematic Hotspots */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
              <h5 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                <span>🔥</span> Top Civic Problem Hotspots
              </h5>
              <p className="text-secondary small mb-3">
                Districts with highest reported issue volume requiring municipal attention.
              </p>

              {topHotspots.length === 0 ? (
                <div className="text-center py-4 text-muted small">No hotspot data available</div>
              ) : (
                <div className="list-group list-group-flush">
                  {topHotspots.map((spot, index) => (
                    <div
                      key={spot.district}
                      className="list-group-item px-0 py-2 d-flex align-items-center justify-content-between border-bottom"
                    >
                      <div className="d-flex align-items-center gap-3">
                        <span
                          className="badge rounded-circle p-2 text-white"
                          style={{
                            backgroundColor: index === 0 ? '#FF1744' : index === 1 ? '#E65100' : '#006A4E',
                            width: '28px',
                            height: '28px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem'
                          }}
                        >
                          {index + 1}
                        </span>
                        <div>
                          <div className="fw-bold text-dark">{spot.district}</div>
                          <small className="text-muted">{spot.division} Division</small>
                        </div>
                      </div>

                      <div className="text-end">
                        <span className="badge bg-light text-dark border px-2 py-1">
                          {spot.totalIssues} Issues
                        </span>
                        {spot.criticalIssues > 0 && (
                          <div className="text-danger small" style={{ fontSize: '0.7rem' }}>
                            {spot.criticalIssues} High Priority
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}

export default CivicReportAnalyticsPage;
