import { getRiskColor } from '../services/riskEngine.js';

export default function RiskBreakdown({ signals = [], domain = 'network' }) {
  if (!signals || signals.length === 0) return null;

  const domainLabel = domain === 'network' ? 'Network Signals' : 'Individual Signals';

  return (
    <div>
      <div className="section-label" style={{ marginBottom: '12px' }}>
        {domainLabel}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {signals.map((sig, i) => (
          <div
            key={sig.key || i}
            className="signal-item animate-slide-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div>
              <span className={`signal-severity signal-${sig.severity || sig.weight || 'medium'}`}>
                {(sig.severity || sig.weight || 'medium').toUpperCase()}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <div className="signal-text">{sig.label}</div>
              {sig.detail && <div className="signal-sub">{sig.detail}</div>}
              {sig.value && <div className="signal-sub">Value: <strong style={{ color: 'var(--text-primary)' }}>{sig.value}</strong></div>}
            </div>
            {sig.score > 0 && (
              <div style={{
                fontSize: '0.75rem', fontWeight: 700,
                color: getRiskColor(sig.score * 2.5),
                fontFamily: 'var(--font-mono)',
                flexShrink: 0, minWidth: '32px', textAlign: 'right',
              }}>
                +{sig.score}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
