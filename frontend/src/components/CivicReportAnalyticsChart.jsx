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
  public_safety: '#6A1B9A',
  women_harassment: '#E91E63',
  extortion_chanda: '#FF6D00'
};

const CATEGORY_LABELS = {
  road_damage: 'Road Damage',
  garbage_waste: 'Garbage / Waste',
  street_light: 'Street Light',
  water_drainage: 'Water / Drainage',
  traffic_accident: 'Traffic / Accident',
  public_safety: 'Public Safety',
  women_harassment: 'Women Harassment',
  extortion_chanda: 'Illegal Money Collection / চাঁদাবাজি'
};

const PRIORITY_COLORS = {
  low: '#2E7D32',
  medium: '#FFB300',
  high: '#E65100',
  critical: '#D50032'
};

const TOOLTIP_STYLE = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: '10px',
  fontSize: '12px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
  padding: '10px 14px'
};

const CHART_CARD_STYLE = {
  background: '#fff',
  borderRadius: '16px',
  border: 'none',
  boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
  height: '100%'
};

const CHART_SECTION_LABEL = {
  fontSize: '0.68rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#94A3B8',
  marginBottom: '4px'
};

const CHART_TITLE_STYLE = {
  fontSize: '1.05rem',
  fontWeight: 700,
  color: '#1F2937',
  marginBottom: '4px',
  lineHeight: 1.3
};

const CHART_SUBTITLE_STYLE = {
  fontSize: '0.8rem',
  color: '#94A3B8',
  marginBottom: '0'
};

const DIVIDER_STYLE = {
  height: '1px',
  background: '#F1F5F9',
  margin: '14px 0 18px'
};

function ChartCard({ label, title, subtitle, children, id }) {
  return (
    <div id={id} style={CHART_CARD_STYLE}>
      <div style={{ padding: '22px 24px 0' }}>
        <div style={CHART_SECTION_LABEL}>{label}</div>
        <div style={CHART_TITLE_STYLE}>{title}</div>
        <p style={CHART_SUBTITLE_STYLE}>{subtitle}</p>
        <div style={DIVIDER_STYLE} />
      </div>
      <div style={{ padding: '0 10px 20px' }}>
        {children}
      </div>
    </div>
  );
}

const CustomDonutLabel = ({ cx, cy, total }) => (
  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
    <tspan x={cx} dy="-0.5em" style={{ fontSize: '1.5rem', fontWeight: 800, fill: '#1F2937' }}>{total}</tspan>
    <tspan x={cx} dy="1.6em" style={{ fontSize: '0.72rem', fill: '#94A3B8', fontWeight: 600 }}>TOTAL</tspan>
  </text>
);

function CivicReportAnalyticsChart({
  categoryData = [],
  timelineData = [],
  areaData = [],
  priorityData = []
}) {
  const formattedCategoryData = categoryData.map((item) => ({
    name: CATEGORY_LABELS[item.category] || item.category,
    solved: item.solved || 0,
    pending: item.pending || 0,
    total: item.total || 0,
    rate: item.resolutionRate || 0,
    color: CATEGORY_COLORS[item.category] || '#006A4E'
  }));

  const formattedPriorityData = priorityData.map((item) => ({
    name: (item.priority || '').charAt(0).toUpperCase() + (item.priority || '').slice(1),
    value: item.count || 0,
    color: PRIORITY_COLORS[item.priority] || '#64748B'
  }));

  const formattedAreaData = areaData.slice(0, 6).map((item) => ({
    area: item.areaName || item.division || 'Unknown',
    total: item.totalReports || item.totalIssues || 0,
    solved: item.solvedReports || item.solvedIssues || 0
  }));

  const priorityTotal = formattedPriorityData.reduce((sum, d) => sum + d.value, 0);

  const emptyState = (msg) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '280px', color: '#CBD5E1', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '2rem' }}>📭</span>
      <span style={{ fontSize: '0.85rem' }}>{msg}</span>
    </div>
  );

  return (
    <div className="civic-analytics-charts-container" id="civic-report-analytics-charts">
      <div className="row g-4 mb-4">

        {/* 1. Category Breakdown Bar Chart */}
        <div className="col-lg-7">
          <ChartCard
            id="chart-category"
            label="Category Analysis"
            title="📊 Civic Problems by Category"
            subtitle="Solved vs. pending civic issues across all reported categories"
          >
            {formattedCategoryData.length === 0 ? emptyState('No category data available') : (
              <div style={{ width: '100%', height: '340px' }}>
                <ResponsiveContainer>
                  <BarChart data={formattedCategoryData} margin={{ top: 10, right: 20, left: -5, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                      dataKey="name"
                      angle={-22}
                      textAnchor="end"
                      interval={0}
                      tick={{ fontSize: 11, fill: '#64748B', fontWeight: 500 }}
                      tickLine={false}
                      axisLine={{ stroke: '#E2E8F0' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#94A3B8' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#F8FAFC' }} />
                    <Legend
                      wrapperStyle={{ fontSize: '12px', paddingTop: '14px', color: '#64748B' }}
                    />
                    <Bar dataKey="solved" name="Solved Issues" fill="#006A4E" radius={[5, 5, 0, 0]} maxBarSize={32} />
                    <Bar dataKey="pending" name="Pending / In Progress" fill="#FFB300" radius={[5, 5, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        </div>

        {/* 2. Priority Donut Chart */}
        <div className="col-lg-5">
          <ChartCard
            id="chart-priority"
            label="Severity Breakdown"
            title="🚨 Issue Priority Distribution"
            subtitle="Proportion of reports categorized by severity level"
          >
            {formattedPriorityData.length === 0 ? emptyState('No priority data available') : (
              <>
                <div style={{ width: '100%', height: '260px' }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={formattedPriorityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={72}
                        outerRadius={108}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={2}
                        stroke="#fff"
                      >
                        {formattedPriorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <CustomDonutLabel cx="50%" cy="50%" total={priorityTotal} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legend */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', padding: '0 16px 4px' }}>
                  {formattedPriorityData.map((entry) => (
                    <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: entry.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
                        {entry.name} ({entry.value})
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </ChartCard>
        </div>

        {/* 3. Timeline Area Chart */}
        <div className="col-lg-7">
          <ChartCard
            id="chart-timeline"
            label="Activity Trend"
            title="📈 Reports Timeline Activity"
            subtitle="Submission volume and resolution progress over recent timeline"
          >
            {timelineData.length === 0 ? emptyState('No timeline data available') : (
              <div style={{ width: '100%', height: '320px' }}>
                <ResponsiveContainer>
                  <AreaChart data={timelineData} margin={{ top: 10, right: 20, left: -5, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2962FF" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2962FF" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#006A4E" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#006A4E" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#94A3B8' }}
                      tickLine={false}
                      axisLine={{ stroke: '#E2E8F0' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#94A3B8' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: '#64748B' }} />
                    <Area
                      type="monotone"
                      dataKey="submitted"
                      name="Submitted Reports"
                      stroke="#2962FF"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorSubmitted)"
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="solved"
                      name="Solved Reports"
                      stroke="#006A4E"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorSolved)"
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        </div>

        {/* 4. Area Density Horizontal Bar Chart */}
        <div className="col-lg-5">
          <ChartCard
            id="chart-area-density"
            label="Geographic Distribution"
            title="🗺️ Top Problem Density by Area"
            subtitle="Divisions and regions with highest reported civic volume"
          >
            {formattedAreaData.length === 0 ? emptyState('No area distribution data available') : (
              <div style={{ width: '100%', height: '320px' }}>
                <ResponsiveContainer>
                  <BarChart
                    layout="vertical"
                    data={formattedAreaData}
                    margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: '#94A3B8' }}
                      tickLine={false}
                      axisLine={{ stroke: '#E2E8F0' }}
                    />
                    <YAxis
                      type="category"
                      dataKey="area"
                      tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                      tickLine={false}
                      axisLine={false}
                      width={72}
                    />
                    <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#F8FAFC' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: '#64748B' }} />
                    <Bar dataKey="total" name="Total Issues" fill="#2962FF" radius={[0, 5, 5, 0]} maxBarSize={18} />
                    <Bar dataKey="solved" name="Resolved" fill="#006A4E" radius={[0, 5, 5, 0]} maxBarSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        </div>

      </div>
    </div>
  );
}

export default CivicReportAnalyticsChart;
