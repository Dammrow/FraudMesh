export default function InvestigationTimeline({ timeline = [] }) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="timeline">
      {timeline.map((item, i) => (
        <div key={i} className="timeline-item">
          <div className={`timeline-dot timeline-dot-${item.type}`} />
          <div className="timeline-date">{formatDate(item.date)}</div>
          <div className={`timeline-event timeline-event-${item.type}`}>
            {item.event}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}
