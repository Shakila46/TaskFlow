const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('e:/Certificates/Intern/frontend/src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    const regex = /['"`]http:\/\/localhost:5000\/api([^'"`]*)['"`]/g;
    
    if (regex.test(content)) {
      console.log('Fixing:', filePath);
      // Replace with backticks and interpolation
      content = content.replace(regex, '`${process.env.NEXT_PUBLIC_API_URL}$1`');
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
});

console.log('Done replacing URLs');
