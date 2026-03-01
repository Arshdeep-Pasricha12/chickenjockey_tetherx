import { useState } from 'react';
import FaultCard from '../components/FaultCard';
import { useVehicle } from '../context/VehicleContext';

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;

const PARAMS = [
  { key: 'speed', label: 'Speed', unit: 'km/h', placeholder: '0–200', icon: '🏎️' },
  { key: 'engineTemp', label: 'Engine Temperature', unit: '°C', placeholder: '70–105 normal', icon: '🌡️' },
  { key: 'rpm', label: 'Engine RPM', unit: 'RPM', placeholder: '600–6000 normal', icon: '⚙️' },
  { key: 'oilPressure', label: 'Oil Pressure', unit: 'psi', placeholder: '25-65 normal', icon: '🛢️' },
  { key: 'tirePressure', label: 'Tire Pressure', unit: 'psi', placeholder: '30-35 normal', icon: '🛞' },
  { key: 'batteryVoltage', label: 'Battery Voltage', unit: 'V', placeholder: '12.4-14.7 normal', icon: '🔋' },
  { key: 'fuelLevel', label: 'Fuel Level', unit: '%', placeholder: '0–100', icon: '⛽' },
  { key: 'brakeThickness', label: 'Brake Pad Thickness', unit: 'mm', placeholder: '4-12 normal', icon: '🛑' },
];

export default function Diagnose() {
  const { params, updateParam, resetParams } = useVehicle();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      setResult(data);
      // Save to history
      await fetch(`${API}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'diagnosis',
          title: `Diagnostic Check — ${data.totalFaults} fault(s)`,
          summary: data.overallMessage,
          status: data.overallStatus,
          faultsFound: data.totalFaults,
        }),
      });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleReset = () => {
    resetParams();
    setResult(null);
  };

  const filled = Object.keys(params).filter(k => params[k] !== '' && params[k] !== undefined).length;

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1>🔍 Smart Fault Detection & Diagnosis</h1>
        <p>Enter your vehicle parameters to detect faults, get severity ratings, and step-by-step fix instructions</p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit}>
        <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="section-title" style={{ margin: 0 }}>📊 Vehicle Parameters</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{filled}/8 parameters entered</span>
          </div>
          <div className="grid-4">
            {PARAMS.map(p => (
              <div className="form-group" key={p.key}>
                <label>{p.icon} {p.label} ({p.unit})</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder={p.placeholder}
                  value={params[p.key] !== undefined ? params[p.key] : ''}
                  onChange={e => updateParam(p.key, e.target.value)}
                  step={p.key === 'batteryVoltage' ? 0.1 : 1}
                  id={`input-${p.key}`}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading || filled === 0} id="btn-diagnose">
              {loading ? '⏳ Diagnosing...' : '🔍 Diagnose Vehicle'}
            </button>
            <button type="button" className="btn btn-outline" onClick={handleReset} id="btn-reset">
              🔄 Reset
            </button>
          </div>
        </div>
      </form>

      {/* Results */}
      {result && (
        <div className="animate-fade-in-up">
          {/* Overall Status */}
          <div className={`status-banner ${result.overallStatus}`} style={{ marginBottom: '24px' }}>
            <span className="status-emoji">{result.overallEmoji}</span>
            <div className="status-info">
              <h2>Diagnosis: {result.overallStatus.charAt(0).toUpperCase() + result.overallStatus.slice(1)}</h2>
              <p>{result.overallMessage}</p>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{result.totalFaults}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>fault{result.totalFaults !== 1 ? 's' : ''} detected</div>
            </div>
          </div>

          {/* Fault Cards */}
          {result.faults.length > 0 ? (
            <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {result.faults.map(fault => (
                <FaultCard key={fault.id} fault={fault} />
              ))}
            </div>
          ) : (
            <div className="glass-card empty-state">
              <div className="empty-state-icon">✅</div>
              <h3>All Clear!</h3>
              <p>No faults detected. Your vehicle is in great condition.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
