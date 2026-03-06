export default function FaultCard({ fault }) {
  return (
    <div className={`glass-card fault-card severity-${fault.severity} animate-fade-in-up`}>
      <div className="fault-card-header">
        <span className="fault-icon">{fault.icon || '⚠️'}</span>
        <div style={{ flex: 1 }}>
          <div className="fault-title" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{fault.title}</div>
          {fault.value !== undefined && (
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', textShadow: '0 0 8px rgba(0,255,255,0.4)', background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px', border: '1px solid #222' }}>
              {fault.displayName.toUpperCase()}: {fault.value} {fault.unit}
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
