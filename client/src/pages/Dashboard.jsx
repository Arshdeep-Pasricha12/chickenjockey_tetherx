import { useState } from 'react';
import GaugeChart from '../components/GaugeChart';
import CarScene from '../components/CarScene';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useVehicle } from '../context/VehicleContext';
import WeatherAdvisory from '../components/WeatherAdvisory';

const API = 'http://localhost:5000/api';

function getGaugeColor(param, value) {
  const colors = {
    speed: value > 160 ? '#ff1744' : value > 120 ? '#ffc400' : '#10b981',
    engineTemp: value > 120 ? '#ff1744' : value > 105 ? '#ff6d00' : '#10b981',
    rpm: value > 7000 ? '#ff1744' : value > 6000 ? '#ff6d00' : '#10b981',
    oilPressure: value < 15 ? '#ff1744' : value < 25 ? '#ff6d00' : '#10b981',
    tirePressure: (value < 25 || value > 40) ? '#ff1744' : (value < 30 || value > 35) ? '#ffc400' : '#10b981',
    batteryVoltage: value < 11.8 ? '#ff1744' : value < 12.4 ? '#ff6d00' : '#10b981',
    fuelLevel: value < 10 ? '#ff1744' : value < 20 ? '#ffc400' : '#10b981',
    brakeThickness: value < 2 ? '#ff1744' : value < 4 ? '#ff6d00' : '#10b981',
  };
  return colors[param] || '#3b82f6';
}

function getHealthStatus(result) {
  if (!result || !result.overallStatus) return { emoji: '😊', status: 'healthy', message: 'Explore the 3D model above — hover over parts to inspect' };
  return { emoji: result.overallEmoji, status: result.overallStatus, message: result.overallMessage };
}

export default function Dashboard() {
  const { params, updateParam } = useVehicle();
  const [result, setResult] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagContext, setDiagContext] = useState({
    tripType: 'City', weather: 'Clear', timeOfDay: 'Day', 
    driverProfile: 'Experienced', passengers: 1, load: 'Normal', acOn: false, gear: 3
  });
  const { user } = useAuth();

  const handleDiagnose = async () => {
    setLoading(true);
    setShowDiagnostics(true);
    setAlerts([]);
    setAiExplanation(null);
    try {
      // 1. Base Diagnosis
      const res = await fetch(`${API}/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ params, context: diagContext }),
      });
      const data = await res.json();
      setResult(data);


    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAskAI = async (alert) => {
    setLoadingAi(true);
    setAiExplanation(null);
    try {
      const res = await fetch(`${API}/ai/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faultCode: alert.message,
          context: `Severity: ${alert.severity}, Source: ${alert.source}`,
          telemetry: params
        })
      });
      const data = await res.json();
      setAiExplanation({ id: alert.id || 'temp', text: data.explanation });
    } catch (err) {
      console.error(err);
    }
    setLoadingAi(false);
  };

  const health = getHealthStatus(result);

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1>🫀 Vehicle Health Dashboard</h1>
        <p>Interactive 3D view — hover over parts to explore your vehicle's health</p>
      </div>

      {/* 3D Car Hero Section */}
      <CarScene params={params} />

      {/* Real-time Weather AI Advisory */}
      <WeatherAdvisory />

      {/* Overall Status */}
      <div className={`status-banner ${health.status}`}>
        <span className="status-emoji">{health.emoji}</span>
        <div className="status-info">
          <h2>Vehicle Status: {health.status.charAt(0).toUpperCase() + health.status.slice(1)}</h2>
          <p>{health.message}</p>
        </div>
        {result && result.totalFaults !== undefined && (
          <span className={`badge badge-${result.totalFaults === 0 ? 'healthy' : result.overallStatus === 'critical' ? 'critical' : 'high'}`} style={{ marginLeft: 'auto' }}>
            {result.totalFaults} {result.totalFaults === 1 ? 'fault' : 'faults'}
          </span>
        )}
      </div>



      {/* Gauge Grid */}
      <div className="grid-4 stagger-children" style={{ marginBottom: '32px' }}>
        <GaugeChart value={params.speed} min={0} max={200} label="Speed" unit="km/h" color={getGaugeColor('speed', params.speed)} />
        <GaugeChart value={params.engineTemp} min={0} max={150} label="Engine Temp" unit="°C" color={getGaugeColor('engineTemp', params.engineTemp)} />
        <GaugeChart value={params.rpm} min={0} max={8000} label="RPM" unit="rpm" color={getGaugeColor('rpm', params.rpm)} />
        <GaugeChart value={params.oilPressure} min={0} max={80} label="Oil Pressure" unit="psi" color={getGaugeColor('oilPressure', params.oilPressure)} />
        <GaugeChart value={params.tirePressure} min={0} max={50} label="Tire Pressure" unit="psi" color={getGaugeColor('tirePressure', params.tirePressure)} />
        <GaugeChart value={params.batteryVoltage} min={10} max={16} label="Battery" unit="V" color={getGaugeColor('batteryVoltage', params.batteryVoltage)} />
        <GaugeChart value={params.fuelLevel} min={0} max={100} label="Fuel Level" unit="%" color={getGaugeColor('fuelLevel', params.fuelLevel)} />
        <GaugeChart value={params.brakeThickness} min={0} max={14} label="Brake Pads" unit="mm" color={getGaugeColor('brakeThickness', params.brakeThickness)} />
      </div>

      {/* CTA and Parameters */}
      {!showDiagnostics ? (
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <button className="btn btn-primary" onClick={() => setShowDiagnostics(true)} style={{ fontSize: '1.1rem', padding: '16px 40px' }}>
            ⚡ Open Diagnostics Panel
          </button>
        </div>
      ) : (
        <>
          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 className="section-title">⚡ Quick Parameter Update</h3>
            <div className="grid-4">
              {Object.entries(params).map(([key, val]) => (
                <div className="form-group" key={key}>
                  <label>{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</label>
                  <input
                    type="number"
                    className="form-input"
                    value={val}
                    onChange={e => updateParam(key, e.target.value)}
                    step={key === 'batteryVoltage' ? 0.1 : 1}
                  />
                </div>
              ))}
            </div>



            <button className="btn btn-primary" onClick={handleDiagnose} disabled={loading}>
              {loading ? '⏳ Analyzing...' : '🔍 Run Diagnosis'}
            </button>
          </div>

          {/* Error State */}
          {result && result.error && (
            <div className="status-banner" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
              🚨 Error: {result.error}
            </div>
          )}

          {/* Fault Summary */}
          {result && result.faults && result.faults.length > 0 && (
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 className="section-title">🚨 Detected Faults ({result.totalFaults})</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {result.faults.map(f => (
                  <span key={f.id} className={`badge badge-${f.severity}`}>
                    {f.icon} {f.title}
                  </span>
                ))}
              </div>
              <p style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Go to <strong>Smart Diagnosis</strong> for detailed analysis and fix instructions.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
