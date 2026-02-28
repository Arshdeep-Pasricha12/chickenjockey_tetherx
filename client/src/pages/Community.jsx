import { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';

const POPULAR_CARS = [
  { make: 'Maruti Suzuki', model: 'Swift', year: '2020' },
  { make: 'Maruti Suzuki', model: 'Baleno', year: '2021' },
  { make: 'Hyundai', model: 'Creta', year: '2022' },
  { make: 'Hyundai', model: 'i20', year: '2021' },
  { make: 'Tata', model: 'Nexon', year: '2023' },
  { make: 'Tata', model: 'Punch', year: '2023' },
  { make: 'Kia', model: 'Seltos', year: '2022' },
  { make: 'Kia', model: 'Sonet', year: '2022' },
  { make: 'Mahindra', model: 'XUV700', year: '2023' },
  { make: 'Toyota', model: 'Fortuner', year: '2022' },
  { make: 'Honda', model: 'City', year: '2021' },
  { make: 'MG', model: 'Hector', year: '2022' },
];

const SEVERITY_CONFIG = {
  critical: { color: '#ff1744', bg: 'rgba(255,23,68,0.1)', border: 'rgba(255,23,68,0.25)', icon: '🔴', label: 'Critical' },
  high: { color: '#ff6d00', bg: 'rgba(255,109,0,0.1)', border: 'rgba(255,109,0,0.25)', icon: '🟠', label: 'High' },
  medium: { color: '#ffc400', bg: 'rgba(255,196,0,0.1)', border: 'rgba(255,196,0,0.25)', icon: '🟡', label: 'Medium' },
  low: { color: '#00e676', bg: 'rgba(0,230,118,0.1)', border: 'rgba(0,230,118,0.25)', icon: '🟢', label: 'Low' },
};

const CATEGORY_ICONS = {
  Engine: '⚙️', Transmission: '🔄', Electrical: '⚡', Suspension: '🔩',
  Brakes: '🛑', 'AC/Climate': '❄️', Body: '🚗', 'Fuel System': '⛽',
  Steering: '🎯', Exhaust: '💨',
};

function renderMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

export default function Community() {
  // Tab state
  const [activeTab, setActiveTab] = useState('car-check');

  // Car issues state
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [issues, setIssues] = useState([]);
  const [carInfo, setCarInfo] = useState(null);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [expandedIssue, setExpandedIssue] = useState(null);
  const [confirmedIssues, setConfirmedIssues] = useState(new Set());
  const [dismissedIssues, setDismissedIssues] = useState(new Set());

  // Existing community state
  const [tips, setTips] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [author, setAuthor] = useState('');
  const [loadingCommunity, setLoadingCommunity] = useState(false);

  useEffect(() => {
    if (activeTab === 'tips' || activeTab === 'questions') {
      fetchCommunityData();
    }
  }, [activeTab]);

  const fetchCommunityData = async () => {
    setLoadingCommunity(true);
    try {
      const [tipsRes, qRes] = await Promise.all([
        fetch(`${API}/community/tips`),
        fetch(`${API}/community/questions`),
      ]);
      const tipsData = await tipsRes.json();
      const qData = await qRes.json();
      setTips(tipsData.tips || []);
      setQuestions(qData.questions || []);
    } catch (err) {
      console.error(err);
    }
    setLoadingCommunity(false);
  };

  const handleFetchIssues = async (e) => {
    e?.preventDefault();
    if (!make.trim() || !model.trim()) return;
    setLoadingIssues(true);
    setIssues([]);
    setCarInfo(null);
    setExpandedIssue(null);
    setConfirmedIssues(new Set());
    setDismissedIssues(new Set());

    try {
      const res = await fetch(`${API}/community/car-issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ make: make.trim(), model: model.trim(), year: year.trim() }),
      });
      const data = await res.json();
      if (data.issues) {
        setIssues(data.issues);
        setCarInfo(data.car);
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingIssues(false);
  };

  const handleQuickSelect = (car) => {
    setMake(car.make);
    setModel(car.model);
    setYear(car.year);
  };

  const handleConfirm = (idx) => {
    setConfirmedIssues(prev => new Set([...prev, idx]));
    setDismissedIssues(prev => { const s = new Set(prev); s.delete(idx); return s; });
    setExpandedIssue(idx);
  };

  const handleDismiss = (idx) => {
    setDismissedIssues(prev => new Set([...prev, idx]));
    setConfirmedIssues(prev => { const s = new Set(prev); s.delete(idx); return s; });
    if (expandedIssue === idx) setExpandedIssue(null);
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    try {
      await fetch(`${API}/community/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: author || 'Anonymous', content: newQuestion }),
      });
      setNewQuestion('');
      setAuthor('');
      fetchCommunityData();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <h1>🔍 Is This Normal for My Car?</h1>
        <p>Enter your car model to discover known issues — powered by real owner data & AI</p>
      </div>

      {/* Tab Switch */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <button className={`btn ${activeTab === 'car-check' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('car-check')}>
          🚗 Car Issue Check
        </button>
        <button className={`btn ${activeTab === 'tips' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('tips')}>
          💡 Expert Tips
        </button>
        <button className={`btn ${activeTab === 'questions' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('questions')}>
          ❓ Q&A Forum
        </button>
      </div>

      {/* ═══ CAR CHECK TAB ═══ */}
      {activeTab === 'car-check' && (
        <div>
          {/* Car Selection Form */}
          <form onSubmit={handleFetchIssues} className="glass-card" style={{ padding: '28px', marginBottom: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>
              🚘 Enter Your Vehicle
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              We'll find the most commonly reported issues for your exact car model
            </p>

            <div className="grid-3" style={{ marginBottom: '20px' }}>
              <div className="form-group">
                <label>Make / Brand</label>
                <input type="text" className="form-input" placeholder="e.g. Maruti Suzuki" value={make} onChange={e => setMake(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Model</label>
                <input type="text" className="form-input" placeholder="e.g. Swift" value={model} onChange={e => setModel(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Year (optional)</label>
                <input type="text" className="form-input" placeholder="e.g. 2020" value={year} onChange={e => setYear(e.target.value)} />
              </div>
            </div>

            {/* Quick Select Popular Cars */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Popular Cars
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {POPULAR_CARS.map((car, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleQuickSelect(car)}
                    className="community-car-chip"
                  >
                    {car.make} {car.model} {car.year}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loadingIssues || !make.trim() || !model.trim()}>
              {loadingIssues ? '⏳ Analyzing...' : '🔍 Find Known Issues'}
            </button>
          </form>

          {/* Loading Skeleton */}
          {loadingIssues && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card community-skeleton" style={{ padding: '24px', height: '120px' }}>
                  <div className="community-skeleton-line" style={{ width: '40%', height: '16px', marginBottom: '12px' }} />
                  <div className="community-skeleton-line" style={{ width: '80%', height: '12px', marginBottom: '8px' }} />
                  <div className="community-skeleton-line" style={{ width: '60%', height: '12px' }} />
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {issues.length > 0 && !loadingIssues && (
            <div>
              {/* Car Header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                marginBottom: '24px', padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))',
                border: '1px solid rgba(59,130,246,0.15)'
              }}>
                <span style={{ fontSize: '2rem' }}>🚗</span>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    {carInfo?.year} {carInfo?.make} {carInfo?.model}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {issues.length} known issues found — Do any of these affect your car?
                  </p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                  <span className="badge badge-healthy">{issues.length - confirmedIssues.size - dismissedIssues.size} unchecked</span>
                  {confirmedIssues.size > 0 && <span className="badge badge-high">{confirmedIssues.size} confirmed</span>}
                </div>
              </div>

              {/* Issues Grid */}
              <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {issues.map((issue, idx) => {
                  const sev = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.medium;
                  const catIcon = CATEGORY_ICONS[issue.category] || '🔧';
                  const isConfirmed = confirmedIssues.has(idx);
                  const isDismissed = dismissedIssues.has(idx);
                  const isExpanded = expandedIssue === idx;

                  return (
                    <div
                      key={idx}
                      className="glass-card"
                      style={{
                        padding: '24px',
                        borderLeft: `4px solid ${sev.color}`,
                        opacity: isDismissed ? 0.45 : 1,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {/* Issue Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '1.2rem' }}>{catIcon}</span>
                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {issue.title}
                            </h4>
                            <span className={`badge badge-${issue.severity}`} style={{ fontWeight: 700 }}>
                              {sev.icon} {sev.label}
                            </span>
                            <span style={{
                              padding: '3px 10px', borderRadius: '12px', fontSize: '0.7rem',
                              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                              color: 'var(--accent-blue)', fontWeight: 600,
                            }}>
                              {issue.category}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            {issue.description}
                          </p>
                        </div>
                      </div>

                      {/* Stats Bar */}
                      <div style={{
                        display: 'flex', gap: '20px', alignItems: 'center',
                        padding: '12px 16px', borderRadius: '10px',
                        background: 'rgba(0,0,0,0.15)', marginBottom: '14px',
                        flexWrap: 'wrap',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>👥 Affected:</span>
                          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: sev.color }}>
                            {issue.affectedPercent}% of owners
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>💰 Est. Cost:</span>
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {issue.estimatedCost}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>⏱️ Urgency:</span>
                          <span style={{
                            fontSize: '0.78rem', fontWeight: 600,
                            color: issue.urgency === 'Fix immediately' ? '#ff1744' :
                              issue.urgency === 'Fix within a week' ? '#ff6d00' : 'var(--accent-green)',
                          }}>
                            {issue.urgency}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
                        {!isConfirmed && !isDismissed && (
                          <>
                            <button
                              className="btn"
                              onClick={() => handleConfirm(idx)}
                              style={{
                                background: `linear-gradient(135deg, ${sev.color}33, ${sev.color}11)`,
                                border: `1px solid ${sev.color}44`,
                                color: sev.color, fontSize: '0.85rem', padding: '8px 18px',
                              }}
                            >
                              ⚠️ I have this issue
                            </button>
                            <button
                              className="btn btn-outline"
                              onClick={() => handleDismiss(idx)}
                              style={{ fontSize: '0.85rem', padding: '8px 18px' }}
                            >
                              ✓ Not me
                            </button>
                          </>
                        )}
                        {isConfirmed && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.82rem', color: sev.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                              ⚠️ Issue confirmed — see fix details below
                            </span>
                            <button
                              className="btn btn-outline"
                              onClick={() => {
                                setConfirmedIssues(prev => { const s = new Set(prev); s.delete(idx); return s; });
                                setExpandedIssue(null);
                              }}
                              style={{ fontSize: '0.75rem', padding: '4px 10px', marginLeft: '10px', borderColor: 'transparent' }}
                            >
                              Undo
                            </button>
                            <button
                              className="btn btn-outline"
                              onClick={() => setExpandedIssue(isExpanded ? null : idx)}
                              style={{ marginLeft: 'auto', fontSize: '0.82rem', padding: '6px 14px' }}
                            >
                              {isExpanded ? '▲ Hide Details' : '▼ Show Fix Details'}
                            </button>
                          </div>
                        )}
                        {isDismissed && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                              ✓ Dismissed
                            </span>
                            <button
                              className="btn btn-outline"
                              onClick={() => {
                                setDismissedIssues(prev => { const s = new Set(prev); s.delete(idx); return s; });
                              }}
                              style={{ fontSize: '0.75rem', padding: '4px 10px', marginLeft: '10px', borderColor: 'transparent' }}
                            >
                              Undo
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Expanded Fix Details */}
                      {isExpanded && isConfirmed && (
                        <div style={{
                          marginTop: '16px', padding: '20px',
                          background: 'rgba(139, 92, 246, 0.06)',
                          borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)',
                          animation: 'fadeInUp 0.3s ease',
                        }}>
                          <h5 style={{
                            margin: '0 0 12px 0', color: '#a78bfa',
                            display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem',
                          }}>
                            🔧 Recommended Fix
                          </h5>
                          <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
                            {issue.typicalFix}
                          </p>
                          <div style={{
                            display: 'flex', gap: '16px', flexWrap: 'wrap',
                            padding: '12px 16px', borderRadius: '8px',
                            background: 'rgba(0,0,0,0.15)',
                          }}>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Estimated Cost</span>
                              <p style={{ margin: '2px 0 0', fontWeight: 700, color: 'var(--text-primary)' }}>{issue.estimatedCost}</p>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Urgency</span>
                              <p style={{ margin: '2px 0 0', fontWeight: 700, color: issue.urgency === 'Fix immediately' ? '#ff1744' : 'var(--accent-green)' }}>
                                {issue.urgency}
                              </p>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Owners Affected</span>
                              <p style={{ margin: '2px 0 0', fontWeight: 700, color: sev.color }}>~{issue.affectedPercent}%</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              {confirmedIssues.size > 0 && (
                <div className="glass-card" style={{
                  padding: '20px', marginTop: '24px',
                  background: 'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(249,115,22,0.06))',
                  border: '1px solid rgba(239,68,68,0.15)',
                }}>
                  <h4 style={{ margin: '0 0 8px 0', fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
                    ⚠️ You confirmed {confirmedIssues.size} issue{confirmedIssues.size > 1 ? 's' : ''}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    Head to <strong>Smart Diagnosis</strong> or <strong>AI Assistant</strong> for personalized analysis of your confirmed issues.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Empty state when no search done */}
          {issues.length === 0 && !loadingIssues && !carInfo && (
            <div className="glass-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚘</div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Enter your car details above
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                We'll check for the most common issues reported by other owners of the same car
              </p>
            </div>
          )}
        </div>
      )}

      {/* ═══ TIPS TAB ═══ */}
      {activeTab === 'tips' && (
        loadingCommunity ? <div className="loading-spinner" /> : (
          <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {tips.map(tip => (
              <div key={tip.id} className="glass-card tip-card">
                <div className="tip-header">
                  <span className="tip-avatar">{tip.avatar}</span>
                  <div>
                    <span className="tip-author">{tip.author}</span>
                    <span className="tip-tag">{tip.tag}</span>
                  </div>
                  <span className="tip-date" style={{ marginLeft: 'auto' }}>{formatDate(tip.date)}</span>
                </div>
                <p className="tip-content">{tip.content}</p>
                <span className="tip-likes">❤️ {tip.likes} likes</span>
              </div>
            ))}
          </div>
        )
      )}

      {/* ═══ Q&A TAB ═══ */}
      {activeTab === 'questions' && (
        loadingCommunity ? <div className="loading-spinner" /> : (
          <div>
            <form onSubmit={handleAsk} className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 className="section-title" style={{ marginBottom: '16px' }}>✍️ Ask the Community</h3>
              <div className="grid-2">
                <div className="form-group">
                  <label>Your Name (optional)</label>
                  <input type="text" className="form-input" placeholder="Anonymous" value={author} onChange={e => setAuthor(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Your Question</label>
                  <input type="text" className="form-input" placeholder="What's on your mind?" value={newQuestion} onChange={e => setNewQuestion(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">📤 Post Question</button>
            </form>

            <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {questions.map(q => (
                <div key={q.id} className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600 }}>{q.author}</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className={`badge ${q.resolved ? 'badge-healthy' : 'badge-medium'}`}>
                        {q.resolved ? '✅ Resolved' : '🔵 Open'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(q.date)}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{q.content}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>💬 {q.answers} answer{q.answers !== 1 ? 's' : ''}</p>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
