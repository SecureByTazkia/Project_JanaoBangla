// ==========================================
// JanaoBangla — CivicReportStatisticsCard Component
// BRANCH: feature-civic-report-search-filter-and-analytics
// Ei component ta civic platform er overall statistics metric cards render kore
// Total reports, solved rate, active issues, community verifications
// ==========================================

function CivicReportStatisticsCard({ statistics = {}, loading = false }) {
  const {
    totalReports = 0,
    solvedReports = 0,
    processingReports = 0,
    underReviewReports = 0,
    submittedReports = 0,
    totalVerifications = 0,
    activeReporters = 0,
    resolutionRate = 0
  } = statistics;

  const inProgressTotal = processingReports + underReviewReports + submittedReports;

  const statItems = [
    {
      id: 'stat-total-reports',
      title: 'Total Civic Reports',
      value: totalReports.toLocaleString(),
      icon: '📋',
      accentColor: '#006A4E',
      iconBg: '#C3E6DB',
      subtitle: 'Submitted across Bangladesh',
      showProgress: false
    },
    {
      id: 'stat-solved-reports',
      title: 'Solved Problems',
      value: solvedReports.toLocaleString(),
      icon: '✅',
      accentColor: '#2E7D32',
      iconBg: '#C8E6C9',
      subtitle: `${resolutionRate}% Resolution Rate`,
      showProgress: true
    },
    {
      id: 'stat-active-issues',
      title: 'Active / In Progress',
      value: inProgressTotal.toLocaleString(),
      icon: '⚙️',
      accentColor: '#FFB300',
      iconBg: '#FFF8E1',
      subtitle: `${submittedReports} Pending · ${processingReports} Processing`,
      showProgress: false
    },
    {
      id: 'stat-community-confirmations',
      title: 'Community Confirmations',
      value: totalVerifications.toLocaleString(),
      icon: '👥',
      accentColor: '#2962FF',
      iconBg: '#E8EAF6',
      subtitle: `${activeReporters} Active Citizen Reporters`,
      showProgress: false
    }
  ];

  return (
    <div className="row g-3 mb-4" id="civic-report-statistics-cards">
      {statItems.map((item) => (
        <div key={item.id} className="col-xl-3 col-md-6">
          <div
            id={item.id}
            className="h-100"
            style={{
              borderRadius: '14px',
              border: 'none',
              background: '#fff',
              boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
              overflow: 'hidden',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease',
              cursor: 'default'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.13)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)';
            }}
          >
            <div style={{ height: '4px', background: item.accentColor }} />
            <div style={{ padding: '20px 22px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.71rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.07em', lineHeight: 1.4 }}>
                  {item.title}
                </span>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: item.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.15rem', flexShrink: 0, marginLeft: '8px' }}>
                  {item.icon}
                </div>
              </div>
              {loading ? (
                <div className="placeholder-glow mb-2">
                  <span className="placeholder col-7 py-3 rounded"></span>
                </div>
              ) : (
                <div style={{ fontSize: '2.1rem', fontWeight: 800, color: item.accentColor, lineHeight: 1, marginBottom: '8px', letterSpacing: '-0.02em' }}>
                  {item.value}
                </div>
              )}
              <div style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 500, marginBottom: item.showProgress ? '10px' : 0 }}>
                {item.subtitle}
              </div>
              {item.showProgress && (
                <div style={{ height: '5px', borderRadius: '99px', background: '#E8F5E9', overflow: 'hidden' }}>
                  <div
                    role="progressbar"
                    aria-valuenow={resolutionRate}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    style={{ height: '100%', width: `${resolutionRate}%`, background: '#2E7D32', borderRadius: '99px', transition: 'width 0.6s ease' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CivicReportStatisticsCard;
