const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\jhond\\.gemini\\antigravity-ide\\brain\\97ec6da3-585e-4815-8724-5351849cee6f\\media__1783429210885.png';
const destDir = path.resolve(__dirname, 'frontend/assets');
const dest = path.resolve(destDir, 'logo.png');

try {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  console.log('✅ Logo successfully copied to frontend/assets/logo.png');
} catch (err) {
  console.error('❌ Failed to copy logo:', err.message);
}
