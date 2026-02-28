import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isSignUp) {
      if (!fullName.trim()) {
        setError('Please enter your name');
        setLoading(false);
        return;
      }
      const { error: err } = await signUp(email, password, fullName);
      if (err) {
        setError(err.message);
      } else {
        setSuccess('Account created! Check your email to confirm, or sign in now.');
        setIsSignUp(false);
      }
    } else {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError(err.message);
      }
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background particles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${6 + Math.random() * 12}px`,
            height: `${6 + Math.random() * 12}px`,
            borderRadius: '50%',
            background: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'][i % 5],
            opacity: 0.12 + Math.random() * 0.12,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${8 + Math.random() * 12}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}/>
        ))}
      </div>

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '-150px', right: '-150px', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', bottom: '-150px', left: '-150px', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>

      {/* Main Card */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '440px',
        margin: '0 20px',
        animation: 'authSlideIn 0.6s ease forwards',
      }}>
        {/* Logo & Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            fontSize: '3.5rem',
            marginBottom: '8px',
            filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.3))',
            animation: 'carBounce 3s ease infinite',
          }}>🚗</div>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '2rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '4px',
          }}>AutoPulse</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Vehicle Intelligence Platform
          </p>
        </div>

        {/* Glass Card */}
        <div style={{
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(24px)',
          border: '1px solid var(--border-glass)',
          borderRadius: '20px',
          padding: '36px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          {/* Tab Switcher */}
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '28px',
          }}>
            <button onClick={() => { setIsSignUp(false); setError(''); }} style={{
              flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 600,
              background: !isSignUp ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'transparent',
              color: !isSignUp ? 'white' : 'var(--text-muted)',
              transition: 'all 0.3s ease',
            }}>
              Sign In
            </button>
            <button onClick={() => { setIsSignUp(true); setError(''); }} style={{
              flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 600,
              background: isSignUp ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'transparent',
              color: isSignUp ? 'white' : 'var(--text-muted)',
              transition: 'all 0.3s ease',
            }}>
              Sign Up
            </button>
          </div>

          {/* Title */}
          <h2 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 700,
            color: 'var(--text-primary)', marginBottom: '6px',
          }}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
            {isSignUp ? 'Start monitoring your vehicle in minutes' : 'Sign in to your vehicle dashboard'}
          </p>

          {/* Error / Success */}
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: '10px', marginBottom: '16px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#fca5a5', fontSize: '0.8rem',
            }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div style={{
              padding: '10px 14px', borderRadius: '10px', marginBottom: '16px',
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
              color: '#6ee7b7', fontSize: '0.8rem',
            }}>
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name (signup only) */}
            {isSignUp && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block', fontSize: '0.8rem', fontWeight: 500,
                  color: 'var(--text-secondary)', marginBottom: '6px',
                }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' }}>👤</span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Arshdeep Singh"
                    style={{
                      width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem',
                      outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border-glass)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', fontSize: '0.8rem', fontWeight: 500,
                color: 'var(--text-secondary)', marginBottom: '6px',
              }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' }}>✉️</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{
                    width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)',
                    color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem',
                    outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border-glass)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block', fontSize: '0.8rem', fontWeight: 500,
                color: 'var(--text-secondary)', marginBottom: '6px',
              }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' }}>🔒</span>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={isSignUp ? 'Min 6 characters' : '••••••••'}
                  required
                  minLength={6}
                  style={{
                    width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)',
                    color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem',
                    outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border-glass)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: loading ? '#475569' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: '1rem',
                fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(59,130,246,0.3)',
                transform: loading ? 'none' : 'translateY(0)',
              }}
              onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 30px rgba(59,130,246,0.4)'; }}}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 20px rgba(59,130,246,0.3)'; }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </span>
              ) : (
                <span>{isSignUp ? '🚀 Create Account' : '🔓 Sign In'}</span>
              )}
            </button>
          </form>

          {/* Features (sign up mode) */}
          {isSignUp && (
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { icon: '🫀', text: 'Live Health' },
                  { icon: '🔍', text: 'AI Diagnostics' },
                  { icon: '🚨', text: 'Emergency SOS' },
                  { icon: '🔮', text: 'Predictions' },
                ].map((f, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '0.75rem', color: 'var(--text-muted)',
                    padding: '6px 10px', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.02)',
                  }}>
                    <span>{f.icon}</span> {f.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom text */}
        <p style={{
          textAlign: 'center', marginTop: '20px', fontSize: '0.75rem', color: 'var(--text-muted)',
        }}>
          AutoPulse v1.0 — Your vehicle's best friend 🚗
        </p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes authSlideIn {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes carBounce {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-25px) translateX(5px); }
        }
      `}</style>
    </div>
  );
}
