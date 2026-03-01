import React, { useState, useEffect } from 'react';

// Open-Meteo Weather Codes Mapping
const WEATHER_CODES = {
  0: { label: 'Clear sky', icon: '☀️' },
  1: { label: 'Mainly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Fog', icon: '🌫️' },
  48: { label: 'Depositing rime fog', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌧️' },
  53: { label: 'Moderate drizzle', icon: '🌧️' },
  55: { label: 'Dense drizzle', icon: '🌧️' },
  61: { label: 'Slight rain', icon: '🌧️' },
  63: { label: 'Moderate rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '🌧️' },
  71: { label: 'Slight snow', icon: '❄️' },
  73: { label: 'Moderate snow', icon: '❄️' },
  75: { label: 'Heavy snow', icon: '❄️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm with light hail', icon: '⛈️' },
  99: { label: 'Thunderstorm with heavy hail', icon: '⛈️' },
};

export default function WeatherAdvisory() {
  const [weather, setWeather] = useState(null);
  const [advisory, setAdvisory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeatherAndAdvisory();
  }, []);

  const fetchWeatherAndAdvisory = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get Location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      });
      const { latitude, longitude } = position.coords;

      // 2. Fetch Weather from Open-Meteo
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code&timezone=auto`
      );
      if (!weatherRes.ok) throw new Error('Failed to fetch weather data');
      const weatherData = await weatherRes.json();
      const current = weatherData.current;

      const conditionObj = WEATHER_CODES[current.weather_code] || { label: 'Unknown', icon: '🌡️' };
      
      const payload = {
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        condition: conditionObj.label,
        isDay: current.is_day,
      };

      setWeather({ ...payload, icon: conditionObj.icon });

      // 3. Get AI Advisory
      const aiRes = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/ai/weather-advisory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!aiRes.ok) throw new Error('Failed to fetch AI advisory');
      const aiData = await aiRes.json();
      
      setAdvisory(aiData.advisory);
    } catch (err) {
      console.error('Weather fetching error:', err);
      // If location is denied, fail silently or show a small prompt
      if (err.code === 1 /* PERMISSION_DENIED */) {
         setError('Location access needed for weather advisory.');
      } else {
         setError('Failed to load weather advisory.');
      }
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="loading-spinner" style={{ width: '24px', height: '24px', borderWidth: '3px' }}></div>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Analyzing local weather for driving conditions...</p>
      </div>
    );
  }

  if (error) {
     return (
        <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.7 }}>
           <span style={{ fontSize: '1.2rem' }}>🌤️</span>
           <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{error}</p>
           <button onClick={fetchWeatherAndAdvisory} className="btn" style={{ padding: '4px 12px', fontSize: '0.8rem', marginLeft: 'auto' }}>Retry</button>
        </div>
     );
  }

  if (!weather || !advisory) return null;

  return (
    <div className="glass-card stagger-1" style={{ 
      padding: '20px', 
      marginBottom: '24px', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '24px',
      background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.06))',
      border: '1px solid rgba(59,130,246,0.15)',
      flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '150px' }}>
        <span style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}>{weather.icon}</span>
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            {weather.temperature}°C
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {weather.condition} • {weather.humidity}% hum
          </p>
        </div>
      </div>
      
      <div style={{ width: '1px', height: '50px', background: 'rgba(255,255,255,0.1)', display: 'block' }} className="hide-mobile" />

      <div style={{ flex: 1, minWidth: '250px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.9rem' }}>✨</span>
          <span style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            AI Advisory
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>
          {advisory}
        </p>
      </div>
    </div>
  );
}
