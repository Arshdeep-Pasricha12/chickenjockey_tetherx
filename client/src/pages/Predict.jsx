import { useState } from 'react';

const API = `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:5000")}/api`;

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
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mileage, params, context }),
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
        <h1>🔮 Predictive Maintenance Advisor</h1>
        <p>Know what your car needs before it tells you — peace of mind, not panic</p>
      </div>

      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 className="section-title">📊 Current Vehicle State</h3>
        <div className="grid-4">
          <div className="form-group">
            <label>🛣️ Total Mileage (km)</label>
            <input type="number" className="form-input" value={mileage} onChange={e => setMileage(parseInt(e.target.value) || 0)} />
          </div>
          <div className="form-group">
            <label>🛢️ Last Service Mileage (km)</label>
            <input type="number" className="form-input" value={context.lastServiceMileage} onChange={e => setContext({...context, lastServiceMileage: parseInt(e.target.value) || 0})} />
          </div>
          <div className="form-group">
            <label>🛞 Last Tire Rotation (km)</label>
            <input type="number" className="form-input" value={context.lastRotationMileage} onChange={e => setContext({...context, lastRotationMileage: parseInt(e.target.value) || 0})} />
          </div>
          {Object.entries(params).map(([key, val]) => (
            <div className="form-group" key={key}>
              <label>{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</label>
              <input
                type="number"
                className="form-input"
                value={val}
                onChange={e => setParams(p => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
                step={key === 'batteryVoltage' ? 0.1 : 1}
              />
            </div>
          ))}
        </div>
        <button className="btn btn-primary" onClick={handlePredict} disabled={loading}>
          {loading ? '⏳ Predicting...' : '🔮 Predict Maintenance'}
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
                <div className="prediction-details">
                  <div>📏 <span className="prediction-detail-value">{pred.kmRemaining.toLocaleString()}</span> km remaining</div>
                  <div>📅 <span className="prediction-detail-value">{pred.daysRemaining}</span> days</div>
                  <div>🔎 Condition: <span className="prediction-detail-value">{pred.condition}</span></div>
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
