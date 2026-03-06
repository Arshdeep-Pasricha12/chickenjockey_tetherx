const fs = require('fs');

const files = [
  'client/src/pages/SafetyScore.jsx',
  'client/src/pages/Emergency.jsx',
  'client/src/pages/AuthPage.jsx',
  'client/src/pages/Community.jsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf-8');
  
  // Replace generic labels
  content = content.replace(
    /<label>(.*?)<\/label>/g,
    '<label style={{ textTransform: \'uppercase\', letterSpacing: \'1px\', fontSize: \'0.75rem\', color: \'var(--accent-blue)\' }}>$1</label>'
  );

  // Replace form-inputs if they don't already have the mono styling
  if (!content.includes('var(--font-mono)')) {
    content = content.replace(
      /className="form-input"([\s\S]*?)>/g,
      'className="form-input" style={{ fontFamily: \'var(--font-mono)\', fontSize: \'1.1rem\', background: \'#000\', borderColor: \'#222\' }} $1>'
    );
  }

  // Update SafetyScore circle to look like neon tech
  if (file.includes('SafetyScore.jsx')) {
    content = content.replace(
      /className="score-value" style=\{\{ color: result\.gradeColor \}\}/,
      'className="score-value" style={{ color: result.gradeColor, fontFamily: \'var(--font-mono)\', textShadow: `0 0 15px currentColor` }}'
    );
  }

  // Update Emergency Buttons
  if (file.includes('Emergency.jsx')) {
    content = content.replace(
      /border: selectedType === type.id \? '1px solid var\(--accent-red\)' : '1px solid var\(--border-glass\)',/g,
      "border: selectedType === type.id ? '1px solid var(--accent-red)' : '1px solid #222',"
    );
    content = content.replace(
      /background: selectedType === type.id \? 'rgba\(239, 68, 68, 0\.1\)' : 'var\(--bg-glass\)',/g,
      "background: selectedType === type.id ? 'rgba(239, 68, 68, 0.1)' : '#000',"
    );
  }

  fs.writeFileSync(file, content);
});

console.log('Forms updated successfully.');
