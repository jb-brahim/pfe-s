const fs = require('fs');
const path = require('path');

const dirToSearch = path.join(__dirname, 'app');

function replaceInFile(filePath) {
  if (filePath.includes('api.ts')) return; // Skip api.ts, it's already perfectly handled

  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  // Replace single quotes
  content = content.replace(/'https:\/\/pfe-s\.onrender\.com([^']*)'/g, "`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}$1`");
  
  // Replace double quotes
  content = content.replace(/"https:\/\/pfe-s\.onrender\.com([^"]*)"/g, "`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}$1`");

  // Replace backticks (template literals)
  content = content.replace(/`https:\/\/pfe-s\.onrender\.com([^`]*)`/g, "`${process.env.NODE_ENV === 'production' ? 'https://pfe-s.onrender.com' : 'http://localhost:5000'}$1`");

  // Also catch raw URLs without quotes if they exist (though unlikely in valid TS)
  // But the above 3 cover string assignments and axios calls.

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Made dynamic: ${filePath}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
      replaceInFile(fullPath);
    }
  });
}

processDirectory(path.join(__dirname, 'app'));
processDirectory(path.join(__dirname, 'components'));
console.log('Finished applying dynamic environment URLs!');
