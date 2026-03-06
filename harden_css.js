const fs = require('fs');
let css = fs.readFileSync('client/src/index.css', 'utf-8');

// Harden border radius
css = css.replace(/--radius-sm: 2px;/g, '--radius-sm: 0px;');
css = css.replace(/--radius-md: 4px;/g, '--radius-md: 0px;');
css = css.replace(/--radius-lg: 8px;/g, '--radius-lg: 2px;');
css = css.replace(/--radius-xl: 12px;/g, '--radius-xl: 2px;');

// Remove transparent glass colors
css = css.replace(/--bg-glass: #141417;/g, '--bg-glass: #050505;');
css = css.replace(/--bg-glass-hover: #1c1c20;/g, '--bg-glass-hover: #0a0a0a;');

// Hard border colors
css = css.replace(/--border-glass: #26262a;/g, '--border-glass: #222222;');
css = css.replace(/--border-glass-hover: #36363a;/g, '--border-glass-hover: #333333;');

// Replace `.glass-card` styling completely
css = css.replace(
  /\.glass-card \{[\s\S]*?box-shadow: var\(--glass-shadow\);\r?\n\s+transition: all var\(--transition-normal\);\r?\n\}/,
  `.glass-card {
  background: var(--bg-glass);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-lg);
  box-shadow: 4px 4px 0px rgba(0,0,0,0.8);
  transition: all var(--transition-normal);
}`
);

fs.writeFileSync('client/src/index.css', css);
console.log('Border radius and glass backgrounds hardened.');
