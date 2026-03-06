import { useState } from 'react';

const API = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

const URGENCY_COLORS = {
  immediate: '#ff1744',
  soon: '#ff9100',
  upcoming: '#ffc400',
  scheduled: '#10b981',
};

export default function Predict() {
  const [mileage, setMileage] = useState(50000);
  const [params, setParams] = useState({
    oilPressure: 40, brakeThickness: 2.5, batteryVoltage: 12.6,
    tirePressure: 32, engineTemp: 90, fuelLevel: 60,
  });
  const [context, setContext] = useState({
    lastServiceMileage: 42000,
    lastRotationMileage: 40000
  });
  const [serviceHistory, setServiceHistory] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mileage, params, context, serviceHistory }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1>🔮 AI Predictive Maintenance</h1>
        <p>Your intelligent, real-time AI advisor. Know what your car needs before it tells you.</p>
      </div>

      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 className="section-title">📊 Current Vehicle State</h3>
        <div className="grid-4">
          <div className="form-group">
            <label style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem', color: 'var(--accent-blue)' }}>🛣️ Total Mileage (km)</label>
            <input type="number" className="form-input" style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', background: '#000', borderColor: '#222', color: 'var(--accent-cyan)' }} value={mileage} onChange={e => setMileage(parseInt(e.target.value) || 0)} />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem', color: 'var(--accent-blue)' }}>📝 Service History & Notes (AI Context)</label>
            <textarea 
              className="form-input" 
              placeholder='e.g., "Got an oil change and replaced brake pads at 45,000km, but hearing a squeak."'
              rows={2}
              value={serviceHistory} 
              onChange={e => setServiceHistory(e.target.value)} 
              style={{ resize: 'vertical' }}
            />
          </div>
          {Object.entries(params).map(([key, val]) => (
            <div className="form-group" key={key}>
              <label style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem', color: 'var(--accent-blue)' }}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</label>
              <input
                type="number"
                className="form-input"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', background: '#000', borderColor: '#222', color: 'var(--accent-cyan)', textShadow: '0 0 8px rgba(0,255,255,0.4)' }}
                value={val}
                onChange={e => setParams(p => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
                step={key === 'batteryVoltage' ? 0.1 : 1}
              />
            </div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={handlePredict} disabled={loading} style={{ marginTop: '16px' }}>
          {loading ? '⏳ Analyzing AI Telemetry...' : '✨ Generate AI Prediction'}
        </button>
      </div>

      {result && (
        <div className="animate-fade-in-up">
          {/* Next Action Banner */}
          {result.nextAction && (
            <div className="status-banner warning" style={{ marginBottom: '24px' }}>
              <span className="status-emoji">{result.nextAction.icon}</span>
              <div className="status-info">
                <h2>Next Up: {result.nextAction.name}</h2>
                <p>Estimated in ~{result.nextAction.daysRemaining} days ({result.nextAction.kmRemaining.toLocaleString()} km)</p>
              </div>
              <span className={`badge badge-${result.nextAction.urgency === 'immediate' ? 'critical' : result.nextAction.urgency === 'soon' ? 'high' : 'medium'}`} style={{ marginLeft: 'auto' }}>
                {result.nextAction.urgency}
              </span>
            </div>
          )}

          {/* Prediction Cards */}
          <h3 className="section-title">📅 Maintenance Timeline</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="stagger-children">
            {result.predictions.map(pred => (
              <div key={pred.id} className="glass-card prediction-card">
                <div className="prediction-header">
                  <span className="prediction-icon">{pred.icon}</span>
                  <span className="prediction-name">{pred.name}</span>
                  <span className="prediction-urgency">
                    <span className={`badge badge-${pred.urgency === 'immediate' ? 'critical' : pred.urgency === 'soon' ? 'high' : pred.urgency === 'upcoming' ? 'medium' : 'low'}`}>
                      {pred.urgency}
                    </span>
                  </span>
                </div>
                <div className="prediction-details" style={{ fontFamily: 'var(--font-mono)', marginTop: '12px', background: '#020202', padding: '12px', borderRadius: '4px', border: '1px solid #1a1a1a', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px dashed #222', paddingBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>REMAINING DIST.</span>
                    <span style={{ color: 'var(--accent-cyan)', textShadow: '0 0 8px rgba(0,255,255,0.4)' }}>{pred.kmRemaining.toLocaleString()} KM</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px dashed #222', paddingBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>EST. TIME</span>
                    <span style={{ color: 'var(--accent-cyan)', textShadow: '0 0 8px rgba(0,255,255,0.4)' }}>{pred.daysRemaining} DAYS</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>SYS CONDITION</span>
                    <span style={{ color: pred.condition === 'critical' ? 'var(--accent-red)' : 'var(--accent-green)' }}>{pred.condition.toUpperCase()}</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginBottom: '8px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.max(5, Math.min(100, 100 - (pred.daysRemaining / 365) * 100))}%`,
                    background: URGENCY_COLORS[pred.urgency],
                    borderRadius: '2px',
                    transition: 'width 1s ease',
                  }} />
                </div>
                <p className="prediction-message">{pred.emotionalMessage}</p>
                {pred.costOfNeglect && (
                  <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(255, 23, 68, 0.1)', borderLeft: '3px solid #ff1744', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ff1744', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>⚠️ Cost of Neglect</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{pred.costOfNeglect}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
