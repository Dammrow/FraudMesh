export default function GuidedDemoBar({ currentStep, steps, onStep, onNext, onPrev }) {
  const current = steps[currentStep];
  if (!current) return null;

  return (
    <div className="demo-bar" id="guided-demo-bar">
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span style={{
          fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.12em', color: 'var(--brass-300)',
          fontFamily: 'var(--font-sans)',
        }}>DEMO</span>
        <span style={{
          fontSize: '0.65rem', color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}>
          {currentStep + 1}/{steps.length}
        </span>
      </div>

      {/* Step dots */}
      <div className="demo-step-indicator" style={{ flexShrink: 0 }}>
        {steps.map((s, i) => (
          <button
            key={s.step}
            className={`demo-step-dot${i === currentStep ? ' active' : i < currentStep ? ' completed' : ''}`}
            onClick={() => onStep(i)}
            title={s.label}
            style={{ border: 'none', padding: 0, cursor: 'pointer' }}
          />
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '28px', background: 'var(--border-dim)', flexShrink: 0 }} />

      {/* Current step label + description */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {current.label}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {current.description}
        </div>
      </div>

      {/* Nav buttons */}
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={onPrev}
          disabled={currentStep === 0}
          id="demo-prev-btn"
        >
          ← Prev
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={onNext}
          disabled={currentStep === steps.length - 1}
          id="demo-next-btn"
          style={{ minWidth: '80px' }}
        >
          {currentStep === steps.length - 1 ? 'Complete' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
