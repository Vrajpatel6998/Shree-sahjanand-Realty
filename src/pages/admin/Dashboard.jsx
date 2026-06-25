import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiUsers, FiGlobe, FiDatabase, FiFileText } from 'react-icons/fi';
import './admin.css';

export default function Dashboard() {
  const { apiRequest, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const isReceptionist = user?.role === 'Receptionist';

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await apiRequest('/api/leads/summary');
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [apiRequest]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="contact-loader" style={{ width: '40px', height: '40px', borderColor: 'var(--admin-primary)', borderBottomColor: 'transparent' }}></div>
      </div>
    );
  }

  const data = metrics || {
    totalWebsite: 0,
    totalReception: 0,
    totalActiveStaff: 0,
    totalServices: 0,
    totalMonthlyInquiries: 0,
    totalPropertyCategories: 0,
    serviceDistribution: [],
    statusDistribution: [],
    recentActivities: [],
    recentLeads: [],
    dailyLeads: [],
  };

  // Mock standard daily data if none returned
  const chartData = data.dailyLeads && data.dailyLeads.length > 0
    ? data.dailyLeads.map(d => ({ label: new Date(d.date).toLocaleDateString([], { month: 'short', day: 'numeric' }), count: d.count }))
    : [
        { label: 'Mon', count: 4 },
        { label: 'Tue', count: 7 },
        { label: 'Wed', count: 5 },
        { label: 'Thu', count: 12 },
        { label: 'Fri', count: 8 },
        { label: 'Sat', count: 15 },
        { label: 'Sun', count: 10 }
      ];

  const barChartData = data.serviceDistribution && data.serviceDistribution.length > 0
    ? data.serviceDistribution
    : [
        { service: 'Residential', count: 25 },
        { service: 'Commercial', count: 18 },
        { service: 'Industrial', count: 8 },
        { service: 'Land', count: 12 },
        { service: 'Loans', count: 6 }
      ];

  // Custom SVG Line Chart Component
  const SVGLineChart = ({ points }) => {
    const width = 500;
    const height = 200;
    const padding = 30;
    const maxVal = Math.max(...points.map(p => p.count), 5);
    
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Generate coordinate pairs
    const coordinates = points.map((p, index) => {
      const x = padding + (index / (points.length - 1)) * chartWidth;
      const y = padding + chartHeight - (p.count / maxVal) * chartHeight;
      return { x, y, label: p.label, val: p.count };
    });

    const linePath = coordinates.reduce((path, curr, index) => {
      return index === 0 ? `M ${curr.x} ${curr.y}` : `${path} L ${curr.x} ${curr.y}`;
    }, '');

    // Area path for gradient fill
    const areaPath = coordinates.length > 0 
      ? `${linePath} L ${coordinates[coordinates.length - 1].x} ${height - padding} L ${coordinates[0].x} ${height - padding} Z`
      : '';

    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--admin-primary)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--admin-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
          <line
            key={i}
            x1={padding}
            y1={padding + r * chartHeight}
            x2={width - padding}
            y2={padding + r * chartHeight}
            stroke="var(--admin-border)"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
        ))}

        {/* Gradient fill */}
        {areaPath && <path d={areaPath} fill="url(#chartGrad)" />}
        
        {/* Connection line */}
        {linePath && <path d={linePath} fill="none" stroke="var(--admin-primary)" strokeWidth="3" />}
        
        {/* Scatter dots */}
        {coordinates.map((c, i) => (
          <g key={i}>
            <circle
              cx={c.x}
              cy={c.y}
              r="5"
              fill="var(--admin-accent)"
              stroke="var(--admin-bg-secondary)"
              strokeWidth="2"
            />
            {/* Tooltip value */}
            <text x={c.x} y={c.y - 10} textAnchor="middle" fontSize="10" fill="var(--admin-text-primary)" fontWeight="bold">
              {c.val}
            </text>
            {/* X-axis labels */}
            <text x={c.x} y={height - 10} textAnchor="middle" fontSize="9" fill="var(--admin-text-muted)">
              {c.label}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  // Custom SVG Bar Chart Component
  const SVGBarChart = ({ items }) => {
    const width = 500;
    const height = 200;
    const padding = 30;
    const maxVal = Math.max(...items.map(item => item.count), 5);
    
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const barWidth = (chartWidth / items.length) * 0.6;
    const gap = (chartWidth / items.length) * 0.4;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        {/* Horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
          <line
            key={i}
            x1={padding}
            y1={padding + r * chartHeight}
            x2={width - padding}
            y2={padding + r * chartHeight}
            stroke="var(--admin-border)"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
        ))}

        {items.map((item, index) => {
          const x = padding + index * (barWidth + gap) + gap / 2;
          const barHeight = (item.count / maxVal) * chartHeight;
          const y = padding + chartHeight - barHeight;
          const colors = [
            '#1a3c8e',
            '#00b4d8',
            '#8b5cf6',
            '#10b981',
            '#f59e0b',
            '#ef4444'
          ];
          const color = colors[index % colors.length];

          return (
            <g key={index}>
              {/* Animated Column Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                rx="4"
              />
              {/* Value Label */}
              <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fontSize="10" fill="var(--admin-text-primary)" fontWeight="bold">
                {item.count}
              </text>
              {/* Category Label */}
              <text
                x={x + barWidth / 2}
                y={height - 10}
                textAnchor="middle"
                fontSize="8"
                fill="var(--admin-text-muted)"
              >
                {item.service.split(' ')[0]}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div>
      <div className="admin-title-block">
        <div>
          <h2 className="admin-title-block__title">CRM Portal Dashboard</h2>
          <p className="admin-title-block__subtitle">
            Welcome back, {user.fullName}! Here is today's overview.
          </p>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="admin-analytics-grid">
        {!isReceptionist && (
          <>
            <div className="analytics-card">
              <div className="analytics-card__info">
                <span className="analytics-card__label">Website Inquiries</span>
                <span className="analytics-card__value">{data.totalWebsite}</span>
              </div>
              <div className="analytics-card__icon analytics-card__icon--primary">
                <FiGlobe />
              </div>
            </div>

            <div className="analytics-card">
              <div className="analytics-card__info">
                <span className="analytics-card__label">Reception Inquiries</span>
                <span className="analytics-card__value">{data.totalReception}</span>
              </div>
              <div className="analytics-card__icon analytics-card__icon--accent">
                <FiFileText />
              </div>
            </div>

            <div className="analytics-card">
              <div className="analytics-card__info">
                <span className="analytics-card__label">Active Staff Profiles</span>
                <span className="analytics-card__value">{data.totalActiveStaff}</span>
              </div>
              <div className="analytics-card__icon analytics-card__icon--success">
                <FiUsers />
              </div>
            </div>
          </>
        )}

        <div className="analytics-card">
          <div className="analytics-card__info">
            <span className="analytics-card__label">Monthly Submissions</span>
            <span className="analytics-card__value">{data.totalMonthlyInquiries}</span>
          </div>
          <div className="analytics-card__icon analytics-card__icon--warning">
            <FiDatabase />
          </div>
        </div>

      </div>

      {/* Charts section (Hidden for Receptionist) */}
      {!isReceptionist && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          {/* Daily leads line chart */}
          <div className="admin-card">
            <div className="admin-card__header">
              <span className="admin-card__title">Daily Inquiries (7-Day Trend)</span>
            </div>
            <div className="admin-card__body">
              <div className="svg-chart-container">
                <SVGLineChart points={chartData} />
              </div>
            </div>
          </div>

          {/* Service distribution bar chart */}
          <div className="admin-card">
            <div className="admin-card__header">
              <span className="admin-card__title">Inquiries by Service Category</span>
            </div>
            <div className="admin-card__body">
              <div className="svg-chart-container">
                <SVGBarChart items={barChartData} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Latest Lead Submissions list */}
      <div className="admin-card" style={{ width: '100%', marginBottom: '24px' }}>
        <div className="admin-card__header">
          <span className="admin-card__title">Latest Lead Submissions</span>
        </div>
        <div className="admin-card__body" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Lead Name</th>
                  <th>Service</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {data.recentLeads.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                      No leads registered yet.
                    </td>
                  </tr>
                ) : (
                  data.recentLeads.map((l) => (
                    <tr key={l.id}>
                      <td style={{ fontWeight: '600' }}>{l.name}</td>
                      <td>{l.service}</td>
                      <td>
                        <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: l.source === 'WEBSITE' ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)', color: l.source === 'WEBSITE' ? 'var(--admin-info)' : 'var(--admin-success)', fontWeight: '600' }}>
                          {l.source}
                        </span>
                      </td>
                      <td>
                        <span className={`status-tag status-tag--${l.status.toLowerCase().replace(/_/g, '')}`}>
                          {l.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>{new Date(l.date).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
