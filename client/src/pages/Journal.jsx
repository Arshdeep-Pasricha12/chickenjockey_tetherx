import { useState, useEffect } from 'react';

const API = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

export default function Journal() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memoryText, setMemoryText] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API}/history`);
      const data = await res.json();
      setHistory(data.history);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAddMemory = async () => {
    if (!memoryText.trim()) return;
    setAdding(true);
    try {
      const payload = {
        type: 'memory',
        title: 'Driver Memory',
        summary: memoryText,
        status: 'memory',
        faultsFound: 0
      };

      const res = await fetch(`${API}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setMemoryText('');
        fetchHistory(); // Refresh timeline
      }
    } catch (err) {
      console.error('Failed to add memory', err);
    }
    setAdding(false);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1>📖 Car's Health Journal</h1>
        <p>A timeline of memories, care, and intelligent diagnostics for your vehicle.</p>
      </div>

      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 className="section-title" style={{ letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent-blue)' }}>✍️ Add a Memory or Log</h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <textarea 
            className="form-input" 
            placeholder="e.g., Drove 500km to the mountains today! Car ran perfectly. 🏔️"
            rows={2}
            value={memoryText} 
            onChange={e => setMemoryText(e.target.value)} 
            style={{ resize: 'vertical', flex: 1, fontFamily: 'var(--font-mono)', background: '#020202', borderColor: '#222', color: 'var(--accent-cyan)' }}
          />
          <button className="btn btn-primary" onClick={handleAddMemory} disabled={adding || !memoryText.trim()} style={{ whiteSpace: 'nowrap', height: 'fit-content' }}>
            {adding ? '⏳ Saving...' : '➕ Add Memory'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"></div>
      ) : history.length > 0 ? (
        <div className="timeline stagger-children" style={{ position: 'relative', paddingLeft: '20px', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
          {history.map(event => {
            const isMemory = event.type === 'memory';
            return (
              <div key={event.id} className="glass-card timeline-event" style={{ 
                  position: 'relative',
                  marginBottom: '20px',
                  background: isMemory ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-glass)',
                  border: isMemory ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid var(--border-glass)'
                }}>
                <div style={{
                  position: 'absolute', left: '-33px', top: '24px',
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: isMemory ? '#3b82f6' : 'var(--bg-glass)',
                  border: '2px solid var(--bg-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px'
                }}>
                  {isMemory ? '📸' : '🤖'}
                </div>

                <div className="timeline-date" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase' }}>{formatDate(event.date)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  {!isMemory && <span style={{ fontSize: '1.3rem' }}>{event.emoji}</span>}
                  <span className="timeline-title" style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: isMemory ? 'var(--accent-blue)' : 'inherit', textShadow: isMemory ? '0 0 10px rgba(0,240,255,0.4)' : 'none' }}>
                    {isMemory ? 'DRIVER MEMORY' : event.title}
                  </span>
                  {!isMemory && (
                    <span className={`badge badge-${event.status === 'healthy' ? 'healthy' : event.status === 'resolved' ? 'low' : event.status === 'critical' ? 'critical' : 'medium'}`} style={{ marginLeft: 'auto' }}>
                      {event.status}
                    </span>
                  )}
                  {isMemory && (
                    <span className="badge" style={{ marginLeft: 'auto', background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd' }}>
                      User Log
                    </span>
                  )}
                </div>
                <p className="timeline-summary" style={{ fontStyle: isMemory ? 'italic' : 'normal', fontSize: isMemory ? '1.05rem' : '0.9rem' }}>
                  {isMemory ? `"${event.summary}"` : event.summary}
                </p>
                {event.faultsFound > 0 && !isMemory && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--accent-orange)', marginTop: '8px', padding: '6px 10px', background: 'rgba(255,145,0,0.1)', borderRadius: '4px', display: 'inline-block' }}>
                    ⚠️ {event.faultsFound} fault{event.faultsFound !== 1 ? 's' : ''} intelligently diagnosed
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card empty-state">
          <div className="empty-state-icon">📖</div>
          <h3>Your Journal is Empty</h3>
          <p>Add your first vehicle memory above, or run an AI diagnosis to start building your health timeline.</p>
        </div>
      )}
    </div>
  );
}
