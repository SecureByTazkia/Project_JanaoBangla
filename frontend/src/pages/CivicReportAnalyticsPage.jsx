// ==========================================
// JanaoBangla — CivicReportAnalyticsPage Page
// BRANCH: feature-civic-report-search-filter-and-analytics
// Comprehensive Civic Analytics & Statistics Dashboard
// Dark dashboard layout — JanaoBangla theme
// ==========================================

import { useState, useEffect } from 'react';
import CivicReportAnalyticsDashboard from '../components/CivicReportAnalyticsDashboard';
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
  const [activeTab, setActiveTab] = useState('overview');

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
    <main
      id="civic-analytics-page"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #021B14 0%, #062B20 45%, #031711 100%)',
        paddingBottom: '60px',
        fontFamily: "'Inter', 'Segoe UI', sans-serif"
      }}
    >
      {/* ── Page Header ── */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(0,106,78,0.25) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(0,201,138,0.12)',
        padding: '28px 32px 24px'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #006A4E 0%, #00956E 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.15rem', boxShadow: '0 4px 18px rgba(0,106,78,0.4)', flexShrink: 0
                }}>
                  📊
                </div>
                <div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#00C98A', marginBottom: '2px' }}>
                    JanaoBangla Dashboard
                  </div>
                  <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#FFFFFF', margin: 0, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                    Civic Insights &amp; Analytics
                  </h1>
                </div>
              </div>
              <p style={{ color: '#A0B8AF', fontSize: '0.84rem', margin: '0 0 0 52px', maxWidth: '480px', lineHeight: 1.6 }}>
                Evidence-based transparency: Real-time statistics, area-based problem density, and resolution performance across Bangladesh.
              </p>
            </div>
            <button
              id="btn-refresh-analytics"
              onClick={fetchAllAnalytics}
              disabled={loading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 22px',
                border: '1px solid rgba(0,149,110,0.35)',
                borderRadius: '10px',
                background: 'rgba(0,106,78,0.15)',
                color: '#00C98A',
                fontSize: '0.83rem', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.18s ease',
                whiteSpace: 'nowrap',
                opacity: loading ? 0.6 : 1,
                backdropFilter: 'blur(8px)'
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = 'rgba(0,106,78,0.3)'; e.currentTarget.style.borderColor = '#00956E'; }}}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,106,78,0.15)'; e.currentTarget.style.borderColor = 'rgba(0,149,110,0.35)'; }}
            >
              <span style={{ fontSize: '0.95rem', display: 'inline-block', animation: loading ? 'analyticsSpin 1s linear infinite' : 'none' }}>🔄</span>
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Dashboard Content ── */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '28px 32px 0' }}>

        {error && (
          <div style={{
            background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)',
            borderRadius: '10px', padding: '12px 16px', marginBottom: '24px',
            color: '#F87171', fontSize: '0.83rem', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            ⚠️ {error}
          </div>
        )}

        <CivicReportAnalyticsDashboard
          overviewStats={overviewStats}
          categoryData={categoryData}
          timelineData={timelineData}
          areaData={areaData}
          topHotspots={topHotspots}
          divisionComparison={divisionComparison}
          priorityData={priorityData}
          loading={loading}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

      </div>

      <style>{`
        @keyframes analyticsSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}

export default CivicReportAnalyticsPage;
