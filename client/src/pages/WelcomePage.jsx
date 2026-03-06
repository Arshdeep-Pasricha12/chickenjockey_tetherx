import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScroll, useTransform, motion, cubicBezier } from 'framer-motion';
import SkylineScrollCanvas from '../components/SkylineScrollCanvas';

export default function WelcomePage() {
  const navigate = useNavigate();
  // We use this ref to track the full 400vh scroll container
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Custom easing function based on Framer Motion to map opacity
  // [start, start + 0.1, end - 0.1, end] -> [0, 1, 1, 0]
  
  // Beat A: 0% - 20%
  const opacityA = useTransform(scrollYProgress, [0, 0.05, 0.15, 0.22], [0, 1, 1, 0]);
  const yA = useTransform(scrollYProgress, [0, 0.05, 0.15, 0.22], [40, 0, 0, -40]);

  // Beat B: 25% - 45%
  const opacityB = useTransform(scrollYProgress, [0.22, 0.28, 0.42, 0.48], [0, 1, 1, 0]);
  const yB = useTransform(scrollYProgress, [0.22, 0.28, 0.42, 0.48], [40, 0, 0, -40]);

  // Beat C: 50% - 70%
  const opacityC = useTransform(scrollYProgress, [0.48, 0.53, 0.67, 0.73], [0, 1, 1, 0]);
  const yC = useTransform(scrollYProgress, [0.48, 0.53, 0.67, 0.73], [40, 0, 0, -40]);

  // Beat D: 75% - 100%
  const opacityD = useTransform(scrollYProgress, [0.73, 0.8, 0.95, 1], [0, 1, 1, 1]); // Stays visible at end
  const yD = useTransform(scrollYProgress, [0.73, 0.8, 0.95, 1], [40, 0, 0, 0]);

  // Scroll Indicator Fade Out
  const indicatorOpacity = useTransform(scrollYProgress, [0, 0.05], [0.8, 0]);

  return (
    <div ref={containerRef} style={{ background: '#050505', color: '#fff', position: 'relative' }}>
      
      {/* 400vh Base Layer Canvas Animation */}
      <SkylineScrollCanvas />

      {/* Floating Header UI */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, padding: '32px 48px', zIndex: 50, display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '2px', color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
          AUTOPULSE
        </h1>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '10px 24px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textTransform: 'uppercase', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
          Skip Intro
        </button>
      </div>

      {/* Foreground Scrollytelling Layers */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', display: 'flex', flexDirection: 'column', padding: '80px 48px', zIndex: 20 }}>
        
        {/* Beat A (Centered) */}
        <motion.div style={{ opacity: opacityA, y: yA, position: 'absolute', top: '50%', left: '50%', x: '-50%', y: '-50%', textAlign: 'center', width: '100%', padding: '0 24px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 8vw, 7rem)', fontWeight: 800, color: 'rgba(255,255,255,0.95)', lineHeight: 1.1, textShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
            PURE JDM LEGEND.
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'rgba(255,170,0,0.8)', marginTop: '24px', letterSpacing: '1px' }}>
            The R34 Skyline GT-R. An icon reborn in the shadows.
          </p>
        </motion.div>

        {/* Beat B (Left Aligned) */}
        <motion.div style={{ opacity: opacityB, y: yB, position: 'absolute', top: '40%', left: '10%', maxWidth: '500px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 800, color: 'rgba(255,255,255,0.95)', lineHeight: 1.1, textShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
            UNCOMPROMISED<br/>ENGINEERING.
          </h2>
          <p style={{ fontFamily: 'var(--font-primary)', fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', marginTop: '24px', lineHeight: 1.6 }}>
            Every panel, every bolt, designed for absolute performance.
          </p>
        </motion.div>

        {/* Beat C (Right Aligned) */}
        <motion.div style={{ opacity: opacityC, y: yC, position: 'absolute', top: '50%', right: '10%', maxWidth: '500px', textAlign: 'right' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 800, color: 'rgba(255,255,255,0.95)', lineHeight: 1.1, textShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
            THE HEART OF<br/>GODZILLA.
          </h2>
          <p style={{ fontFamily: 'var(--font-primary)', fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', marginTop: '24px', lineHeight: 1.6 }}>
            Twin-turbocharged precision. The raw mechanical soul exposed.
          </p>
        </motion.div>

        {/* Beat D (Centered CTA) */}
        <motion.div style={{ opacity: opacityD, y: yD, position: 'absolute', top: '50%', left: '50%', x: '-50%', y: '-50%', textAlign: 'center', pointerEvents: 'auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 7vw, 6rem)', fontWeight: 800, color: 'rgba(255,255,255,0.95)', lineHeight: 1.1, marginBottom: '32px', textShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
            FLAWLESS<br/>RECONSTRUCTION.
          </h2>
          <button onClick={() => navigate('/dashboard')} style={{ background: '#00f0ff', color: '#000', border: 'none', padding: '18px 48px', fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', cursor: 'pointer', boxShadow: '0 0 30px rgba(0,240,255,0.4)', transition: 'all 0.3s ease' }}>
            Enter Experience
          </button>
          <p style={{ fontFamily: 'var(--font-primary)', fontSize: '1rem', color: 'rgba(255,255,255,0.6)', marginTop: '24px' }}>
            Experience the legacy of real-time telemetry.
          </p>
        </motion.div>

      </div>

      {/* Scroll Indicator */}
      <motion.div style={{ opacity: indicatorOpacity, position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, textAlign: 'center', pointerEvents: 'none' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '4px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>
          Scroll to Ignite
        </p>
        <div style={{ width: '1px', height: '60px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)', margin: '0 auto' }} />
      </motion.div>

    </div>
  );
}
