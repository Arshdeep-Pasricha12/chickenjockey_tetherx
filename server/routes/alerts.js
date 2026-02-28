const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase'); // Default anon client
const { createClient } = require('@supabase/supabase-js');

// Intelligent Logic Matrix
function analyzeTelemetry(telemetry, config) {
  const alerts = [];
  
  const { engineTemp, speed, tirePressure, weather, checkEngineLight, rpm, coolantLevel, oilLevel, lat, lng } = telemetry;
  const { maxSpeed = 120, safeZone } = config || {};

  // 1. CRITICAL: High Temp + High Speed
  if (engineTemp >= 105 && speed >= 120) {
    alerts.push({
      severity: 'CRITICAL',
      message: 'Immediate engine failure risk. High temperature at high speed.',
      source: 'Engine',
    });
  }

  // 2. HIGH: Low Tire Pressure + Rain
  if (tirePressure <= 28 && weather === 'Rain') {
    alerts.push({
      severity: 'HIGH',
      message: 'High risk of hydroplaning. Low tire pressure detected in rainy conditions.',
      source: 'Tires',
    });
  } else if (tirePressure <= 25) {
     alerts.push({
      severity: 'HIGH',
      message: 'Critical tire pressure.',
      source: 'Tires',
    });
  }

  // 3. HIGH: Check Engine + High RPM
  if (checkEngineLight && rpm >= 5000) {
    alerts.push({
      severity: 'HIGH',
      message: 'Potential transmission/engine wear. High RPM with check engine light on.',
      source: 'Engine',
    });
  }

  // 4. WARNING: Low Fluids
  if (coolantLevel === 'Low' || oilLevel === 'Low') {
    alerts.push({
      severity: 'WARNING',
      message: 'Check fluid levels immediately to prevent damage.',
      source: 'Maintenance',
    });
  }

  // 5. HIGH: Guardian Mode Breach (Speed)
  if (speed > maxSpeed) {
    alerts.push({
      severity: 'HIGH',
      message: `Guardian Mode Breach: Vehicle exceeded max speed limit of ${maxSpeed} km/h.`,
      source: 'Geo-fence',
    });
  }

  // 6. INFO: Routine checks
  if (engineTemp > 90 && engineTemp < 105 && speed < 80) {
    alerts.push({
      severity: 'INFO',
      message: 'Engine running slightly warm in city traffic. Normal condition.',
      source: 'Engine',
    });
  }

  return alerts;
}

// POST /api/alerts/analyze - Receive raw telemetry, process logic, and generate alerts
router.post('/analyze', async (req, res) => {
  try {
    const { user_id, telemetry, config } = req.body;
    const authHeader = req.headers['authorization'];
    
    if (!user_id || !telemetry) {
      return res.status(400).json({ error: 'user_id and telemetry are required.' });
    }

    const generatedAlerts = analyzeTelemetry(telemetry, config);
    
    if (generatedAlerts.length === 0) {
      return res.json({ message: 'System nominal. No alerts generated.', alerts: [] });
    }

    // Map into Supabase schema format
    const inserts = generatedAlerts.map(alert => ({
      user_id,
      severity: alert.severity,
      message: alert.message,
      source: alert.source,
      telemetry_data: telemetry
    }));

    // Create a user-scoped Supabase client using the provided JWT to pass RLS
    let client = supabase;
    if (authHeader) {
      client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } }
      });
    }

    const { data, error } = await client
      .from('alerts')
      .insert(inserts)
      .select();

    if (error) throw error;

    res.json({ message: `${data.length} alerts generated and stored.`, alerts: data });

  } catch (err) {
    console.error('Alerts analyze error:', err.message);
    res.status(500).json({ error: 'Failed to analyze telemetry' });
  }
});

// GET /api/alerts - Fetch user's active alerts
router.get('/', async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'user_id is required' });

    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ alerts: data });
  } catch (err) {
    console.error('Alerts fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

module.exports = router;
