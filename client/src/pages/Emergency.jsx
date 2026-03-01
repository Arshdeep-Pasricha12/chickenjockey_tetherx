import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const API = `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:5000")}/api`;
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

mapboxgl.accessToken = MAPBOX_TOKEN;

const EMERGENCY_TYPES = [
  { id: 'breakdown', label: 'Vehicle Breakdown', icon: '🔧' },
  { id: 'accident', label: 'Accident', icon: '💥' },
  { id: 'fire', label: 'Vehicle Fire', icon: '🔥' },
  { id: 'flat_tire', label: 'Flat Tire', icon: '🛞' },
];

export default function Emergency() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('breakdown');
  const [activated, setActivated] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [usingCached, setUsingCached] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  // Detect online/offline status
  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Request geolocation on mount
  useEffect(() => {
    setLocationStatus('loading');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(loc);
          setLocationStatus('granted');
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          // Fallback to a default location (Delhi)
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
          setLocationStatus('denied');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
      setLocationStatus('denied');
    }
  }, []);

  // Initialize or update map when data arrives
  useEffect(() => {
    if (!activated || !data || !mapContainerRef.current) return;
    if (!data.nearbyServiceCenters || data.nearbyServiceCenters.length === 0) return;

    // Destroy existing map if any
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const center = userLocation || { lat: 28.6139, lng: 77.2090 };
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [center.lng, center.lat],
      zoom: 13,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // User location marker
    const userEl = document.createElement('div');
    userEl.innerHTML = '📍';
    userEl.style.fontSize = '28px';
    userEl.style.cursor = 'pointer';
    new mapboxgl.Marker({ element: userEl })
      .setLngLat([center.lng, center.lat])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<strong>You are here</strong>'))
      .addTo(map);

    // Service center markers
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([center.lng, center.lat]);

    data.nearbyServiceCenters.forEach((sc, index) => {
      const coords = sc.coordinates
        ? [sc.coordinates.lng, sc.coordinates.lat]
        : null;
      if (!coords) return;

      const el = document.createElement('div');
      el.innerHTML = '🏪';
      el.style.fontSize = '24px';
      el.style.cursor = 'pointer';

      new mapboxgl.Marker({ element: el })
        .setLngLat(coords)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="color:#111;font-family:Inter,sans-serif;padding:4px;">
              <strong>${sc.name}</strong><br/>
              <span style="font-size:12px;color:#666;">${sc.address || ''}</span><br/>
              <span style="font-size:12px;">📏 ${sc.distance} • ⭐ ${sc.rating}</span>
            </div>
          `)
        )
        .addTo(map);

      bounds.extend(coords);
    });

    // Fit map to show all markers
    if (data.nearbyServiceCenters.some(sc => sc.coordinates)) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [activated, data]);

  const handleSOS = async () => {
    setActivated(true);
    setLoading(true);
    setUsingCached(false);

    // GPS works offline! Always try to get fresh location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }

    if (!isOffline) {
      // ONLINE — fetch from API and cache results
      try {
        const body = { emergencyType: selectedType };
        if (userLocation) {
          body.lat = userLocation.lat;
          body.lng = userLocation.lng;
        }
        const res = await fetch(`${API}/emergency`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const result = await res.json();
        setData(result);

        // Cache for offline use
        localStorage.setItem('autopulse_emergency_cache', JSON.stringify({
          data: result,
          timestamp: new Date().toISOString(),
          location: userLocation,
        }));
      } catch (err) {
        console.error('API failed, trying cache:', err);
        loadCachedData();
      }
    } else {
      // OFFLINE — load from cache
      loadCachedData();
    }
    setLoading(false);
  };

  const loadCachedData = () => {
    const cached = localStorage.getItem('autopulse_emergency_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      setData({ ...parsed.data, cachedAt: parsed.timestamp });
      setUsingCached(true);
    } else {
      // No cache — show basic emergency info without service centers
      setData({
        emergencyType: selectedType,
        protocol: getOfflineProtocol(selectedType),
        nearbyServiceCenters: [],
        isRealData: false,
        userLocation,
        calmingMessage: '🫂 You\'re offline but not alone. GPS is active. Use emergency numbers below.',
        emergencyNumbers: { police: '100', ambulance: '108', fire: '101', roadside: '1800-123-4567' },
      });
      setUsingCached(false);
    }
  };

  const getOfflineProtocol = (type) => ({
    breakdown: { title: 'Vehicle Breakdown', steps: ['Turn on hazard lights', 'Move to shoulder', 'Place warning triangle 50m behind', 'Stay inside on highways', 'Call roadside assistance'] },
    accident: { title: 'Accident', steps: ['Check for injuries', 'Call 112 if hurt', 'Turn off engine, hazard lights on', 'Don\'t move vehicle', 'Document with photos'] },
    fire: { title: 'Vehicle Fire', steps: ['Pull over, engine off', 'Everyone out, 30m away', 'Call 101', 'Don\'t open hood', 'Small fire: use extinguisher'] },
    flat_tire: { title: 'Flat Tire', steps: ['Slow down gradually', 'Hazard lights + parking brake', 'Use spare tire kit', 'No spare? Call assistance', 'Don\'t drive on flat'] },
  }[type] || { title: 'Emergency', steps: ['Stay calm', 'Call 112'] });

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1>🚨 Emergency SOS & Nearest Help</h1>
        <p>One-tap help when you need it most. Stay calm — we're here for you.</p>
      </div>

      {/* Offline Banner */}
      {isOffline && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px',
          padding: '12px 16px', borderRadius: 'var(--radius-sm)',
          background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
          fontSize: '0.85rem', color: '#fca5a5',
        }}>
          <span style={{ fontSize: '1.2rem' }}>📡</span>
          <div>
            <strong>Offline Mode Active</strong> — GPS still works! {usingCached ? 'Showing cached service centers from your last session.' : 'Emergency protocols and numbers available.'}
            <br/><span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Map tiles loaded during your last online session will still display.</span>
          </div>
        </div>
      )}

      {/* Location Status */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
        padding: '10px 16px', borderRadius: 'var(--radius-sm)',
        background: locationStatus === 'granted' ? 'rgba(16, 185, 129, 0.1)' : locationStatus === 'loading' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
        border: `1px solid ${locationStatus === 'granted' ? 'rgba(16, 185, 129, 0.2)' : locationStatus === 'loading' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
        fontSize: '0.85rem',
      }}>
        <span>{locationStatus === 'granted' ? '📍' : locationStatus === 'loading' ? '⏳' : '⚠️'}</span>
        <span>
          {locationStatus === 'granted' && `Location detected: ${userLocation?.lat.toFixed(4)}, ${userLocation?.lng.toFixed(4)}`}
          {locationStatus === 'loading' && 'Detecting your location...'}
          {locationStatus === 'denied' && 'Location access denied — using default location. Allow location for best results.'}
          {locationStatus === 'idle' && 'Waiting for location...'}
        </span>
      </div>

      {/* Emergency Type Selection */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        {EMERGENCY_TYPES.map(type => (
          <button
            key={type.id}
            className="glass-card"
            onClick={() => setSelectedType(type.id)}
            style={{
              padding: '20px', textAlign: 'center', cursor: 'pointer',
              border: selectedType === type.id ? '1px solid var(--accent-red)' : '1px solid var(--border-glass)',
              background: selectedType === type.id ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-glass)',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{type.icon}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{type.label}</div>
          </button>
        ))}
      </div>

      {/* SOS Button */}
      <div className="sos-button-container">
        <button className="sos-button" onClick={handleSOS} disabled={loading} id="btn-sos">
          {loading ? '...' : isOffline ? '🔌 SOS' : 'SOS'}
        </button>
      </div>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '32px' }}>
        {isOffline ? 'Offline mode — GPS active, cached data ready' : 'Tap the SOS button for immediate assistance'}
      </p>

      {/* Results */}
      {activated && data && (
        <div className="animate-fade-in-up">
          {/* Cached Data Indicator */}
          {usingCached && data.cachedAt && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px', padding: '8px 12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              ⏱️ Using cached data from: {new Date(data.cachedAt).toLocaleString()}
            </div>
          )}

          {/* Calming Message */}
          <div className="status-banner good" style={{ marginBottom: '24px' }}>
            <span className="status-emoji">🫂</span>
            <div className="status-info">
              <h2>{isOffline ? 'Offline Emergency Mode' : 'Help is On The Way'}</h2>
              <p>{data.calmingMessage}</p>
            </div>
          </div>

          {/* Map — Online: Mapbox, Offline: Fallback Location Card */}
          {!isOffline ? (
            <div className="glass-card" style={{ padding: '0', marginBottom: '24px', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
              <div
                ref={mapContainerRef}
                style={{ width: '100%', height: '400px' }}
              />
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '0', marginBottom: '24px', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
              {/* Offline Location Fallback */}
              <div style={{
                width: '100%', height: '400px', position: 'relative',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '16px',
              }}>
                {/* Compass / Grid Radar */}
                <div style={{
                  width: '200px', height: '200px', borderRadius: '50%',
                  border: '2px solid rgba(6, 182, 212, 0.3)',
                  position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {/* Radar rings */}
                  <div style={{ width: '140px', height: '140px', borderRadius: '50%', border: '1px solid rgba(6, 182, 212, 0.15)', position: 'absolute' }}/>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '1px solid rgba(6, 182, 212, 0.1)', position: 'absolute' }}/>
                  {/* Cross lines */}
                  <div style={{ width: '100%', height: '1px', background: 'rgba(6, 182, 212, 0.1)', position: 'absolute' }}/>
                  <div style={{ width: '1px', height: '100%', background: 'rgba(6, 182, 212, 0.1)', position: 'absolute' }}/>
                  {/* Center user dot */}
                  <div style={{
                    width: '12px', height: '12px', borderRadius: '50%',
                    background: '#06b6d4', boxShadow: '0 0 20px rgba(6,182,212,0.6)',
                    animation: 'pulse 2s infinite',
                  }}/>
                  {/* Service center dots */}
                  {data.nearbyServiceCenters?.slice(0, 5).map((sc, i) => {
                    const angle = (i * 72 - 90) * (Math.PI / 180);
                    const dist = 30 + Math.min(sc.distanceKm || 3, 10) * 6;
                    return (
                      <div key={i} style={{
                        position: 'absolute',
                        left: `calc(50% + ${Math.cos(angle) * dist}px)`,
                        top: `calc(50% + ${Math.sin(angle) * dist}px)`,
                        transform: 'translate(-50%, -50%)',
                      }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}/>
                      </div>
                    );
                  })}
                  {/* Cardinal directions */}
                  <span style={{ position: 'absolute', top: '-20px', fontSize: '0.7rem', color: 'rgba(6,182,212,0.6)' }}>N</span>
                  <span style={{ position: 'absolute', bottom: '-20px', fontSize: '0.7rem', color: 'rgba(6,182,212,0.6)' }}>S</span>
                  <span style={{ position: 'absolute', right: '-16px', fontSize: '0.7rem', color: 'rgba(6,182,212,0.6)' }}>E</span>
                  <span style={{ position: 'absolute', left: '-18px', fontSize: '0.7rem', color: 'rgba(6,182,212,0.6)' }}>W</span>
                </div>

                {/* GPS Coordinates */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>
                    📡 GPS Active — Offline Map
                  </div>
                  {userLocation && (
                    <div style={{ fontFamily: 'monospace', fontSize: '1rem', color: 'var(--text-primary)' }}>
                      {userLocation.lat.toFixed(6)}°N, {userLocation.lng.toFixed(6)}°E
                    </div>
                  )}
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span style={{ color: '#06b6d4' }}>●</span> You &nbsp;&nbsp; <span style={{ color: '#f59e0b' }}>●</span> Service centers ({data.nearbyServiceCenters?.length || 0} cached)
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid-2">
            {/* Emergency Protocol */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 className="section-title">📋 {data.protocol.title} — What To Do</h3>
              <ol className="protocol-steps">
                {data.protocol.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>

            {/* Emergency Numbers */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 className="section-title">📞 Emergency Numbers</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(data.emergencyNumbers).map(([key, num]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{key.replace('_', ' ')}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent-cyan)', fontSize: '1.1rem' }}>{num}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Nearby Service Centers */}
          <div style={{ marginTop: '24px' }}>
            <h3 className="section-title">📍 Nearby Service Centers {data.isRealData ? '(Real Results via OpenStreetMap)' : '(Default)'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="stagger-children">
              {data.nearbyServiceCenters.map((center, idx) => (
                <div key={center.id || idx} className="glass-card service-card">
                  <div style={{ fontSize: '2rem' }}>🏪</div>
                  <div className="service-info" style={{ flex: 1 }}>
                    <h3>{center.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>{center.address}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.8rem' }}>
                      <span className="service-rating">⭐ {center.rating}</span>
                      <span>• {center.type}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '8px', fontSize: '0.8rem' }}>
                      {center.phone && center.phone !== 'N/A' && (
                        <a href={`tel:${center.phone}`} style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}>📞 {center.phone}</a>
                      )}
                      {center.website && (
                        <a href={center.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}>🌐 Website</a>
                      )}
                      {center.email && (
                        <a href={`mailto:${center.email}`} style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}>✉️ {center.email}</a>
                      )}
                      {center.hours && (
                        <span style={{ color: 'var(--text-muted)' }}>🕐 {center.hours}</span>
                      )}
                    </div>
                    {/* Google links for full contact details */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                      {center.coordinates && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${center.coordinates.lat},${center.coordinates.lng}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: '0.75rem', color: '#4285F4', textDecoration: 'none', padding: '4px 10px', borderRadius: '6px', background: 'rgba(66, 133, 244, 0.1)', border: '1px solid rgba(66, 133, 244, 0.2)' }}
                        >
                          📍 Open in Google Maps
                        </a>
                      )}
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(center.name + ' ' + (center.address?.split(',').slice(-3).join(',') || ''))}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: '0.75rem', color: '#34A853', textDecoration: 'none', padding: '4px 10px', borderRadius: '6px', background: 'rgba(52, 168, 83, 0.1)', border: '1px solid rgba(52, 168, 83, 0.2)' }}
                      >
                        🔍 Search on Google
                      </a>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="service-distance">{center.distance}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
