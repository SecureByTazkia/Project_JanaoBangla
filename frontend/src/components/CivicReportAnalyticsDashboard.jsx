// ==========================================
// JanaoBangla — CivicReportAnalyticsDashboard Component
// BRANCH: feature-civic-report-search-filter-and-analytics
// Main analytics dashboard — matches reference design with JanaoBangla theme
// Dark navy panel, stat cards, donut chart, line chart, most voted issues
// ==========================================

import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// ── Theme palette (JanaoBangla emerald green dashboard) ──────────────────────
const C = {
  bg:           '#021B14',
  panel:        '#062B20',
  card:         '#0A382A',
  cardBorder:   'rgba(0,201,138,0.2)',
  cardHover:    'rgba(0,201,138,0.12)',
  accent:       '#00C98A',
  accentDim:    'rgba(0,201,138,0.18)',
  accentGlow:   '0 0 18px rgba(0,201,138,0.3)',
  green:        '#006A4E',
  greenMid:     '#00956E',
  textPri:      '#F0F9F5',
  textSec:      '#94B8AC',
  textMut:      '#4A6B60',
  border:       'rgba(0,201,138,0.1)',
};

const CATEGORY_COLORS = [
  '#00C98A', '#FFB300', '#2962FF', '#00E5FF', '#FF1744', '#9C27B0', '#E91E63', '#FF6D00'
];

const CATEGORY_LABELS = {
  road_damage:      'Road Damage',
  garbage_waste:    'Garbage / Waste',
  street_light:     'Street Light',
  water_drainage:   'Water / Drainage',
  traffic_accident: 'Traffic / Accident',
  public_safety:    'Public Safety',
  women_harassment: 'Women Harassment',
  extortion_chanda: 'Illegal Money Collection / চাঁদাবাজি',
};

// ── Utility sub-components ───────────────────────────────────────────────────

// Skeleton shimmer block
function Shimmer({ w = '100%', h = 20, r = 6 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
      backgroundSize: '200% 100%',
      animation: 'dashShimmer 1.5s infinite linear',
    }} />
  );
}

// Top summary card
function StatCard({ id, icon, label, value, sub, loading }) {
  return (
    <div
      id={id}
      style={{
        flex: '1 1 180px',
        background: C.card,
        border: `1px solid ${C.cardBorder}`,
        borderRadius: 14,
        padding: '20px 22px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = C.accent;
        e.currentTarget.style.boxShadow = C.accentGlow;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = C.cardBorder;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.textSec, marginBottom: 6 }}>
          {label}
        </div>
        {loading ? (
          <Shimmer w={80} h={32} r={6} />
        ) : (
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: C.textPri, lineHeight: 1, marginBottom: 6, letterSpacing: '-0.03em' }}>
            {value}
          </div>
        )}
        <div style={{ fontSize: '0.74rem', color: C.textSec }}>{sub}</div>
      </div>
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: C.accentDim,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.15rem', flexShrink: 0,
      }}>
        {icon}
      </div>
    </div>
  );
}

// Section heading inside the panel
function SectionHead({ title, sub }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: '1rem', fontWeight: 700, color: C.textPri, marginBottom: 3 }}>{title}</div>
      <div style={{ fontSize: '0.76rem', color: C.textSec }}>{sub}</div>
    </div>
  );
}

// Empty state placeholder
function EmptyChart({ msg }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 220, gap: 8, color: C.textMut }}>
      <span style={{ fontSize: '2rem' }}>📭</span>
      <span style={{ fontSize: '0.82rem' }}>{msg}</span>
    </div>
  );
}

// Custom donut centre label
function DonutCentreLabel({ cx, cy, total }) {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
      <tspan x={cx} dy="-0.4em" style={{ fontSize: '1.45rem', fontWeight: 800, fill: C.textPri }}>{total}</tspan>
      <tspan x={cx} dy="1.5em" style={{ fontSize: '0.65rem', fontWeight: 600, fill: C.textSec }}>TOTAL</tspan>
    </text>
  );
}

// Recharts custom tooltip
function DarkTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: '#141E2E',
      border: `1px solid ${C.cardBorder}`,
      borderRadius: 10, padding: '10px 14px',
      fontSize: '0.78rem', color: C.textPri,
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    }}>
      {label && <div style={{ color: C.textSec, marginBottom: 6, fontWeight: 600 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < payload.length - 1 ? 4 : 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ color: C.textSec }}>{p.name}:</span>
          <span style={{ fontWeight: 700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Tab bar ─────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'overview',    label: 'Overview' },
  { key: 'categories', label: 'Categories' },
  { key: 'trends',     label: 'Trends' },
];

function TabBar({ active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
      {TABS.map(t => (
        <button
          key={t.key}
          id={`analytics-tab-${t.key}`}
          onClick={() => onChange(t.key)}
          style={{
            padding: '7px 18px',
            borderRadius: 8,
            border: active === t.key ? `1px solid ${C.accent}` : '1px solid transparent',
            background: active === t.key ? C.accentDim : 'transparent',
            color: active === t.key ? C.accent : C.textSec,
            fontSize: '0.82rem', fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={e => { if (active !== t.key) e.currentTarget.style.color = C.textPri; }}
          onMouseLeave={e => { if (active !== t.key) e.currentTarget.style.color = C.textSec; }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Most Voted Issues list ───────────────────────────────────────────────────
function MostVotedIssues({ categoryData, loading }) {
  const sorted = useMemo(() =>
    [...categoryData].sort((a, b) => (b.avgVerifications || 0) - (a.avgVerifications || 0)).slice(0, 5),
    [categoryData]
  );

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: '22px 24px',
    }}>
      <SectionHead
        title="🏆 Most Voted Issues"
        sub="Top issues by community votes"
      />
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => <Shimmer key={i} h={44} r={8} />)}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyChart msg="No vote data available yet" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sorted.map((item, idx) => {
            const label = CATEGORY_LABELS[item.category] || item.category;
            const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
            const maxVotes = sorted[0]?.avgVerifications || 1;
            const pct = Math.round(((item.avgVerifications || 0) / maxVotes) * 100);
            return (
              <div key={item.category} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '10px 12px', borderRadius: 10,
                background: 'rgba(255,255,255,0.025)',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,201,138,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
              >
                {/* Rank */}
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: idx === 0 ? C.accentDim : 'rgba(255,255,255,0.06)',
                  color: idx === 0 ? C.accent : C.textSec,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: 800, flexShrink: 0,
                }}>
                  {idx + 1}
                </div>
                {/* Label + bar */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.83rem', fontWeight: 600, color: C.textPri, marginBottom: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {label}
                  </div>
                  <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
                {/* Vote count */}
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: color, flexShrink: 0, minWidth: 40, textAlign: 'right' }}>
                  {(item.avgVerifications || 0).toFixed(1)} avg
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Overview tab content ─────────────────────────────────────────────────────
function OverviewContent({ categoryData, timelineData, loading }) {
  // Donut data
  const donutData = useMemo(() =>
    categoryData.map((item, i) => ({
      name: CATEGORY_LABELS[item.category] || item.category,
      value: item.total || 0,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    })),
    [categoryData]
  );
  const donutTotal = donutData.reduce((s, d) => s + d.value, 0);

  // Line data — use last 7 daily entries if available, else monthly
  const lineData = useMemo(() =>
    timelineData.slice(-7).map(d => ({
      date: d.date || d.month || '',
      Reports: d.submitted || 0,
    })),
    [timelineData]
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: 16, marginBottom: 16 }}>

      {/* ── Left: Issues by Category donut ── */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '22px 24px' }}>
        <SectionHead title="Issues by Category" sub="Distribution of reported issues" />

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 220 }}>
            <Shimmer w={180} h={180} r="50%" />
          </div>
        ) : donutData.length === 0 ? (
          <EmptyChart msg="No category data available" />
        ) : (
          <>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%" cy="50%"
                    innerRadius={68} outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={2}
                    stroke={C.card}
                  >
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                  <DonutCentreLabel cx="50%" cy="50%" total={donutTotal} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 12, justifyContent: 'center' }}>
              {donutData.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.7rem', color: C.textSec, whiteSpace: 'nowrap' }}>
                    {d.name}: {d.value}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Right: Daily Issue Reports line chart ── */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '22px 24px' }}>
        <SectionHead title="Daily Issue Reports" sub="Issues reported in the last 7 days" />

        {loading ? (
          <Shimmer w="100%" h={220} r={8} />
        ) : lineData.length === 0 ? (
          <EmptyChart msg="No timeline data available" />
        ) : (
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={lineData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.accent} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: C.textSec }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: C.textSec }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<DarkTooltip />} />
                <Line
                  type="monotone"
                  dataKey="Reports"
                  stroke={C.accent}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: C.accent, strokeWidth: 2, stroke: C.card }}
                  activeDot={{ r: 6, fill: C.accent, stroke: C.card, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Categories tab content ───────────────────────────────────────────────────
function CategoriesContent({ categoryData, loading }) {
  const formatted = useMemo(() =>
    categoryData.map((item, i) => ({
      name: CATEGORY_LABELS[item.category] || item.category,
      Solved: item.solved || 0,
      Pending: item.pending || 0,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    })),
    [categoryData]
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
      {/* Bar chart */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '22px 24px', gridColumn: '1 / -1' }}>
        <SectionHead title="📊 Category Breakdown" sub="Solved vs. pending issues across all categories" />
        {loading ? <Shimmer w="100%" h={280} r={8} /> : formatted.length === 0 ? <EmptyChart msg="No category data" /> : (
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={formatted} margin={{ top: 8, right: 16, left: -12, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: C.textSec }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} angle={-22} textAnchor="end" interval={0} height={60} />
                <YAxis tick={{ fontSize: 10, fill: C.textSec }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: C.textSec, paddingTop: 8 }} />
                <Bar dataKey="Solved" fill={C.accent} radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="Pending" fill="#FFB300" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Resolution rate cards */}
      {!loading && categoryData.map((item, i) => {
        const label = CATEGORY_LABELS[item.category] || item.category;
        const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
        return (
          <div key={item.category} style={{
            background: 'rgba(255,255,255,0.02)',
            border: `1px solid ${C.border}`,
            borderRadius: 12, padding: '16px 18px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: C.textPri }}>{label}</div>
              <span style={{ fontSize: '1rem', fontWeight: 800, color }}>{item.resolutionRate || 0}%</span>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${item.resolutionRate || 0}%`, background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.7rem', color: C.textSec }}>
              <span>Total: <strong style={{ color: C.textPri }}>{item.total}</strong></span>
              <span>Solved: <strong style={{ color: C.accent }}>{item.solved}</strong></span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Trends tab content ───────────────────────────────────────────────────────
function TrendsContent({ timelineData, loading }) {
  const monthlyData = useMemo(() =>
    timelineData.map(d => ({
      month: d.month || d.date || '',
      Submitted: d.submitted || 0,
      Solved: d.solved || 0,
    })),
    [timelineData]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
      {/* Area/line chart */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '22px 24px' }}>
        <SectionHead title="📈 Submission vs. Resolution Trend" sub="Monthly submitted and solved issue volumes" />
        {loading ? <Shimmer w="100%" h={280} r={8} /> : monthlyData.length === 0 ? <EmptyChart msg="No trend data available" /> : (
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={monthlyData} margin={{ top: 8, right: 20, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: C.textSec }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
                <YAxis tick={{ fontSize: 10, fill: C.textSec }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<DarkTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', color: C.textSec, paddingTop: 8 }} />
                <Line type="monotone" dataKey="Submitted" stroke="#2962FF" strokeWidth={2.5} dot={{ r: 3, fill: '#2962FF', stroke: C.card, strokeWidth: 2 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Solved" stroke={C.accent} strokeWidth={2.5} dot={{ r: 3, fill: C.accent, stroke: C.card, strokeWidth: 2 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
function CivicReportAnalyticsDashboard({
  overviewStats = {},
  categoryData = [],
  timelineData = [],
  areaData = [],
  topHotspots = [],
  divisionComparison = [],
  priorityData = [],
  loading = false,
  activeTab = 'overview',
  setActiveTab,
}) {
  const [localTab, setLocalTab] = useState('overview');
  const tab = setActiveTab ? activeTab : localTab;
  const changeTab = setActiveTab || setLocalTab;

  const openReports = (overviewStats.submittedReports || 0) + (overviewStats.underReviewReports || 0) + (overviewStats.processingReports || 0);

  return (
    <div id="civic-analytics-dashboard" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* ── Main panel (dark card) ── */}
      <div style={{
        background: C.panel,
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        padding: '28px 28px 32px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.55)',
      }}>

        {/* Panel header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: C.textPri, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Civic Issue Analytics
          </h2>
          <p style={{ fontSize: '0.78rem', color: C.textSec, margin: 0 }}>
            Visualize and analyze civic issue data and trends
          </p>
        </div>

        {/* ── 3 Stat cards ── */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
          <StatCard
            id="stat-card-total-issues"
            icon="📋"
            label="Total Issues"
            value={loading ? '—' : (overviewStats.totalReports || 0).toLocaleString()}
            sub="Across all categories"
            loading={loading}
          />
          <StatCard
            id="stat-card-total-votes"
            icon="👍"
            label="Total Votes"
            value={loading ? '—' : (overviewStats.totalVerifications || 0).toLocaleString()}
            sub="Community engagement"
            loading={loading}
          />
          <StatCard
            id="stat-card-open-reports"
            icon="⚙️"
            label="Open Reports"
            value={loading ? '—' : openReports.toLocaleString()}
            sub="Pending and in progress"
            loading={loading}
          />
          <StatCard
            id="stat-card-resolution-rate"
            icon="✅"
            label="Resolution Rate"
            value={loading ? '—' : `${overviewStats.resolutionRate || 0}%`}
            sub={`${(overviewStats.solvedReports || 0).toLocaleString()} issues solved`}
            loading={loading}
          />
        </div>

        {/* ── Tab navigation ── */}
        <TabBar active={tab} onChange={changeTab} />

        {/* ── Tab content ── */}
        {tab === 'overview' && (
          <OverviewContent
            categoryData={categoryData}
            timelineData={timelineData}
            loading={loading}
          />
        )}
        {tab === 'categories' && (
          <CategoriesContent
            categoryData={categoryData}
            loading={loading}
          />
        )}
        {tab === 'trends' && (
          <TrendsContent
            timelineData={timelineData}
            loading={loading}
          />
        )}

        {/* ── Most Voted Issues (always visible below tabs) ── */}
        <MostVotedIssues categoryData={categoryData} loading={loading} />

      </div>

      {/* Global keyframes */}
      <style>{`
        @keyframes dashShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export default CivicReportAnalyticsDashboard;
