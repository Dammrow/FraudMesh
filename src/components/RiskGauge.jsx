import { getRiskColor, getRiskClass, getRiskLabel } from '../services/riskEngine.js';

export default function RiskGauge({ score, label, size = 'md', showLabel = true }) {
  const color = getRiskColor(score);
  const riskClass = getRiskClass(score);

  const sizes = {
    sm: { number: '1.6rem', outer: 80, stroke: 6, r: 34 },
    md: { number: '2.4rem', outer: 110, stroke: 8, r: 42 },
    lg: { number: '3rem', outer: 140, stroke: 10, r: 52 },
  };
  const s = sizes[size] || sizes.md;
  const circumference = 2 * Math.PI * s.r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div style={{ position: 'relative', width: s.outer, height: s.outer }}>
        <svg width={s.outer} height={s.outer} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={s.outer / 2} cy={s.outer / 2} r={s.r}
            fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={s.stroke}
          />
          {/* Progress */}
          <circle
            cx={s.outer / 2} cy={s.outer / 2} r={s.r}
            fill="none" stroke={color} strokeWidth={s.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 6px ${color}40)` }}
          />
        </svg>
        {/* Center text */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: s.number, fontWeight: 700, color, lineHeight: 1 }}>
            {score}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            /100
          </div>
        </div>
      </div>

      {showLabel && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color }}>
            {getRiskLabel(score)}
          </div>
          {label && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
          )}
        </div>
      )}
    </div>
  );
}
