const fs = require('fs');
const path = 'client/src/index.css';
let css = fs.readFileSync(path, 'utf-8');

const scrollbarCSS = `
/* ─── Custom Scrollbar ─────────────────────── */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #050505;
}
::-webkit-scrollbar-thumb {
  background: #222;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #333;
}
html {
  scrollbar-width: thin;
  scrollbar-color: #222 #050505;
}

/* ─── Scrollytelling Polish ────────────────── */
.canvas-vignette {
  background: radial-gradient(circle at center, transparent 40%, #050505 95%);
}
.canvas-shadow-overlay {
  box-shadow: inset 0 0 100px 50px #050505;
}
`;

if (!css.includes('Scrollytelling Polish')) {
    css += scrollbarCSS;
    fs.writeFileSync(path, css);
    console.log('CSS Polish appended successfully');
} else {
    console.log('CSS Polish already exists');
}
