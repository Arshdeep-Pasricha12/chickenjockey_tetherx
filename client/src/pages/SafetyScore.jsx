import { useState } from 'react';

const API = 'http://localhost:5000/api';

export default function SafetyScore() {
  const [drivingData, setDrivingData] = useState({
    avgSpeed: 65, maxSpeed: 90, hardBrakes: 1, rapidAccelerations: 0,
    distanceKm: 45, durationMinutes: 50, nightDriving: false, weatherCondition: 'clear',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/safety-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(drivingData),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const circumference = 2 * Math.PI * 85;
  const offset = result ? circumference * (1 - result.score / 100) : circumference;

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1>🏆 Drive Safety Score</h1>
        <p>Track your driving behavior, earn badges, and become a safer driver</p>
      </div>

      {/* Input Form */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 className="section-title">🚗 Your Recent Drive</h3>
        <div className="grid-4">
          <div className="form-group">
            <label>📏 Average Speed (km/h)</label>
            <input type="number" className="form-input" value={drivingData.avgSpeed}
              onChange={e => setDrivingData(d => ({ ...d, avgSpeed: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div className="form-group">
            <label>🏎️ Max Speed (km/h)</label>
            <input type="number" className="form-input" value={drivingData.maxSpeed}
              onChange={e => setDrivingData(d => ({ ...d, maxSpeed: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div className="form-group">
            <label>🛑 Hard Braking Events</label>
            <input type="number" className="form-input" value={drivingData.hardBrakes}
              onChange={e => setDrivingData(d => ({ ...d, hardBrakes: parseInt(e.target.value) || 0 }))} />
          </div>
          <div className="form-group">
            <label>⚡ Rapid Accelerations</label>
            <input type="number" className="form-input" value={drivingData.rapidAccelerations}
              onChange={e => setDrivingData(d => ({ ...d, rapidAccelerations: parseInt(e.target.value) || 0 }))} />
          </div>
          <div className="form-group">
            <label>🛣️ Distance (km)</label>
            <input type="number" className="form-input" value={drivingData.distanceKm}
              onChange={e => setDrivingData(d => ({ ...d, distanceKm: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div className="form-group">
            <label>⏱️ Duration (min)</label>
            <input type="number" className="form-input" value={drivingData.durationMinutes}
              onChange={e => setDrivingData(d => ({ ...d, durationMinutes: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div className="form-group">
            <label>🌙 Night Driving</label>
            <select className="form-input" value={drivingData.nightDriving.toString()}
              onChange={e => setDrivingData(d => ({ ...d, nightDriving: e.target.value === 'true' }))}>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
          <div className="form-group">
            <label>🌦️ Weather</label>
            <select className="form-input" value={drivingData.weatherCondition}
              onChange={e => setDrivingData(d => ({ ...d, weatherCondition: e.target.value }))}>
              <option value="clear">Clear</option>
              <option value="rain">Rain</option>
              <option value="fog">Fog</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleCalculate} disabled={loading}>
          {loading ? '⏳ Calculating...' : '🏆 Calculate Score'}
        </button>
      </div>

      {/* Score Display */}
      {result && (
        <div className="animate-fade-in-up">
          <div className="grid-2">
            {/* Score Circle */}
            <div className="glass-card" style={{ padding: '32px' }}>
              <div className="score-circle-container">
                <div className="score-circle">
                  <svg viewBox="0 0 200 200">
                    <circle className="score-circle-bg" cx="100" cy="100" r="85" />
                    <circle
                      className="score-circle-fill"
                      cx="100" cy="100" r="85"
                      style={{
                        stroke: result.gradeColor,
                        strokeDasharray: circumference,
                        strokeDashoffset: offset,
                        filter: `drop-shadow(0 0 8px ${result.gradeColor})`,
                      }}
                    />
                  </svg>
                  <div className="score-circle-text">
                    <div className="score-value" style={{ color: result.gradeColor }}>{result.score}</div>
                    <div className="score-grade" style={{ color: result.gradeColor }}>{result.gradeEmoji} {result.grade}</div>
                  </div>
                </div>
              </div>
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '16px' }}>
                {result.emotionalMessage}
              </p>
            </div>

            {/* Badges */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 className="section-title">🎖️ Earned Badges</h3>
              {result.badges.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {result.badges.map(badge => (
                    <div key={badge.id} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px', background: 'rgba(16, 185, 129, 0.08)',
                      borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>{badge.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{badge.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{badge.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '24px' }}>
                  <div className="empty-state-icon">🎯</div>
                  <p>Drive safer to earn badges!</p>
                </div>
              )}

              {/* Deductions */}
              {result.deductions.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Point Deductions</h4>
                  {result.deductions.map((d, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '6px 0', fontSize: '0.85rem', borderBottom: '1px solid var(--border-glass)'
                    }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{d.reason}</span>
                      <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>{d.points}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          {result.tips.length > 0 && (
            <div className="glass-card" style={{ padding: '24px', marginTop: '24px' }}>
              <h3 className="section-title">💡 Improvement Tips</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {result.tips.map((tip, i) => (
                  <div key={i} style={{
                    padding: '12px 16px', background: 'rgba(59, 130, 246, 0.06)',
                    borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59, 130, 246, 0.12)',
                    fontSize: '0.9rem', color: 'var(--text-secondary)',
                  }}>
                    💡 {tip}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
