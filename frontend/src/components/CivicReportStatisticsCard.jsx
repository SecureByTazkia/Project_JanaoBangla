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
      color: '#006A4E',
      bgColor: '#E8F5F0',
      subtitle: 'Submitted across Bangladesh'
    },
    {
      id: 'stat-solved-reports',
      title: 'Solved Problems',
      value: solvedReports.toLocaleString(),
      icon: '✅',
      color: '#2E7D32',
      bgColor: '#E8F5E9',
      subtitle: `${resolutionRate}% Resolution Rate`
    },
    {
      id: 'stat-active-issues',
      title: 'Active / In Progress',
      value: inProgressTotal.toLocaleString(),
      icon: '⚙️',
      color: '#FFB300',
      bgColor: '#FFF8E1',
      subtitle: `${submittedReports} Submitted, ${processingReports} Processing`
    },
    {
      id: 'stat-community-confirmations',
      title: 'Community Confirmations',
      value: totalVerifications.toLocaleString(),
      icon: '👥',
      color: '#2962FF',
      bgColor: '#E8EAF6',
      subtitle: `${activeReporters} Active Citizen Reporters`
    }
  ];

  return (
    <div className="civic-statistics-cards-grid row g-3 mb-4" id="civic-report-statistics-cards">
      {statItems.map((item) => (
        <div key={item.id} className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-3 h-100 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small fw-semibold">{item.title}</span>
              <div
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: item.bgColor,
                  fontSize: '1.2rem'
                }}
              >
                {item.icon}
              </div>
            </div>

            {loading ? (
              <div className="placeholder-glow my-2">
                <span className="placeholder col-6 py-2"></span>
              </div>
            ) : (
              <h3 className="fw-bold mb-1" style={{ color: item.color }}>
                {item.value}
              </h3>
            )}

            <div className="text-muted small mt-auto">
              {item.subtitle}
            </div>

            {item.id === 'stat-solved-reports' && (
              <div className="progress mt-2" style={{ height: '6px' }}>
                <div
                  className="progress-bar bg-success"
                  role="progressbar"
                  style={{ width: `${resolutionRate}%` }}
                  aria-valuenow={resolutionRate}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default CivicReportStatisticsCard;
