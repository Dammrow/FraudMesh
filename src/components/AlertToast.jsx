import { useState, useEffect } from 'react';

export default function AlertToast({ caseId, risk, onDismiss, onInvestigate }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const t = setTimeout(() => setVisible(true), 50);
    // Auto-dismiss after 12 seconds
    const dismiss = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 400); }, 12000);
    return () => { clearTimeout(t); clearTimeout(dismiss); };
  }, []);

  return (
    <div
      className="toast-container"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}
    >
      <div className="toast toast-high">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div className="toast-header">⚠ PARALLAX ALERT</div>
          <button
            onClick={() => { setVisible(false); setTimeout(onDismiss, 400); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0 0 0 8px', fontSize: '14px', lineHeight: 1 }}
          >✕</button>
        </div>

        <div className="toast-body">
          {/* Case ID */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="code-tag">{caseId}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Aarav Mehta</span>
          </div>

          {/* Message */}
          <div style={{ fontSize: '0.857rem', color: 'var(--text-primary)', marginBottom: '10px', lineHeight: 1.5 }}>
            High-risk coordinated return activity detected.
          </div>

          {/* Risk display */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--risk-ring)', lineHeight: 1 }}>{risk}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Final Risk</div>
            </div>
            <div style={{ flex: 1, borderLeft: '1px solid var(--border-dim)', paddingLeft: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--risk-ring)', fontWeight: 600, marginBottom: '2px' }}>Ring Alpha Detected</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>4 accounts · 3 shared devices</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Action: Investigation required</div>
            </div>
          </div>

          {/* Action button */}
          <button
            className="btn btn-danger"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => { setVisible(false); setTimeout(() => { onDismiss(); onInvestigate(); }, 200); }}
          >
            Investigate Case
          </button>
        </div>
      </div>
    </div>
  );
}
