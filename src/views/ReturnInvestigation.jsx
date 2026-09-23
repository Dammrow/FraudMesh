import { useState, useEffect } from 'react';
import { getCaseById, getCustomerById, PRODUCTS } from '../services/syntheticData.js';
import { calculateIndividualRisk, calculateNetworkRisk, getExplainabilitySignals, getRiskColor } from '../services/riskEngine.js';
import { getCaseState, getStatusLabel, getStatusClass } from '../services/caseState.js';
import RiskGauge from '../components/RiskGauge.jsx';
import RiskBreakdown from '../components/RiskBreakdown.jsx';
import InvestigationTimeline from '../components/InvestigationTimeline.jsx';

const INVESTIGATION_STEPS = [
  { label: 'Scanning device fingerprint registry…', key: 'device', delay: 400 },
  { label: 'Normalizing delivery address cluster…', key: 'address', delay: 900 },
  { label: 'Correlating payment gateway tokens…', key: 'payment', delay: 1400 },
  { label: 'Analyzing SKU return burst patterns…', key: 'sku', delay: 1900 },
  { label: 'Comparing damage evidence hashes…', key: 'evidence', delay: 2400 },
  { label: 'Computing network risk score…', key: 'score', delay: 2900 },
  { label: 'Generating explainability report…', key: 'done', delay: 3400 },
];

export default function ReturnInvestigation({ caseId, initialPhase, onPhaseChange, onViewNetwork, onViewCase, onViewReview }) {
  const [phase, setPhase] = useState(initialPhase || 'individual'); // 'individual' | 'running' | 'network'
  const [progressStep, setProgressStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const caseData = getCaseById(caseId) || getCaseById('PX-2047');
  const customer = getCustomerById(caseData?.customerId);
  const caseState = getCaseState(caseId);
  const product = PRODUCTS.find(p => p.sku === caseData?.sku);

  const individualResult = caseData ? calculateIndividualRisk(caseData, customer) : { score: 0, signals: [] };
  const networkResult = caseData ? calculateNetworkRisk(caseData) : { score: 0, signals: [], ringDetected: false };
  const explainability = caseData ? getExplainabilitySignals(caseData) : [];

  // Sync phase from parent
  useEffect(() => {
    if (initialPhase === 'running' && phase !== 'running' && phase !== 'network') {
      handleRunInvestigation();
    }
  }, [initialPhase]);

  const handleRunInvestigation = () => {
    setPhase('running');
    onPhaseChange?.('running');
    setCompletedSteps([]);
    setProgressStep(0);

    INVESTIGATION_STEPS.forEach((step, i) => {
      setTimeout(() => {
        setProgressStep(i + 1);
        setCompletedSteps(prev => [...prev, step.key]);
        if (i === INVESTIGATION_STEPS.length - 1) {
          setTimeout(() => {
            setPhase('network');
            onPhaseChange?.('network');
          }, 600);
        }
      }, step.delay);
    });
  };

  if (!caseData || !customer) return (
    <div className="content-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ color: 'var(--text-muted)' }}>No case selected.</div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="content-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="code-tag" style={{ fontSize: '0.9rem' }}>{caseData.id}</span>
            <h1 className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--parchment-100)' }}>
              Return Investigation
            </h1>
            {phase === 'network' && <span className="badge badge-ring">RING DETECTED</span>}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>
            {customer.name} · {product?.name || caseData.sku} · ₹{caseData.refundAmount?.toLocaleString('en-IN')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {phase === 'network' && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={onViewNetwork}>View Network Graph</button>
              <button className="btn btn-secondary btn-sm" onClick={onViewCase}>Open Case File</button>
              <button className="btn btn-danger btn-sm" onClick={onViewReview}>Human Review →</button>
            </>
          )}
        </div>
      </div>

      <div className="content-body">
        {/* Core Storyline Visual Banner */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
          padding: '12px 20px', marginBottom: '20px',
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
          borderLeft: '4px solid var(--brass-300)',
          borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{
              padding: '5px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--risk-low-bg)', border: '1px solid var(--risk-low-border)',
              color: 'var(--risk-low)', fontWeight: 700, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <span>42</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>INDIVIDUAL LOOKS NORMAL</span>
            </div>
            <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>→</span>
            <div style={{
              padding: '5px 12px', borderRadius: 'var(--radius-sm)',
              background: phase !== 'individual' ? 'rgba(184,134,11,0.12)' : 'var(--bg-subtle)',
              border: `1px solid ${phase !== 'individual' ? 'var(--brass-border)' : 'var(--border-default)'}`,
              color: phase !== 'individual' ? 'var(--brass-400)' : 'var(--text-muted)',
              fontWeight: 600, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <span>◈</span>
              <span>PARALLAX CONNECTS THE DOTS</span>
            </div>
            <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>→</span>
            <div style={{
              padding: '5px 12px', borderRadius: 'var(--radius-sm)',
              background: phase === 'network' ? 'var(--risk-ring-bg)' : 'var(--bg-subtle)',
              border: `1px solid ${phase === 'network' ? 'var(--risk-ring-border)' : 'var(--border-default)'}`,
              color: phase === 'network' ? 'var(--risk-ring)' : 'var(--text-muted)',
              fontWeight: 700, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <span>{phase === 'network' ? '91' : '—'}</span>
              <span>{phase === 'network' ? 'COORDINATED RING DETECTED & ESCALATED' : 'NETWORK ANALYSIS'}</span>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            THE FRAUDULENT REFUND LOOP
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>

          {/* Left: Main investigation flow */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Phase 1: Individual Analysis */}
            <div className="investigation-phase">
              <div className="investigation-phase-header">
                <div className={`phase-indicator phase-indicator-normal`}>1</div>
                <div>
                  <div className="section-title">Individual Customer Analysis</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Standard account-level risk assessment
                  </div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  {phase === 'individual' && (
                    <span className="badge badge-neutral">CURRENT</span>
                  )}
                </div>
              </div>
              <div style={{ padding: '20px' }}>
                {/* Customer profile row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                  <InfoCard label="Return Rate" value={`${customer.returnRate}%`} sub="Benchmark: < 10%" neutral={customer.returnRate < 10} />
                  <InfoCard label="Return History" value={`${customer.totalReturns} / ${customer.totalOrders}`} sub="orders returned" />
                  <InfoCard label="Refund Value" value={`₹${caseData.refundAmount?.toLocaleString('en-IN')}`} sub={product?.name?.slice(0, 22)} />
                  <InfoCard label="Account Age" value={`${customer.accountAge}d`} sub="Active account" />
                </div>

                {/* Return reason */}
                <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '16px', border: '1px solid var(--border-dim)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Return Reason</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{caseData.reason}</div>
                </div>

                {/* Individual risk result */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '20px',
                  padding: '16px', borderRadius: 'var(--radius-md)',
                  background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)',
                }}>
                  <div style={{ textAlign: 'center', minWidth: '80px' }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--risk-medium)', lineHeight: 1 }}>
                      {individualResult.score}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>/100</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Individual Risk</div>
                  </div>
                  <div style={{ flex: 1, borderLeft: '1px solid var(--border-dim)', paddingLeft: '20px' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--risk-low)', marginBottom: '6px' }}>
                      ✓ BELOW REVIEW THRESHOLD
                    </div>
                    <div style={{ fontSize: '0.857rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      On this account alone, this return does not appear sufficiently suspicious.
                      Return rate of <strong style={{ color: 'var(--text-primary)' }}>{customer.returnRate}%</strong> falls within the standard policy window.
                      Standard refund processing would apply.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 2: Network Investigation Trigger */}
            {(phase === 'individual' || phase === 'running') && (
              <div className="investigation-phase" style={{ borderColor: phase === 'running' ? 'var(--border-accent)' : 'var(--border-subtle)' }}>
                <div className="investigation-phase-header">
                  <div className={`phase-indicator ${phase === 'running' ? 'phase-indicator-active' : 'phase-indicator-normal'}`}>2</div>
                  <div>
                    <div className="section-title">PARALLAX Network Investigation</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Cross-account correlation · Shared entity detection · Ring analysis
                    </div>
                  </div>
                </div>
                <div style={{ padding: '20px' }}>
                  {phase === 'individual' && (
                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                      <div style={{
                        fontSize: '0.9rem', color: 'var(--text-secondary)',
                        maxWidth: '440px', margin: '0 auto 20px', lineHeight: 1.6,
                      }}>
                        Standard analysis is insufficient. PARALLAX can investigate hidden connections
                        across the device, address, payment, and evidence networks.
                      </div>
                      <button
                        className="btn btn-investigate"
                        onClick={handleRunInvestigation}
                        id="run-network-investigation-btn"
                      >
                        ◈ Run Network Investigation
                      </button>
                    </div>
                  )}

                  {phase === 'running' && (
                    <div className="investigation-progress">
                      {INVESTIGATION_STEPS.map((step, i) => {
                        const done = completedSteps.includes(step.key);
                        const active = progressStep === i + 1 && !done;
                        return (
                          <div key={step.key} className="progress-line">
                            <div style={{
                              width: 18, height: 18, borderRadius: '50%',
                              border: `1.5px solid ${done ? 'var(--risk-low)' : active ? 'var(--brass-300)' : 'var(--border-default)'}`,
                              background: done ? 'var(--risk-low)' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.65rem', flexShrink: 0,
                              transition: 'all 0.3s ease',
                            }}>
                              {done && <span style={{ color: 'var(--bg-primary)' }}>✓</span>}
                            </div>
                            <span style={{
                              fontSize: '0.857rem',
                              color: done ? 'var(--text-primary)' : active ? 'var(--brass-200)' : 'var(--text-muted)',
                              className: active ? 'scanning' : '',
                              opacity: done ? 1 : active ? 1 : 0.4,
                              transition: 'all 0.3s ease',
                            }} className={active ? 'scanning' : ''}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Phase 3: Network Result */}
            {phase === 'network' && (
              <div className="investigation-phase animate-fade-in" style={{ borderColor: 'var(--risk-ring-border)' }}>
                <div className="investigation-phase-header" style={{ background: 'rgba(220,38,38,0.04)' }}>
                  <div className="phase-indicator phase-indicator-escalated">!</div>
                  <div>
                    <div className="section-title" style={{ color: 'var(--risk-ring)' }}>Coordinated Pattern Detected</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      PARALLAX identified a coordinated fraud ring linked to this account
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <span className="badge badge-ring">RING ALPHA</span>
                  </div>
                </div>
                <div style={{ padding: '20px' }}>

                  {/* Ring stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                    <RingStatCard value="4" label="Linked Accounts" />
                    <RingStatCard value="3" label="Shared Devices" />
                    <RingStatCard value="2" label="Linked Addresses" />
                    <RingStatCard value="11d" label="Activity Window" />
                    <RingStatCard value="1" label="Payment Token" />
                    <RingStatCard value="5" label="Repeated SKU Returns" />
                    <RingStatCard value="3" label="Similar Evidence" />
                    <RingStatCard value="94.2%" label="Evidence Similarity" />
                  </div>

                  {/* Insight box */}
                  <div style={{
                    background: 'rgba(220,38,38,0.05)', border: '1px solid var(--risk-ring-border)',
                    borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: '16px',
                  }}>
                    <div style={{ fontSize: '0.857rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Individual account behaviour remains below the review threshold.</strong>
                      {' '}However, correlated activity across the network — shared devices, delivery addresses,
                      payment identifiers, repeated SKU returns, and near-identical damage evidence — indicates
                      coordinated return behaviour consistent with an organised fraud ring.
                    </div>
                  </div>

                  {/* Network signals */}
                  <RiskBreakdown signals={networkResult.signals} domain="network" />

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button className="btn btn-secondary" onClick={onViewNetwork}>View Network Graph</button>
                    <button className="btn btn-secondary" onClick={onViewCase}>Open Case File</button>
                    <button className="btn btn-danger" onClick={onViewReview} style={{ marginLeft: 'auto' }}>
                      Escalate for Human Review →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Risk Score Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Risk Scores */}
            <div className="card-dossier" style={{ padding: '20px' }}>
              <div className="section-title" style={{ marginBottom: '20px' }}>Risk Assessment</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Individual risk */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <RiskGauge score={individualResult.score} size="sm" showLabel={false} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Individual Risk</div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: getRiskColor(individualResult.score) }}>{individualResult.score}<span style={{ fontSize: '0.8rem', fontWeight: 400 }}>/100</span></div>
                  </div>
                </div>

                {/* Network risk */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', opacity: phase === 'individual' ? 0.3 : 1, transition: 'opacity 0.4s ease' }}>
                  <RiskGauge score={phase !== 'individual' ? networkResult.score : 0} size="sm" showLabel={false} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Network Risk</div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: getRiskColor(networkResult.score) }}>
                      {phase !== 'individual' ? networkResult.score : '—'}<span style={{ fontSize: '0.8rem', fontWeight: 400 }}>{phase !== 'individual' ? '/100' : ''}</span>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-separator)', paddingTop: '16px' }}>
                  {/* Final risk */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: phase === 'network' ? 1 : 0.3, transition: 'opacity 0.6s ease' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Final Risk Score</div>
                    <RiskGauge score={phase === 'network' ? caseData.finalRisk : 0} size="md" label="Final Score" />
                    {phase === 'network' && (
                      <div style={{
                        background: 'var(--risk-ring-bg)', border: '1px solid var(--risk-ring-border)',
                        borderRadius: 'var(--radius-md)', padding: '8px 12px', width: '100%', textAlign: 'center',
                      }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--risk-ring)' }}>HIGH — INVESTIGATION REQUIRED</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Mandatory human review</div>
                      </div>
                    )}
                    {phase !== 'network' && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-placeholder)', textAlign: 'center' }}>
                        Run network analysis to compute
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            {caseData.timeline?.length > 0 && (
              <div className="card" style={{ padding: '16px' }}>
                <div className="section-title" style={{ marginBottom: '14px' }}>Investigation Timeline</div>
                <InvestigationTimeline timeline={caseData.timeline} />
              </div>
            )}

            {/* Individual signals */}
            <div className="card" style={{ padding: '16px' }}>
              <RiskBreakdown signals={individualResult.signals} domain="individual" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, sub, neutral }) {
  return (
    <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: '12px', border: '1px solid var(--border-dim)' }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, color: neutral ? 'var(--risk-low)' : 'var(--text-primary)', lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{sub}</div>
    </div>
  );
}

function RingStatCard({ value, label }) {
  return (
    <div style={{
      background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.12)',
      borderRadius: 'var(--radius-md)', padding: '10px 12px', textAlign: 'center',
    }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--risk-ring)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>{label}</div>
    </div>
  );
}
