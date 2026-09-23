import { useState, useEffect } from 'react';
import { getCaseById, getCustomerById, PRODUCTS } from '../services/syntheticData.js';
import { getCaseState, submitReview, DECISIONS, getStatusLabel, subscribe } from '../services/caseState.js';
import { recordAuditEvent } from '../services/auditService.js';
import RiskGauge from '../components/RiskGauge.jsx';

const REVIEWER_NAME = 'Senior Analyst';
const QUICK_NOTES = [
  'Network shows repeated coordinated returns across linked accounts.',
  'Shared device fingerprint across 3 accounts confirms coordinated activity.',
  'Evidence similarity (94.2%) indicates staged damage claims.',
  'Individual account appears legitimate in isolation; network analysis confirms ring.',
];

export default function HumanReviewPanel({ caseId, onDecisionMade }) {
  const [caseState, setCaseState] = useState(getCaseState(caseId) || getCaseState('PX-2047'));
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const effectiveCaseId = caseId || 'PX-2047';
  const caseData = getCaseById(effectiveCaseId);
  const customer = getCustomerById(caseData?.customerId);
  const product = PRODUCTS.find(p => p.sku === caseData?.sku);

  useEffect(() => {
    const unsub = subscribe(states => {
      setCaseState(states[effectiveCaseId]);
    });
    return unsub;
  }, [effectiveCaseId]);

  // If already reviewed, show completed state
  const isReviewed = caseState?.reviewDecision != null;

  const handleSubmit = async () => {
    if (!selectedDecision || !notes.trim()) return;
    setSubmitting(true);

    // Simulate brief processing delay
    await new Promise(r => setTimeout(r, 800));

    // Submit review decision (mutates reactive state)
    submitReview({
      caseId: effectiveCaseId,
      decision: selectedDecision,
      notes,
      reviewerName: REVIEWER_NAME,
    });

    // Record in tamper-evident audit trail
    await recordAuditEvent({
      actor: 'INVESTIGATOR_ANALYST',
      action: 'REVIEW_DECISION_RECORDED',
      details: `Decision: ${selectedDecision}. Notes: "${notes}". Reviewer: ${REVIEWER_NAME}.`,
      caseId: effectiveCaseId,
    });

    setSubmitting(false);
    setSubmitted(true);

    // Navigate to audit trail after 1.5s
    setTimeout(() => onDecisionMade?.(), 1500);
  };

  const decisionConfig = [
    { key: 'APPROVE', label: 'Approve Refund', desc: 'Return appears legitimate. Process refund per policy.', icon: '✓', cls: 'decision-approve' },
    { key: 'HOLD', label: 'Investigation Hold', desc: 'Requires further investigation before decision.', icon: '⏸', cls: 'decision-hold' },
    { key: 'REJECT', label: 'Reject Refund Claim', desc: 'Return claim is denied. Customer to be notified.', icon: '✕', cls: 'decision-reject' },
    { key: 'CONFIRM_FRAUD', label: 'Confirm Fraud Ring', desc: 'Mark all linked accounts for review. Blacklist consideration.', icon: '⚠', cls: 'decision-confirm-fraud' },
    { key: 'LEGITIMATE', label: 'Mark as Legitimate', desc: 'Investigation closed. No coordinated fraud pattern.', icon: '◎', cls: 'decision-legitimate' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="content-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="code-tag">{effectiveCaseId}</span>
            <h1 className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--parchment-100)' }}>
              Human Review Panel
            </h1>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>
            {customer?.name} · Final Risk: {caseData?.finalRisk}/100 · Mandatory escalation
          </div>
        </div>
        {isReviewed && (
          <span className="badge badge-brass">REVIEWED</span>
        )}
      </div>

      <div className="content-body">
        {submitted || isReviewed ? (
          <DecisionComplete caseState={caseState} caseData={caseData} onViewAudit={onDecisionMade} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>

            {/* Left: Decision panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Important disclaimer */}
              <div style={{
                padding: '14px 16px',
                background: 'rgba(197,160,89,0.05)', border: '1px solid rgba(197,160,89,0.2)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.857rem', color: 'var(--text-secondary)', lineHeight: 1.6,
              }}>
                <strong style={{ color: 'var(--brass-200)' }}>PARALLAX Risk Scores are Advisory. </strong>
                A score of 91/100 does not mean "91% probability of fraud." It reflects the relative weight of correlated signals.
                This decision rests with the human investigator. Review all evidence before submitting a decision.
              </div>

              {/* System finding summary */}
              <div className="card-dossier" style={{ padding: '20px' }}>
                <div className="section-label" style={{ marginBottom: '14px' }}>PARALLAX System Finding</div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  {[
                    { label: 'Individual Risk', value: caseData?.individualRisk, sub: 'Below threshold alone' },
                    { label: 'Network Risk', value: caseData?.networkRisk, sub: 'Ring Alpha detected' },
                    { label: 'Final Risk Score', value: caseData?.finalRisk, sub: 'Mandatory review' },
                  ].map(item => (
                    <div key={item.label} style={{ textAlign: 'center', padding: '12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-dim)' }}>
                      <RiskGauge score={item.value} size="sm" showLabel={false} />
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{item.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Top signals summary */}
                <div style={{ borderTop: '1px solid var(--border-separator)', paddingTop: '14px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Key Escalation Factors</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[
                      'Shared hardware fingerprint with 3 other return claimants (Device DV-8842)',
                      '94.2% perceptual similarity with damage evidence in Case PX-2011',
                      '4 returns of SKU WH-204-ANC within 11-day window across linked accounts',
                      'Shared payment gateway token PT-9932 under 2 distinct billing names',
                      'Delivery address ADDR-BLR-402 shared across 2 accounts',
                    ].map((signal, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--risk-ring)', fontWeight: 700, flexShrink: 0 }}>+</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{signal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Decision selection */}
              <div className="card-dossier" style={{ padding: '20px' }}>
                <div className="section-label" style={{ marginBottom: '14px' }}>Investigator Decision</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {decisionConfig.map(d => (
                    <button
                      key={d.key}
                      className={`decision-btn decision-${d.key.toLowerCase().replace('_', '-')} ${selectedDecision === d.key ? 'selected' : ''}`}
                      onClick={() => setSelectedDecision(d.key)}
                      id={`decision-${d.key.toLowerCase()}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1rem', width: '20px', textAlign: 'center' }}>{d.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600 }}>{d.label}</div>
                          <div style={{ fontSize: '0.72rem', opacity: 0.8, fontWeight: 400 }}>{d.desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Notes */}
                <label className="form-label" htmlFor="reviewer-notes">Investigator Notes</label>
                <textarea
                  id="reviewer-notes"
                  className="form-textarea"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Enter investigation findings, observations, and reasoning…"
                />

                {/* Quick notes */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {QUICK_NOTES.map((n, i) => (
                    <button
                      key={i}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.7rem', padding: '2px 8px', textAlign: 'left' }}
                      onClick={() => setNotes(n)}
                    >
                      + {n.slice(0, 42)}…
                    </button>
                  ))}
                </div>

                {/* Submit */}
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <div style={{ flex: 1, fontSize: '0.78rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                    {!selectedDecision && 'Select a decision above.'}
                    {selectedDecision && !notes.trim() && 'Add investigator notes to proceed.'}
                    {selectedDecision && notes.trim() && 'Ready to submit.'}
                  </div>
                  <button
                    className="btn btn-primary"
                    disabled={!selectedDecision || !notes.trim() || submitting}
                    onClick={handleSubmit}
                    id="submit-review-btn"
                  >
                    {submitting ? '⏳ Recording…' : 'Submit Decision & Seal Audit'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Case context */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="card" style={{ padding: '16px' }}>
                <div className="section-title" style={{ marginBottom: '12px' }}>Case Summary</div>
                {[
                  ['Case ID', caseData?.id, true],
                  ['Customer', customer?.name, false],
                  ['Product', product?.name, false],
                  ['Refund Amount', `₹${caseData?.refundAmount?.toLocaleString('en-IN')}`, false],
                  ['Return Reason', caseData?.reason, false],
                  ['Network', 'Ring Alpha (4 accounts)', false],
                  ['Escalated', formatTime(caseData?.returnRequestedAt), false],
                ].map(([k, v, mono]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', paddingBottom: '6px', borderBottom: '1px solid var(--border-dim)', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                    <span style={{ color: 'var(--text-primary)', fontFamily: mono ? 'var(--font-mono)' : 'inherit', fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>

              <div className="card" style={{ padding: '16px', borderColor: 'var(--risk-ring-border)', background: 'rgba(220,38,38,0.03)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--risk-ring)', marginBottom: '10px' }}>
                  ⚠ High Risk — Review Required
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  This case has been automatically escalated based on coordinated network signals.
                  A final human decision is required before any refund or rejection is processed.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DecisionComplete({ caseState, caseData, onViewAudit }) {
  const decisionColors = {
    APPROVE: 'var(--risk-low)', LEGITIMATE: 'var(--risk-low)',
    HOLD: 'var(--risk-medium)',
    REJECT: 'var(--risk-high)', CONFIRM_FRAUD: 'var(--risk-ring)',
  };
  const color = decisionColors[caseState?.reviewDecision] || 'var(--brass-200)';

  return (
    <div className="animate-scale-in" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '40px 0' }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: `${color}15`, border: `2px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
        fontSize: '2rem',
      }}>
        ✓
      </div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--parchment-100)', marginBottom: '8px' }}>
        Decision Recorded
      </div>
      <div style={{ fontSize: '1.2rem', fontWeight: 700, color, marginBottom: '16px' }}>
        {caseState?.reviewDecision?.replace('_', ' ')}
      </div>
      {caseState?.reviewNotes && (
        <div style={{
          padding: '14px 20px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)', marginBottom: '20px',
          fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6,
        }}>
          "{caseState.reviewNotes}"
        </div>
      )}
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
        Reviewed by {caseState?.reviewedBy} · Decision sealed in tamper-evident audit chain
      </div>
      <button className="btn btn-secondary" onClick={onViewAudit}>
        View Audit Trail →
      </button>
    </div>
  );
}

function formatTime(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
