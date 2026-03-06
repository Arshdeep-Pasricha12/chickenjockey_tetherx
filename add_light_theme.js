const fs = require('fs');

let css = fs.readFileSync('client/src/index.css', 'utf-8');

const lightThemeCSS = `
/* ─── Light Mode Overrides ─────────────────── */
[data-theme='light'] {
  --bg-primary: #f0f2f5;
  --bg-secondary: #ffffff;
  --bg-card: #ffffff;
  --bg-glass: #ffffff;
  --bg-glass-hover: #f8fafc;

  --border-glass: #cbd5e1;
  --border-glass-hover: #94a3b8;

  --text-primary: #0f172a;
  --text-secondary: #334155;
  --text-muted: #64748b;

  --accent-blue: #2563eb;
  --accent-cyan: #0284c7;

  --gradient-hero: linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #0284c7 100%);
}
`;

if (!css.includes("[data-theme='light']")) {
  css = css.replace('/* ─── Reset & Base ─────────────────────────── */', lightThemeCSS + '\n/* ─── Reset & Base ─────────────────────────── */');
  fs.writeFileSync('client/src/index.css', css, 'utf-8');
  console.log('Light theme added');
} else {
  console.log('Light theme already exists');
}
