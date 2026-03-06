import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useScroll, useSpring, useTransform } from 'framer-motion';

const TOTAL_FRAMES = 192; // Total number of images in sequence

export default function SkylineScrollCanvas() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // Preload all images
  useEffect(() => {
    let loadedCount = 0;
    const loadedImages = new Array(TOTAL_FRAMES);
    
    // Naming pattern from upscaled-video is 0001.jpg -> 0192.jpg
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
       const img = new Image();
       const paddedIndex = String(i).padStart(4, '0');
       img.src = `/sequence/${paddedIndex}.jpg`;
       
       img.onload = () => {
         loadedImages[i - 1] = img;
         loadedCount++;
         setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));
         
         if (loadedCount === TOTAL_FRAMES) {
           setImages(loadedImages);
           setLoading(false);
         }
       };
       
       img.onerror = () => {
         console.warn(`Failed to load frame ${paddedIndex}`);
         // Still increment to not block loading forever
         loadedCount++;
         if (loadedCount === TOTAL_FRAMES) {
           setImages(loadedImages);
           setLoading(false);
         }
       };
    }
  }, []);

  // Framer Motion Scroll Tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth the scroll progress to avoid jitter (stiffness 100, damping 30 from prompt)
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Map progress (0 to 1) to frame index (0 to 191)
  const frameIndex = useTransform(smoothProgress, [0, 1], [0, TOTAL_FRAMES - 1]);

  // Draw current frame to canvas
  useEffect(() => {
    if (loading || !canvasRef.current || images.length === 0) return;

    const ctx = canvasRef.current.getContext('2d');
    
    // Resize observer to handle responsive canvas drawing
    let renderFrameId;
    const render = () => {
      const currentFrame = Math.floor(frameIndex.get());
      const img = images[currentFrame];
      
      if (img && img.complete) {
        // Handle responsive scaling (object-fit: cover equivalent in canvas)
        const canvas = canvasRef.current;
        const parent = canvas.parentElement;
        
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Aspect ratio calculations
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.max(hRatio, vRatio); // Max for cover, Min for contain
        
        const centerShiftX = (canvas.width - img.width * ratio) / 2;
        const centerShiftY = (canvas.height - img.height * ratio) / 2;
        
        // Ensure image blends with the dark background
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.drawImage(img, 0, 0, img.width, img.height, centerShiftX, centerShiftY, img.width * ratio, img.height * ratio);
      }
      
      renderFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    // Subscribe to framer motion changes
    const unsubscribe = frameIndex.onChange(() => {
       // Our rAF loop handles the actual drawing, keeping it buttery smooth
    });

    return () => {
      cancelAnimationFrame(renderFrameId);
      unsubscribe();
    };
  }, [loading, images, frameIndex]);

  if (loading) {
    return (
      <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#050505', color: 'white', fontFamily: 'var(--font-mono)' }}>
        <div style={{ width: '200px', height: '2px', background: '#222', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: 'var(--accent-blue)', width: `${loadProgress}%`, transition: 'width 0.2s', boxShadow: '0 0 10px var(--accent-blue)' }} />
        </div>
        <p style={{ letterSpacing: '4px', textTransform: 'uppercase', fontSize: '0.8rem' }}>Initializing Engine... {loadProgress}%</p>
      </div>
    );
  }

  return (
    // The wrapper is 400vh tall to allow for a long scroll sequence
    <div ref={containerRef} style={{ position: 'relative', height: '400vh', background: '#050505' }}>
      
      {/* Sticky container that stays in view while we scroll past the 400vh wrapper */}
      <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden' }}>
        
        <canvas 
          ref={canvasRef} 
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
        
        {/* CSS Vignette/Mask to blend the harsh video edges smoothly into #050505 */}
        <div className="canvas-vignette" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          zIndex: 5
        }} />
        <div className="canvas-shadow-overlay" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          zIndex: 6
        }} />
      </div>
    </div>
  );
}
