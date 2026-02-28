export default function FaultCard({ fault }) {
  return (
    <div className={`glass-card fault-card severity-${fault.severity} animate-fade-in-up`}>
      <div className="fault-card-header">
        <span className="fault-icon">{fault.icon || '⚠️'}</span>
        <div style={{ flex: 1 }}>
          <div className="fault-title">{fault.title}</div>
          {fault.value !== undefined && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {fault.displayName}: {fault.value} {fault.unit}
            </span>
          )}
        </div>
        <span className={`badge badge-${fault.severity}`}>
          {fault.severity.toUpperCase()}
        </span>
      </div>
      <p className="fault-description">{fault.description}</p>
      <div className="fault-fix">
        <div className="fault-fix-label">🔧 Recommended Fix</div>
        <p className="fault-fix-text">{fault.fix}</p>
      </div>
      {fault.emotionalMessage && (
        <p className="fault-emotional">{fault.emotionalMessage}</p>
      )}
      {fault.type === 'correlation' && (
        <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {fault.relatedParams?.map(p => (
            <span key={p} className="tip-tag">{p}</span>
          ))}
        </div>
      )}
    </div>
  );
}
