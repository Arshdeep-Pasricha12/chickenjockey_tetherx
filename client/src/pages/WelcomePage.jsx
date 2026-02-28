import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WelcomeScene from '../components/WelcomeScene';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const name = user?.user_metadata?.full_name || 'Driver';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      width: '100vw', height: '100vh', overflow: 'hidden',
      background: '#0a0e1a',
    }}>
      {/* Full-screen 3D scene */}
      <WelcomeScene />

      {/* Overlay UI */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        pointerEvents: 'none', zIndex: 2,
      }}>
        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 32px', pointerEvents: 'auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>🚗</span>
            <span style={{
              fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 800,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>AutoPulse</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 14px', borderRadius: '20px',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.65rem', color: 'white', fontWeight: 700,
            }}>
              {name.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 500 }}>
              {name}
            </span>
          </div>
        </div>

        {/* Center content */}
        <div style={{
          textAlign: 'center', padding: '0 20px',
          animation: 'fadeSlideUp 1.2s ease forwards',
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
          paddingTop: '8vh',
        }}>
          <p style={{
            fontSize: '0.75rem', color: 'rgba(200,215,240,0.9)',
            textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '14px',
          }}>
            Welcome back, {name}
          </p>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2.2rem, 6vw, 4rem)',
            fontWeight: 800, lineHeight: 1.05, marginBottom: '16px',
            background: 'linear-gradient(135deg, #e2e8f0 30%, #3b82f6 70%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Your Vehicle,<br />Under Control
          </h1>
          <p style={{
            fontSize: '0.95rem', color: 'rgba(200,215,240,0.75)',
            maxWidth: '420px', margin: '0 auto',
          }}>
            Real-time diagnostics, AI predictions, and emergency response
          </p>
        </div>

        {/* Bottom — Enter Dashboard */}
        <div style={{
          textAlign: 'center', padding: '0 20px 48px',
          pointerEvents: 'auto',
          animation: 'fadeSlideUp 1.5s ease forwards',
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '14px 44px', borderRadius: '50px', border: '1px solid rgba(59,130,246,0.3)',
              background: 'rgba(59,130,246,0.15)',
              backdropFilter: 'blur(20px)',
              color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: '1rem',
              fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.3s ease',
              letterSpacing: '0.5px',
            }}
            onMouseEnter={e => {
              e.target.style.background = 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
              e.target.style.borderColor = 'transparent';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 32px rgba(59,130,246,0.4)';
            }}
            onMouseLeave={e => {
              e.target.style.background = 'rgba(59,130,246,0.15)';
              e.target.style.borderColor = 'rgba(59,130,246,0.3)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Enter Dashboard →
          </button>
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '28px', marginTop: '20px',
          }}>
            {[
              { icon: '🫀', label: 'Live Health' },
              { icon: '🔍', label: 'AI Diagnosis' },
              { icon: '🚨', label: 'Emergency SOS' },
              { icon: '🔮', label: 'Predictions' },
            ].map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '0.7rem', color: 'rgba(200,215,240,0.7)',
              }}>
                <span style={{ fontSize: '0.8rem' }}>{f.icon}</span> {f.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
