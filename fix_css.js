const fs = require('fs');

let css = fs.readFileSync('client/src/index.css', 'utf-8');

// Replace .sidebar
css = css.replace(
  /\.sidebar \{[\s\S]*?overflow-y: auto;\r?\n\}/,
  `.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--bg-primary);
  border-right: 2px solid var(--border-glass);
  box-shadow: 4px 0 24px rgba(0,0,0,0.8);
  display: flex;
  flex-direction: column;
  z-index: 100;
  overflow-y: auto;
}`
);

// Replace .nav-link.active
css = css.replace(
  /\.nav-link\.active \{[\s\S]*?border: 1px solid rgba\(59, 130, 246, 0\.2\);\r?\n\}/,
  `.nav-link.active {
  color: var(--accent-blue);
  background: rgba(0, 240, 255, 0.05);
  border: 1px solid rgba(0, 240, 255, 0.2);
  box-shadow: inset 4px 0 0 var(--accent-blue), 0 0 10px rgba(0,240,255,0.1);
  text-shadow: 0 0 8px rgba(0,240,255,0.4);
}`
);

// Replace gauge classes
css = css.replace(
  /\.gauge-bg \{[\s\S]*?stroke-linecap: round;\r?\n\}/,
  `.gauge-bg {
  fill: none;
  stroke: var(--bg-card);
  stroke-width: 12;
  stroke-linecap: butt;
}`
);

css = css.replace(
  /\.gauge-fill \{[\s\S]*?filter: drop-shadow\(0 0 6px var\(--gauge-color\)\);\r?\n\}/,
  `.gauge-fill {
  fill: none;
  stroke-width: 12;
  stroke-linecap: butt;
  transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 0 6px var(--gauge-color));
}`
);

fs.writeFileSync('client/src/index.css', css);
console.log('CSS Fixed');
