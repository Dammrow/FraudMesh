import { useState } from 'react';

const NAV_ITEMS = [
  { path: '/', icon: GridIcon, label: 'Overview' },
  { path: '/investigation', icon: SearchIcon, label: 'Investigation' },
  { path: '/network', icon: NetworkIcon, label: 'Fraud Network' },
  { path: '/case', icon: FileIcon, label: 'Case File' },
  { path: '/review', icon: GavelIcon, label: 'Human Review' },
  { path: '/audit', icon: ShieldIcon, label: 'Audit Trail' },
];

export default function Navbar({ activePath, onNavigate, onDemoClick }) {
  const [status] = useState({ active: true, casesLive: 3 });

  return (
    <nav className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <HexIcon />
          <div>
            <div className="sidebar-logo-title">PARALLAX</div>
            <div className="sidebar-logo-subtitle">Return Fraud Intelligence</div>
          </div>
        </div>
        {/* Live status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--risk-low)', display: 'inline-block',
            boxShadow: '0 0 6px var(--risk-low)',
            animation: 'pulse-ring 2s ease-in-out infinite',
          }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
            MONITORING LIVE · {status.casesLive} RINGS
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
        <div className="nav-section-label">Investigation</div>
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
          <button
            key={path}
            className={`nav-item${activePath === path ? ' active' : ''}`}
            onClick={() => onNavigate(path)}
            id={`nav-${label.toLowerCase().replace(/\s/g, '-')}`}
          >
            <Icon size={16} className="nav-icon" />
            <span>{label}</span>
            {path === '/investigation' && (
              <span style={{
                marginLeft: 'auto',
                fontSize: '0.65rem',
                background: 'var(--risk-ring-bg)',
                color: 'var(--risk-ring)',
                border: '1px solid var(--risk-ring-border)',
                borderRadius: '10px',
                padding: '1px 6px',
                fontWeight: 700,
              }}>7</span>
            )}
          </button>
        ))}

        <div className="nav-section-label" style={{ marginTop: '16px' }}>Quick Demo</div>
        <button
          className="nav-item"
          onClick={onDemoClick}
          id="nav-demo-investigate"
          style={{
            color: 'var(--brass-400)',
            background: 'rgba(184, 134, 11, 0.08)',
            border: '1px solid rgba(184, 134, 11, 0.25)',
            marginTop: '4px',
          }}
        >
          <PlayIcon size={16} className="nav-icon" style={{ color: 'var(--brass-300)' }} />
          <span style={{ fontWeight: 600 }}>Demo: Investigate</span>
        </button>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div style={{ fontSize: '0.7rem', color: 'var(--text-placeholder)', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
          MUSA CodeX 2026
        </div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-placeholder)' }}>
          Team Dammrow · CX0507
        </div>
      </div>
    </nav>
  );
}

// ---- Inline SVG Icon Components ----
function HexIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" stroke="var(--brass-300)" strokeWidth="1.5" fill="rgba(197,160,89,0.08)" />
      <polygon points="16,8 22,12 22,20 16,24 10,20 10,12" fill="var(--brass-300)" opacity="0.6" />
      <circle cx="16" cy="16" r="3" fill="var(--brass-200)" />
    </svg>
  );
}

function GridIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}

function SearchIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  );
}

function NetworkIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>
      <path d="M12 7v4M8.5 16.5 12 11M15.5 16.5 12 11"/>
    </svg>
  );
}

function FileIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  );
}

function GavelIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m14 13-8.5 8.5a2.12 2.12 0 0 1-3-3L11 10"/>
      <path d="m16 16 6-6"/><path d="m8 8 6-6"/>
      <path d="m9 7 8 8"/><path d="m21 11-8-8"/>
    </svg>
  );
}

function ShieldIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

function PlayIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/>
    </svg>
  );
}
