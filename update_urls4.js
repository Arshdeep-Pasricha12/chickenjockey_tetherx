const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'client', 'src');

function walk(directory) {
  let results = [];
  const list = fs.readdirSync(directory);
  list.forEach(file => {
    file = path.join(directory, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}

const files = walk(dir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const target1 = 'const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;';
  const target2 = 'const API = `${import.meta.env.VITE_API_URL}/api`;';
  const target3 = 'const API = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "http://localhost:5000/api";';
  
  const replacement = "const API = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';";

  if (content.includes(target1)) {
    content = content.replace(target1, replacement);
    fs.writeFileSync(file, content);
    console.log(`Updated: ${file}`);
  } else if (content.includes(target2)) {
    content = content.replace(target2, replacement);
    fs.writeFileSync(file, content);
    console.log(`Updated: ${file}`);
  } else if (content.includes(target3)) {
    content = content.replace(target3, replacement);
    fs.writeFileSync(file, content);
    console.log(`Updated: ${file}`);
  }
});
console.log('API URLs updated to use relative paths for Vercel production!');
