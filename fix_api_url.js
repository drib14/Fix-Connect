const fs = require('fs');

const filesToFix = ['frontend/src/App.jsx', 'frontend/src/pages/Auth.jsx'];

filesToFix.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/http:\/\/localhost:5050\/api/g, 'http://localhost:5000/api');
  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
