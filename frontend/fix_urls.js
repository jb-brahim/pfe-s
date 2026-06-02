const fs = require('fs');
const path = require('path');

// Run this script from the frontend directory: node fix_urls.js

const dirToSearch = path.join(__dirname, 'app');
const libApiFile = path.join(__dirname, 'lib', 'api.ts');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let hasChanges = false;

  // We have things like: axios.get('http://localhost:5000/api/...')
  // We can replace `http://localhost:5000/api` with an imported `API_BASE_URL` if we want,
  // but an easier global fix is just replacing `http://localhost:5000` with an environment variable or our config.
  // Actually, let's replace `http://localhost:5000` directly with the render URL or process env
  
  const LOCALHOST_REGEX = /http:\/\/localhost:5000/g;

  if (LOCALHOST_REGEX.test(content)) {
    // If it's a TS/TSX file, we can replace it with the dynamic URL logic
    content = content.replace(LOCALHOST_REGEX, "https://pfe-s.onrender.com");
    hasChanges = true;
  }

  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated: ${filePath}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  });
}

// Process 'app' and 'components' directories
processDirectory(path.join(__dirname, 'app'));
processDirectory(path.join(__dirname, 'components'));
console.log('Finished updating URLs!');
