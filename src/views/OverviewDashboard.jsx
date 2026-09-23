import { useState } from 'react';
import { DASHBOARD_SUMMARY, RECENT_ALERTS, ACTIVE_RINGS, CUSTOMERS, getCustomerById } from '../services/syntheticData.js';
import { getAllCases, getStatusLabel, getStatusClass } from '../services/caseState.js';
import { getRiskColor, getRiskLabel, getRiskClass } from '../services/riskEngine.js';

const FILTERS = ['All', 'Ring Detected', 'High Risk', 'Pending Review', 'Approved'];

const ALERT_ICONS = {
  ring: '⬡',
  evidence: '⬛',
  device: '◈',
  velocity: '▲',
  payment: '◆',
};

export default function OverviewDashboard({ onCaseSelect, onDemoClick }) {
  const [filter, setFilter] = useState('All');
  const cases = getAllCases();

  const filtered = cases.filter(c => {
    if (filter === 'All') return true;
    if (filter === 'Ring Detected') return c.ringId !== null;
    if (filter === 'High Risk') return c.finalRisk >= 60;
    if (filter === 'Pending Review') return c.status === 'pending_review' || c.status === 'under_investigation';
    if (filter === 'Approved') return c.status === 'approved';
    return true;
  });

  const fmt = (n) => n.toLocaleString('en-IN');
  const fmtCur = (n) => `₹${(n / 100000).toFixed(2)}L`;

  return (
    <div>
      {/* Page Header */}
      <div className="content-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="font-serif" style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--parchment-100)', letterSpacing: '0.04em' }}>
              Operations Overview
            </h1>
            <span className="badge badge-ring">3 Active Rings</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>
            Return fraud monitoring · Live analysis
          </div>
        </div>
        <button className="btn btn-investigate" onClick={onDemoClick} id="dashboard-demo-btn">
          ▶ Demo: Investigate Case PX-2047
        </button>
      </div>

      <div className="content-body">
        {/* KPI Grid */}
        <div className="grid grid-cols-6" style={{ gap: '12px', marginBottom: '24px' }}>
          <StatCard
            value={fmt(DASHBOARD_SUMMARY.totalReturnsAnalyzed)}
            label="Returns Analyzed"
            sub="Last 90 days"
            icon="📊"
            iconBg="rgba(37,99,235,0.08)"
          />
          <StatCard
            value={fmt(DASHBOARD_SUMMARY.suspiciousReturns)}
            label="Suspicious Returns"
            sub={`${((DASHBOARD_SUMMARY.suspiciousReturns / DASHBOARD_SUMMARY.totalReturnsAnalyzed) * 100).toFixed(1)}% of total`}
            icon="⚠"
            iconBg="rgba(180,83,9,0.1)"
            valueColor="var(--risk-medium)"
          />
          <StatCard
            value={fmt(DASHBOARD_SUMMARY.highRiskCases)}
            label="High-Risk Cases"
            sub="Requiring review"
            icon="🔺"
            iconBg="rgba(197,34,31,0.1)"
            valueColor="var(--risk-high)"
          />
          <StatCard
            value={fmt(DASHBOARD_SUMMARY.fraudRingsDetected)}
            label="Fraud Rings"
            sub="Coordinated activity"
            icon="⬡"
            iconBg="rgba(153,27,27,0.1)"
            valueColor="var(--risk-ring)"
          />
          <StatCard
            value={fmtCur(DASHBOARD_SUMMARY.potentialExposureINR)}
            label="Refund Exposure"
            sub="At risk value"
            icon="₹"
            iconBg="rgba(184,134,11,0.12)"
            valueColor="var(--brass-400)"
          />
          <StatCard
            value={fmt(DASHBOARD_SUMMARY.awaitingHumanReview)}
            label="Awaiting Review"
            sub="Human decision needed"
            icon="👁"
            iconBg="rgba(15,23,42,0.08)"
          />
        </div>

        {/* Main content grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', marginBottom: '20px' }}>

          {/* Left: Recent Returns Table */}
          <div className="card-dossier" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="section-title">Recent Suspicious Returns</div>
              {/* Filter tabs */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {FILTERS.map(f => (
                  <button
                    key={f}
                    className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ fontSize: '0.7rem', padding: '3px 10px' }}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Case ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Individual</th>
                    <th>Network</th>
                    <th>Final Risk</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 10).map(c => {
                    const customer = getCustomerById(c.customerId);
                    return (
                      <tr
                        key={c.id}
                        onClick={() => onCaseSelect(c.id)}
                        className={c.ringId ? 'row-ring' : ''}
                        id={`case-row-${c.id}`}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="code-tag">{c.id}</span>
                            {c.ringId && <span style={{ color: 'var(--risk-ring)', fontSize: '0.65rem', fontWeight: 700 }}>RING</span>}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{customer?.name || '—'}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{customer?.city}</div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.857rem' }}>
                          ₹{c.refundAmount?.toLocaleString('en-IN')}
                        </td>
                        <td>
                          <RiskPill score={c.individualRisk} />
                        </td>
                        <td>
                          <RiskPill score={c.networkRisk} />
                        </td>
                        <td>
                          <RiskPill score={c.finalRisk} bold />
                        </td>
                        <td>
                          <span className={`badge ${getStatusClass(c.status)}`}>
                            {getStatusLabel(c.status)}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {formatTime(c.returnRequestedAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Sidebar panels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Risk Distribution */}
            <div className="card" style={{ padding: '16px' }}>
              <div className="section-title" style={{ marginBottom: '14px' }}>Risk Distribution</div>
              {Object.entries(DASHBOARD_SUMMARY.riskDistribution).map(([key, pct]) => (
                <RiskDistRow key={key} level={key} pct={pct} />
              ))}
            </div>

            {/* Active Rings */}
            <div className="card" style={{ padding: '16px' }}>
              <div className="section-title" style={{ marginBottom: '12px' }}>Active Fraud Rings</div>
              {ACTIVE_RINGS.map(ring => (
                <div key={ring.id} className="card" style={{
                  padding: '10px 12px', marginBottom: '8px',
                  borderColor: ring.status === 'active' ? 'var(--risk-ring-border)' : 'var(--border-subtle)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{ring.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                        {ring.accounts} accounts · {ring.sharedDevices} shared devices · {ring.activityWindow}d window
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, color: getRiskColor(ring.risk), lineHeight: 1 }}>{ring.risk}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>risk</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    <span className={`badge ${ring.status === 'active' ? 'badge-ring' : 'badge-medium'}`}>
                      {ring.status === 'active' ? 'ACTIVE' : 'MONITORING'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                      ₹{(ring.totalExposure / 1000).toFixed(1)}K exposure
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Alerts */}
            <div className="card" style={{ padding: '16px' }}>
              <div className="section-title" style={{ marginBottom: '12px' }}>Recent Alerts</div>
              {RECENT_ALERTS.map(alert => (
                <div key={alert.id} style={{
                  display: 'flex', gap: '10px', padding: '8px 0',
                  borderBottom: '1px solid var(--border-dim)',
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: alert.severity === 'critical' ? 'var(--risk-ring-bg)' : alert.severity === 'high' ? 'var(--risk-high-bg)' : 'var(--risk-medium-bg)',
                    color: alert.severity === 'critical' ? 'var(--risk-ring)' : alert.severity === 'high' ? 'var(--risk-high)' : 'var(--risk-medium)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', flexShrink: 0,
                  }}>
                    {ALERT_ICONS[alert.type] || '●'}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>{alert.message}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <span className="code-tag">{alert.caseId}</span>
                      {' · '}
                      {formatTime(alert.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, sub, icon, iconBg, valueColor }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ background: iconBg }}>
        <span style={{ fontSize: '1rem' }}>{icon}</span>
      </div>
      <div className="stat-card-value" style={valueColor ? { color: valueColor } : {}}>
        {value}
      </div>
      <div className="stat-card-label">{label}</div>
      {sub && <div className="stat-card-sub">{sub}</div>}
    </div>
  );
}

function RiskPill({ score, bold }) {
  if (score === undefined || score === null) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
  const color = getRiskColor(score);
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
      fontWeight: bold ? 700 : 500,
      color,
    }}>
      {score}
    </span>
  );
}

function RiskDistRow({ level, pct }) {
  const labels = { low: 'Low Risk', medium: 'Medium Risk', high: 'High Risk', ring: 'Ring Detected' };
  const colors = {
    low: 'var(--risk-low)', medium: 'var(--risk-medium)',
    high: 'var(--risk-high)', ring: 'var(--risk-ring)',
  };
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{labels[level]}</span>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: colors[level], fontFamily: 'var(--font-mono)' }}>
          {pct}%
        </span>
      </div>
      <div className="risk-bar-track">
        <div className="risk-bar-fill" style={{ width: `${pct}%`, background: colors[level] }} />
      </div>
    </div>
  );
}

function formatTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
