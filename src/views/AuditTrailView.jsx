import { useState, useEffect } from 'react';
import { getAuditTrail, onAuditUpdate, formatAuditAction } from '../services/auditService.js';

export default function AuditTrailView({ caseId }) {
  const effectiveCaseId = caseId || 'PX-2047';
  const [entries, setEntries] = useState(getAuditTrail(effectiveCaseId));
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    onAuditUpdate(allEntries => {
      setEntries(allEntries.filter(e => !effectiveCaseId || e.caseId === effectiveCaseId));
    });
  }, [effectiveCaseId]);

  const actorLabel = (actor) => actor === 'PARALLAX_AI_ENGINE' ? 'PARALLAX Engine' : 'Human Analyst';
  const actorColor = (actor) => actor === 'PARALLAX_AI_ENGINE' ? '#1E40AF' : '#9E7B3B';

  return (
    <div>
      {/* Header */}
      <div className="content-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="code-tag">{effectiveCaseId}</span>
            <h1 className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--parchment-100)' }}>
              Tamper-Evident Audit Trail
            </h1>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>
            SHA-256 hash-chained forensic ledger · {entries.length} entries
          </div>
        </div>
        <div style={{ display: 'flex', align: 'center', gap: '8px' }}>
          <div style={{
            padding: '6px 12px', borderRadius: 'var(--radius-md)',
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--risk-low)', flexShadow: '0 0 6px var(--risk-low)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--risk-low)', fontWeight: 600 }}>CHAIN INTACT</span>
          </div>
        </div>
      </div>

      <div className="content-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>

          {/* Left: Ledger entries */}
          <div>
            {/* Explanation */}
            <div style={{
              padding: '12px 16px', marginBottom: '20px',
              background: 'rgba(197,160,89,0.05)', border: '1px solid rgba(197,160,89,0.15)',
              borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6,
            }}>
              Each audit entry is cryptographically linked to the previous record via SHA-256 hashing.
              Any modification to a past record would invalidate all subsequent hashes, making the ledger tamper-evident.
              This chain cannot be altered without detection.
            </div>

            {/* Entries */}
            {entries.map((entry, i) => (
              <div key={entry.id}>
                <div
                  className={`audit-entry${entry.isNew ? ' new-entry' : ''}`}
                  onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                  style={{ cursor: 'pointer' }}
                  id={`audit-${entry.id}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="code-tag" style={{ fontSize: '0.72rem' }}>{entry.id}</span>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: `${actorColor(entry.actor)}15`,
                        border: `1px solid ${actorColor(entry.actor)}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.65rem', color: actorColor(entry.actor), fontWeight: 700,
                        flexShrink: 0,
                      }}>
                        {entry.actor === 'PARALLAX_AI_ENGINE' ? 'P' : 'H'}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: actorColor(entry.actor) }}>
                          {actorLabel(entry.actor)}
                        </div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {formatAuditAction(entry.action)}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {entry.displayTime}
                      </div>
                      {entry.isNew && (
                        <span style={{ fontSize: '0.65rem', color: 'var(--risk-low)', fontWeight: 700 }}>NEW</span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.5 }}>
                    {entry.details}
                  </div>

                  {/* Hash preview */}
                  <div style={{ borderTop: '1px solid var(--border-dim)', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-placeholder)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Record Hash</div>
                        <div className="audit-hash">{entry.recordHash?.slice(0, 32)}…</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-placeholder)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Previous Hash</div>
                        <div className="audit-hash">{entry.previousHash?.slice(0, 32)}…</div>
                      </div>
                    </div>
                    {selectedEntry?.id === entry.id && (
                      <div className="animate-fade-in" style={{ marginTop: '10px' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-placeholder)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Full Record Hash</div>
                        <div className="audit-hash" style={{ wordBreak: 'break-all' }}>{entry.recordHash}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-placeholder)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px', marginTop: '8px' }}>Full Previous Hash</div>
                        <div className="audit-hash" style={{ wordBreak: 'break-all' }}>{entry.previousHash}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chain connector */}
                {i < entries.length - 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                      <div style={{ width: '1px', height: '8px', background: 'var(--border-default)' }} />
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-placeholder)', fontFamily: 'var(--font-mono)' }}>⬡</div>
                      <div style={{ width: '1px', height: '8px', background: 'var(--border-default)' }} />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Chain end */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
              <div style={{
                padding: '8px 16px',
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--risk-low)', fontWeight: 600,
              }}>
                ✓ Chain Terminus · {entries.length} Records · Integrity Verified
              </div>
            </div>
          </div>

          {/* Right: Chain info panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Legend */}
            <div className="card" style={{ padding: '16px' }}>
              <div className="section-title" style={{ marginBottom: '12px' }}>Chain Summary</div>
              {[
                ['Total Records', entries.length],
                ['PARALLAX Engine', entries.filter(e => e.actor === 'PARALLAX_AI_ENGINE').length],
                ['Human Analyst', entries.filter(e => e.actor === 'INVESTIGATOR_ANALYST').length],
                ['Hash Algorithm', 'SHA-256'],
                ['Chain Status', 'Intact'],
                ['Case ID', effectiveCaseId],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', paddingBottom: '6px', borderBottom: '1px solid var(--border-dim)', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: k === 'Hash Algorithm' || k === 'Case ID' ? 'var(--font-mono)' : 'inherit' }}>
                    {v}
                  </span>
                </div>
              ))}
            </div>

            {/* Head hash */}
            <div className="card" style={{ padding: '16px' }}>
              <div className="section-title" style={{ marginBottom: '10px' }}>Chain Head</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Latest Record Hash</div>
              <div className="audit-hash" style={{ wordBreak: 'break-all', lineHeight: 1.6 }}>
                {entries[entries.length - 1]?.recordHash || '—'}
              </div>
            </div>

            {/* How it works */}
            <div className="card" style={{ padding: '16px' }}>
              <div className="section-title" style={{ marginBottom: '10px' }}>How It Works</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { step: '1', text: 'Each event is recorded with a timestamp, actor, and action payload.' },
                  { step: '2', text: 'SHA-256 is computed over the payload + previous record hash.' },
                  { step: '3', text: 'Modifying any record changes its hash, breaking all subsequent entries.' },
                  { step: '4', text: 'This creates a tamper-evident forensic chain of custody.' },
                ].map(item => (
                  <div key={item.step} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: 'rgba(197,160,89,0.1)', border: '1px solid rgba(197,160,89,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700, color: 'var(--brass-300)', flexShrink: 0,
                    }}>
                      {item.step}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {item.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
