const fs = require('fs');

const path = 'client/src/index.css';
let css = fs.readFileSync(path, 'utf-8');

// 1. Swap Font
css = css.replace(
  /@import url\(".*?"\);/,
  '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Orbitron:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700;800&display=swap");'
);

// 2. Variables Rewrite
css = css.replace(/--bg-primary: #0a0e1a;/g, '--bg-primary: #050505;');
css = css.replace(/--bg-secondary: #111827;/g, '--bg-secondary: #0a0a0a;');
css = css.replace(/--bg-card: rgba\(17, 24, 39, 0\.6\);/g, '--bg-card: #121212;');
css = css.replace(/--bg-glass: rgba\(255, 255, 255, 0\.03\);/g, '--bg-glass: #141417;');
css = css.replace(/--bg-glass-hover: rgba\(255, 255, 255, 0\.06\);/g, '--bg-glass-hover: #1c1c20;');
css = css.replace(/--border-glass: rgba\(255, 255, 255, 0\.08\);/g, '--border-glass: #26262a;');
css = css.replace(/--border-glass-hover: rgba\(255, 255, 255, 0\.15\);/g, '--border-glass-hover: #36363a;');

css = css.replace(/--accent-blue: #3b82f6;/g, '--accent-blue: #00f0ff;');
css = css.replace(/--accent-cyan: #06b6d4;/g, '--accent-cyan: #00ffff;');
css = css.replace(/--accent-purple: #8b5cf6;/g, '--accent-purple: #b026ff;');
css = css.replace(/--accent-green: #10b981;/g, '--accent-green: #39ff14;');
css = css.replace(/--accent-yellow: #f59e0b;/g, '--accent-yellow: #ffea00;');
css = css.replace(/--accent-orange: #f97316;/g, '--accent-orange: #ff5500;');
css = css.replace(/--accent-red: #ef4444;/g, '--accent-red: #ff003c;');
css = css.replace(/--accent-pink: #ec4899;/g, '--accent-pink: #ff00a0;');

css = css.replace(/--radius-sm: 8px;/g, '--radius-sm: 2px;');
css = css.replace(/--radius-md: 12px;/g, '--radius-md: 4px;');
css = css.replace(/--radius-lg: 16px;/g, '--radius-lg: 8px;');
css = css.replace(/--radius-xl: 24px;/g, '--radius-xl: 12px;');

// 3. Typography add Mono
css = css.replace(
  /--font-display: "Outfit", "Inter", sans-serif;/,
  '--font-display: "Orbitron", "Inter", sans-serif;\n  --font-mono: "JetBrains Mono", monospace;'
);

// 4. Background Glow -> Grid
css = css.replace(
  /body::before \{[\s\S]*?z-index: 0;\n\}/,
  `body::before {
  content: "";
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 0;
}`
);

// 5. Remove body::after
css = css.replace(
  /body::after \{[\s\S]*?z-index: 0;\n\}/,
  `body::after { display: none; }`
);

// 6. Rewrite Glass Card to Dashboard Hardware Panel
css = css.replace(
  /\.glass-card \{[\s\S]*?\}\n\.glass-card:hover \{[\s\S]*?\}/,
  `.glass-card {
  background: var(--bg-card);
  border: 1px solid var(--border-glass);
  border-top: 1px solid rgba(255, 255, 255, 0.15); /* Top lighting highlight */
  border-radius: var(--radius-md);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02), 0 8px 16px rgba(0, 0, 0, 0.6);
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}
.glass-card::after {
  content: "";
  position: absolute;
  top: 0; left: 0;
  width: 3px; height: 100%;
  background: var(--accent-blue);
  opacity: 0;
  transition: opacity var(--transition-fast);
}
.glass-card:hover {
  background: var(--bg-glass-hover);
  border-color: var(--border-glass-hover);
  transform: translateY(-2px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 12px 24px rgba(0, 0, 0, 0.8);
}
.glass-card:hover::after {
  opacity: 1;
}`
);

// 7. Make buttons sharp and glowy
css = css.replace(
  /\.btn-primary \{[\s\S]*?\}\n\.btn-primary:hover \{[\s\S]*?\}/,
  `.btn-primary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--accent-blue);
  box-shadow: inset 0 0 10px rgba(0, 240, 255, 0.2), 0 0 10px rgba(0, 240, 255, 0.2);
  text-transform: uppercase;
  letter-spacing: 1px;
}
.btn-primary:hover {
  background: rgba(0, 240, 255, 0.1);
  box-shadow: inset 0 0 20px rgba(0, 240, 255, 0.4), 0 0 20px rgba(0, 240, 255, 0.4);
  transform: translateY(-1px);
}`
);

fs.writeFileSync(path, css);
console.log('CSS Rewritten successfully.');
