import { useState } from 'react';
import { getCaseById, getCustomerById, PRODUCTS, EVIDENCE, getEvidenceForCase, CUSTOMERS, ACTIVE_RINGS } from '../services/syntheticData.js';
import { getExplainabilitySignals, getRiskColor, getRiskLabel } from '../services/riskEngine.js';
import { getCaseState, getStatusLabel, getStatusClass } from '../services/caseState.js';
import RiskGauge from '../components/RiskGauge.jsx';
import RiskBreakdown from '../components/RiskBreakdown.jsx';
import InvestigationTimeline from '../components/InvestigationTimeline.jsx';

const RELATED_CASES = [
  { id: 'PX-1998', connection: 'Same device · Confirmed suspicious', status: 'under_investigation', risk: 87 },
  { id: 'PX-2011', connection: 'Same payment token · Under investigation', status: 'under_investigation', risk: 88 },
  { id: 'PX-2031', connection: 'Same SKU + linked address · Pending review', status: 'pending_review', risk: 85 },
];

export default function CaseFileView({ caseId, onViewReview, onViewNetwork, onViewAudit }) {
  const [activeTab, setActiveTab] = useState('overview');
  const caseData = getCaseById(caseId) || getCaseById('PX-2047');
  const customer = getCustomerById(caseData?.customerId);
  const caseState = getCaseState(caseId) || getCaseState('PX-2047');
  const product = PRODUCTS.find(p => p.sku === caseData?.sku);
  const evidence = getEvidenceForCase(caseData?.id);
  const explainability = getExplainabilitySignals(caseData);

  if (!caseData || !customer) return <div className="content-body">No case data found.</div>;

  const ring = ACTIVE_RINGS.find(r => r.id === 'RING-001');

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'evidence', label: 'Evidence' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'related', label: 'Related Cases' },
  ];

  return (
    <div>
      {/* Dossier Header */}
      <div className="content-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>
                PARALLAX · CASE FILE
              </div>
              <div style={{ width: '1px', height: '14px', background: 'var(--border-separator)' }} />
              <span className="code-tag" style={{ fontSize: '0.9rem' }}>{caseData.id}</span>
              <span className="badge badge-ring">COORDINATED RETURN FRAUD INVESTIGATION</span>
            </div>
            <h1 className="font-serif" style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--parchment-100)', letterSpacing: '0.03em' }}>
              {customer.name}
            </h1>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
              {product?.name} · ₹{caseData.refundAmount?.toLocaleString('en-IN')} · {customer.city} · Return: {formatDate(caseData.returnRequestedAt)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-ghost btn-sm" onClick={onViewNetwork}>Network Graph</button>
            <button className="btn btn-ghost btn-sm" onClick={onViewAudit}>Audit Trail</button>
            <button className="btn btn-danger" onClick={onViewReview}>Human Review →</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-separator)', paddingBottom: '0', marginBottom: '-1px', width: '100%' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px 16px',
                fontSize: '0.857rem', fontWeight: 500,
                color: activeTab === tab.id ? 'var(--brass-200)' : 'var(--text-muted)',
                borderBottom: activeTab === tab.id ? '2px solid var(--brass-300)' : '2px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="content-body">
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
            {/* Left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Customer Profile */}
              <div className="card-dossier" style={{ padding: '20px' }}>
                <div className="section-label" style={{ marginBottom: '14px' }}>Customer Profile</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <PropBlock label="Full Name" value={customer.name} />
                  <PropBlock label="Email" value={customer.email} mono />
                  <PropBlock label="Phone" value={customer.phone} mono />
                  <PropBlock label="Location" value={`${customer.city}, ${customer.state || 'India'}`} />
                  <PropBlock label="Account Created" value={customer.joinedAt} />
                  <PropBlock label="Account Age" value={`${customer.accountAge} days`} />
                  <PropBlock label="Total Orders" value={customer.totalOrders} />
                  <PropBlock label="Total Returns" value={customer.totalReturns} highlight={customer.totalReturns > 5} />
                  <PropBlock label="Return Rate" value={`${customer.returnRate}%`} />
                </div>
              </div>

              {/* Return Details */}
              <div className="card-dossier" style={{ padding: '20px' }}>
                <div className="section-label" style={{ marginBottom: '14px' }}>Return Details</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <PropBlock label="Case ID" value={caseData.id} mono />
                  <PropBlock label="Product" value={product?.name || caseData.sku} />
                  <PropBlock label="SKU" value={caseData.sku} mono />
                  <PropBlock label="Order Date" value={formatDate(caseData.orderDate)} />
                  <PropBlock label="Delivery Date" value={formatDate(caseData.deliveryDate)} />
                  <PropBlock label="Return Requested" value={formatDate(caseData.returnRequestedAt)} />
                  <PropBlock label="Refund Amount" value={`₹${caseData.refundAmount?.toLocaleString('en-IN')}`} highlight />
                  <PropBlock label="Return Reason" value={caseData.reason} />
                  <PropBlock label="Status" value={getStatusLabel(caseState?.status || caseData.status)} />
                </div>
              </div>

              {/* Explainability */}
              <div className="card-dossier" style={{ padding: '20px' }}>
                <div className="section-label" style={{ marginBottom: '4px' }}>Why PARALLAX Flagged This Case</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Strongest signals driving risk escalation — ordered by weight
                </div>
                <RiskBreakdown signals={explainability} domain="network" />
              </div>
            </div>

            {/* Right */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Risk Assessment */}
              <div className="card-dossier" style={{ padding: '20px' }}>
                <div className="section-label" style={{ marginBottom: '16px' }}>Risk Assessment</div>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <RiskGauge score={caseData.individualRisk} size="sm" />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Individual</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <RiskGauge score={caseData.networkRisk} size="sm" />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Network</div>
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px 0', borderTop: '1px solid var(--border-separator)' }}>
                  <RiskGauge score={caseData.finalRisk} size="md" label="Final Risk Score" />
                </div>
                <div style={{
                  marginTop: '14px', padding: '10px 12px',
                  background: 'var(--risk-ring-bg)', border: '1px solid var(--risk-ring-border)',
                  borderRadius: 'var(--radius-md)', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--risk-ring)' }}>HIGH — INVESTIGATION REQUIRED</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                    Ring Alpha · 4 accounts · 11-day window
                  </div>
                </div>
              </div>

              {/* Ring Connection */}
              {caseData.ringId && ring && (
                <div className="card" style={{ padding: '16px', borderColor: 'var(--risk-ring-border)' }}>
                  <div className="section-label" style={{ marginBottom: '10px' }}>Fraud Ring Connection</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>{ring.name}</div>
                  {[
                    ['Members', ring.accounts],
                    ['Shared Devices', ring.sharedDevices],
                    ['Linked Addresses', ring.linkedAddresses],
                    ['Payment Token', ring.paymentTokens],
                    ['Repeated Returns', ring.repeatedSku],
                    ['Similar Evidence', ring.similarEvidence],
                    ['Activity Window', `${ring.activityWindow} days`],
                    ['Total Exposure', `₹${ring.totalExposure?.toLocaleString('en-IN')}`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', paddingBottom: '5px', borderBottom: '1px solid var(--border-dim)', marginBottom: '5px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Review status */}
              {caseState?.reviewDecision && (
                <div className="card" style={{ padding: '16px', borderColor: 'var(--border-accent)' }}>
                  <div className="section-label" style={{ marginBottom: '10px' }}>Review Decision</div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--brass-200)', marginBottom: '8px' }}>
                    {caseState.reviewDecision}
                  </div>
                  {caseState.reviewNotes && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '8px', lineHeight: 1.5 }}>
                      "{caseState.reviewNotes}"
                    </div>
                  )}
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    By {caseState.reviewedBy} · {formatDate(caseState.reviewedAt)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'evidence' && <EvidenceTab evidence={evidence} />}
        {activeTab === 'timeline' && (
          <div style={{ maxWidth: '700px' }}>
            <div className="card-dossier" style={{ padding: '24px' }}>
              <div className="section-label" style={{ marginBottom: '20px' }}>Investigation Timeline</div>
              <InvestigationTimeline timeline={caseData.timeline || []} />
            </div>
          </div>
        )}
        {activeTab === 'related' && <RelatedCasesTab />}
      </div>
    </div>
  );
}

function EvidenceTab({ evidence }) {
  if (!evidence || evidence.length === 0) return (
    <div style={{ color: 'var(--text-muted)', padding: '24px' }}>No evidence items on file.</div>
  );

  // Group all evidence from the ring for comparison
  const allEvidence = [
    { ...evidence[0] },
    { id: 'EVD-002', caseId: 'PX-2011', filename: 'damage_WH204_rao_aug28.jpg', description: 'Headphone right ear cup cracked, cable fraying near 3.5mm jack', similarity: 94.2, exifCamera: 'iPhone 14 Pro', pHash: 'a1b2c3d4e5f67891' },
    { id: 'EVD-003', caseId: 'PX-1998', filename: 'damage_WH204_verma_aug30.jpg', description: 'Ear cup cracking along seam, cable distressed at plug', similarity: 91.8, exifCamera: 'Google Pixel 7', pHash: 'a1b2c3d4e5f67893' },
    { id: 'EVD-004', caseId: 'PX-2031', filename: 'damage_WH204_sen_sep01.jpg', description: 'Physical damage to left ear cushion, cable intact', similarity: 88.6, exifCamera: 'Samsung Galaxy S23', pHash: 'b2c3d4e5f6789012' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div className="section-label">Evidence Comparison</div>
        <div style={{
          padding: '4px 12px', borderRadius: 'var(--radius-sm)',
          background: 'var(--risk-ring-bg)', border: '1px solid var(--risk-ring-border)',
          fontSize: '0.72rem', fontWeight: 700, color: 'var(--risk-ring)',
        }}>
          HIGH SIMILARITY DETECTED
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {allEvidence.map((evd, i) => (
          <div key={evd.id} className="evidence-card">
            {/* Synthetic evidence image placeholder */}
            <div style={{
              width: '100%', aspectRatio: '4/3',
              background: `linear-gradient(135deg, #F4EFE6 0%, #E8E2D7 100%)`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
              borderBottom: '1px solid var(--border-default)',
            }}>
              {/* Simulated damage pattern */}
              <svg width="120" height="90" viewBox="0 0 120 90" style={{ opacity: 0.85 }}>
                <ellipse cx="60" cy="45" rx="40" ry="30" fill="none" stroke="#64748B" strokeWidth="2" />
                <ellipse cx="60" cy="45" rx="28" ry="20" fill="none" stroke="#94A3B8" strokeWidth="1.5" />
                {/* Crack pattern — slightly different per evidence */}
                <path d={`M${45 + i * 2},${30 - i} L${52 + i},${45} L${48 + i * 3},${58}`} stroke="#C5221F" strokeWidth="2" fill="none" />
                <path d={`M${52 + i},${45} L${62 - i},${42 + i}`} stroke="#C5221F" strokeWidth="1.5" fill="none" />
                {/* Cable */}
                <path d={`M${60},75 Q${70},80 ${80 + i},85`} stroke="#475467" strokeWidth="2.5" fill="none" />
                <circle cx={`${80 + i}`} cy="85" r="4" fill="#334155" stroke="#475467" strokeWidth="1" />
              </svg>
              {/* Photo metadata overlay */}
              <div style={{ position: 'absolute', top: '6px', left: '6px', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.85)', padding: '2px 6px', borderRadius: '3px', border: '1px solid var(--border-subtle)' }}>
                {evd.exifCamera?.split(' ')[0]}
              </div>
              {i > 0 && (
                <div style={{
                  position: 'absolute', bottom: '6px', right: '6px',
                  background: 'var(--risk-ring-bg)', border: '1px solid var(--risk-ring-border)',
                  borderRadius: '3px', padding: '2px 6px',
                  fontSize: '0.68rem', color: 'var(--risk-ring)', fontWeight: 700,
                }}>
                  {evd.similarity?.toFixed(1)}% match
                </div>
              )}
              {i === 0 && (
                <div style={{
                  position: 'absolute', bottom: '6px', right: '6px',
                  background: 'rgba(184,134,11,0.15)', border: '1px solid rgba(184,134,11,0.35)',
                  borderRadius: '3px', padding: '2px 6px',
                  fontSize: '0.68rem', color: 'var(--brass-400)', fontWeight: 700,
                }}>
                  REFERENCE
                </div>
              )}
            </div>

            {/* Evidence info */}
            <div style={{ padding: '10px 12px' }}>
              <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {evd.id} · {evd.caseId}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '8px' }}>
                {evd.description}
              </div>
              {/* Similarity bar */}
              {i > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Structural similarity</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--risk-ring)', fontFamily: 'var(--font-mono)' }}>{evd.similarity?.toFixed(1)}%</span>
                  </div>
                  <div className="risk-bar-track">
                    <div className="risk-bar-fill" style={{ width: `${evd.similarity}%`, background: `linear-gradient(90deg, var(--risk-high), var(--risk-ring))` }} />
                  </div>
                </div>
              )}
              {/* pHash */}
              <div style={{ marginTop: '8px', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-placeholder)' }}>
                pHash: {evd.pHash || 'N/A'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '20px', padding: '14px 16px',
        background: 'rgba(197,160,89,0.05)', border: '1px solid rgba(197,160,89,0.15)',
        borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--brass-200)' }}>Evidence Analysis Methodology: </strong>
        Perceptual hash similarity is computed using DCT-based image fingerprinting. Matches above 85% indicate near-identical visual structure. This analysis is advisory; human forensic review is required before any determination of fraud.
      </div>
    </div>
  );
}

function RelatedCasesTab() {
  return (
    <div style={{ maxWidth: '700px' }}>
      <div className="section-label" style={{ marginBottom: '14px' }}>Connected Cases</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {RELATED_CASES.map(rc => (
          <div key={rc.id} className="card-dossier" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="code-tag">{rc.id}</span>
                <div>
                  <div style={{ fontSize: '0.857rem', color: 'var(--text-primary)', fontWeight: 500 }}>{rc.connection}</div>
                  <span className={`badge ${getStatusClass(rc.status)}`} style={{ marginTop: '4px', display: 'inline-flex' }}>
                    {getStatusLabel(rc.status)}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: getRiskColor(rc.risk) }}>{rc.risk}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>risk</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PropBlock({ label, value, mono, highlight }) {
  return (
    <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: '10px 12px', border: '1px solid var(--border-dim)' }}>
      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3px' }}>{label}</div>
      <div style={{
        fontSize: mono ? '0.78rem' : '0.857rem',
        fontFamily: mono ? 'var(--font-mono)' : 'inherit',
        color: highlight ? 'var(--brass-200)' : 'var(--text-primary)',
        fontWeight: 500, wordBreak: 'break-all',
      }}>{value}</div>
    </div>
  );
}

function formatDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
