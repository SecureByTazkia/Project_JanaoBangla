// ==========================================
// JanaoBangla — CivicReportAnalyticsChart Component
// BRANCH: feature-civic-report-search-filter-and-analytics
// Recharts-based interactive visualisations for category distribution,
// timeline trends, area problem breakdowns, and priority ratios
// ==========================================

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

const CATEGORY_COLORS = {
  road_damage: '#006A4E',
  garbage_waste: '#FFB300',
  street_light: '#2962FF',
  water_drainage: '#00838F',
  traffic_accident: '#FF1744',
  public_safety: '#6A1B9A'
};

const CATEGORY_LABELS = {
  road_damage: 'Road Damage',
  garbage_waste: 'Garbage & Waste',
  street_light: 'Street Light',
  water_drainage: 'Water / Drainage',
  traffic_accident: 'Traffic / Accident',
  public_safety: 'Public Safety'
};

const PRIORITY_COLORS = {
  low: '#2E7D32',
  medium: '#FFB300',
  high: '#E65100',
  critical: '#D50032'
};

function CivicReportAnalyticsChart({
  categoryData = [],
  timelineData = [],
  areaData = [],
  priorityData = []
}) {
  // Format category data for chart
  const formattedCategoryData = categoryData.map((item) => ({
    name: CATEGORY_LABELS[item.category] || item.category,
    solved: item.solved || 0,
    pending: item.pending || 0,
    total: item.total || 0,
    rate: item.resolutionRate || 0,
    color: CATEGORY_COLORS[item.category] || '#006A4E'
  }));

  // Format priority data for pie chart
  const formattedPriorityData = priorityData.map((item) => ({
    name: (item.priority || '').toUpperCase(),
    value: item.count || 0,
    color: PRIORITY_COLORS[item.priority] || '#64748B'
  }));

  // Format division area data
  const formattedAreaData = areaData.slice(0, 6).map((item) => ({
    area: item.areaName || item.division || 'Unknown',
    total: item.totalReports || item.totalIssues || 0,
    solved: item.solvedReports || item.solvedIssues || 0
  }));

  return (
    <div className="civic-analytics-charts-container" id="civic-report-analytics-charts">
      <div className="row g-4 mb-4">
        
        {/* 1. Category Problem Breakdown (Bar Chart) */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
            <h5 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
              <span>📊</span> Civic Problems by Category
            </h5>
            <p className="text-secondary small mb-3">
              Distribution of solved vs. pending civic issues across all reported categories.
            </p>

            {formattedCategoryData.length === 0 ? (
              <div className="text-center py-5 text-muted">No category data available</div>
            ) : (
              <div style={{ width: '100%', height: '320px' }}>
                <ResponsiveContainer>
                  <BarChart data={formattedCategoryData} margin={{ top: 20, right: 20, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis
                      dataKey="name"
                      angle={-20}
                      textAnchor="end"
                      interval={0}
                      tick={{ fontSize: 11, fill: '#64748B' }}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="solved" name="Solved Issues" fill="#006A4E" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending" name="Pending / In Progress" fill="#FFB300" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* 2. Priority Distribution (Donut / Pie Chart) */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
            <h5 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
              <span>🚨</span> Issue Priority Distribution
            </h5>
            <p className="text-secondary small mb-3">
              Proportion of reports categorized by severity level.
            </p>

            {formattedPriorityData.length === 0 ? (
              <div className="text-center py-5 text-muted">No priority data available</div>
            ) : (
              <div style={{ width: '100%', height: '320px' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={formattedPriorityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {formattedPriorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* 3. Timeline Trends (Area Chart) */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
            <h5 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
              <span>📈</span> Reports Timeline Activity
            </h5>
            <p className="text-secondary small mb-3">
              Submission volume and resolution progress over recent timeline.
            </p>

            {timelineData.length === 0 ? (
              <div className="text-center py-5 text-muted">No timeline data available</div>
            ) : (
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer>
                  <AreaChart data={timelineData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2962FF" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2962FF" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#006A4E" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#006A4E" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area
                      type="monotone"
                      dataKey="submitted"
                      name="Submitted Reports"
                      stroke="#2962FF"
                      fillOpacity={1}
                      fill="url(#colorSubmitted)"
                    />
                    <Area
                      type="monotone"
                      dataKey="solved"
                      name="Solved Reports"
                      stroke="#006A4E"
                      fillOpacity={1}
                      fill="url(#colorSolved)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* 4. Area / Division Comparison (Horizontal Bar Chart) */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
            <h5 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
              <span>🗺️</span> Top Problem Density by Area
            </h5>
            <p className="text-secondary small mb-3">
              Divisions and regions with highest reported civic volume.
            </p>

            {formattedAreaData.length === 0 ? (
              <div className="text-center py-5 text-muted">No area distribution data available</div>
            ) : (
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer>
                  <BarChart
                    layout="vertical"
                    data={formattedAreaData}
                    margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis type="category" dataKey="area" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="total" name="Total Issues" fill="#2962FF" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="solved" name="Resolved" fill="#006A4E" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default CivicReportAnalyticsChart;
