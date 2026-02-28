import { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';

export default function Timeline() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <h1>📜 Vehicle Health Timeline</h1>
        <p>Your car's journey — every checkup, alert, and fix documented</p>
      </div>

      {loading ? (
        <div className="loading-spinner"></div>
      ) : history.length > 0 ? (
        <div className="timeline stagger-children">
          {history.map(event => (
            <div key={event.id} className="glass-card timeline-event">
              <div className="timeline-date">{formatDate(event.date)}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ fontSize: '1.3rem' }}>{event.emoji}</span>
                <span className="timeline-title">{event.title}</span>
                <span className={`badge badge-${event.status === 'healthy' ? 'healthy' : event.status === 'resolved' ? 'low' : event.status === 'critical' ? 'critical' : 'medium'}`} style={{ marginLeft: 'auto' }}>
                  {event.status}
                </span>
              </div>
              <p className="timeline-summary">{event.summary}</p>
              {event.faultsFound > 0 && (
                <p style={{ fontSize: '0.8rem', color: 'var(--accent-orange)', marginTop: '6px' }}>
                  ⚠️ {event.faultsFound} fault{event.faultsFound !== 1 ? 's' : ''} found
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card empty-state">
          <div className="empty-state-icon">📜</div>
          <h3>No History Yet</h3>
          <p>Run your first diagnosis to start building your vehicle's health timeline.</p>
        </div>
      )}
    </div>
  );
}
