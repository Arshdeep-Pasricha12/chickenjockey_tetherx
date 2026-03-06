const fs = require('fs');

const path = 'client/src/index.css';
let css = fs.readFileSync(path, 'utf-8');

// 1. Sidebar Styles
css = css.replace(
  /\.sidebar \{[\s\S]*?overflow-y: auto;\n\}/,
  `.sidebar {
  position: fixed;
  top: 0; left: 0;
  width: var(--sidebar-width); height: 100vh;
  background: var(--bg-primary);
  border-right: 2px solid var(--border-glass);
  box-shadow: 4px 0 24px rgba(0,0,0,0.8);
  display: flex; flex-direction: column;
  z-index: 100; overflow-y: auto;
}`
);

// 2. Nav Link Active State (Neon Highlight)
css = css.replace(
  /\.nav-link\.active \{[\s\S]*?\}\n\.nav-link\.active::before \{[\s\S]*?\}/,
  `.nav-link.active {
  color: var(--accent-blue);
  background: rgba(0, 240, 255, 0.05);
  border: 1px solid rgba(0, 240, 255, 0.2);
  box-shadow: inset 4px 0 0 var(--accent-blue), 0 0 10px rgba(0,240,255,0.1);
  text-shadow: 0 0 8px rgba(0,240,255,0.4);
}`
);

// 3. User Info Box in Sidebar (Remove gradient, make hardware panel)
css = css.replace(
  /background: linear-gradient\(135deg, #3b82f6, #8b5cf6\)/g,
  'background: var(--border-glass); border: 1px solid var(--accent-blue)'
);

// 4. Force dark theme and delete light theme block
css = css.replace(
  /\/\* ─── Light Theme Override ────────[\s\S]*?\/\* ─── Reset \& Base ────────/,
  '/* ─── Reset & Base ────────'
);


fs.writeFileSync(path, css);
console.log('Phase 2 CSS replaced');
