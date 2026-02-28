import { useEffect, useRef } from 'react';

export default function GaugeChart({ value, min = 0, max = 100, label, unit, color = '#3b82f6' }) {
  const gaugeRef = useRef(null);

  useEffect(() => {
    if (!gaugeRef.current) return;
    const path = gaugeRef.current;
    const radius = 55;
    const circumference = Math.PI * radius; // half circle
    const pct = Math.min(1, Math.max(0, (value - min) / (max - min)));
    const offset = circumference * (1 - pct);
    
    // Animate from full offset to target
    path.style.strokeDasharray = `${circumference}`;
    path.style.strokeDashoffset = `${circumference}`;
    
    requestAnimationFrame(() => {
      path.style.strokeDashoffset = `${offset}`;
    });
  }, [value, min, max]);

  // Determine gauge color based on value position
  const pct = (value - min) / (max - min);
  const gaugeColor = color;

  return (
    <div className="gauge-container glass-card">
      <svg className="gauge-svg" viewBox="0 0 120 70">
        {/* Background arc */}
        <path
          className="gauge-bg"
          d="M 10 65 A 55 55 0 0 1 110 65"
        />
        {/* Filled arc */}
        <path
          ref={gaugeRef}
          className="gauge-fill"
          d="M 10 65 A 55 55 0 0 1 110 65"
          style={{ stroke: gaugeColor, '--gauge-color': gaugeColor }}
        />
        {/* Value text */}
        <text className="gauge-value" x="60" y="58">
          {typeof value === 'number' ? value.toFixed(0) : value}
        </text>
      </svg>
      <div className="gauge-label">
        {label} <span className="gauge-unit">{unit && `(${unit})`}</span>
      </div>
    </div>
  );
}
