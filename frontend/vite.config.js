import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Auto-copy logo asset on dev server startup
const srcLogo = 'C:/Users/jhond/.gemini/antigravity-ide/brain/d6bc4e2b-0b91-4bbd-b030-6a8bc9d8fcb3/.tempmediaStorage/media_d6bc4e2b-0b91-4bbd-b030-6a8bc9d8fcb3_1783433855475.png';
const destDir = path.resolve(__dirname, 'src/assets');
const destLogo = path.resolve(destDir, 'logo.png');

try {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  if (fs.existsSync(srcLogo)) {
    fs.copyFileSync(srcLogo, destLogo);
    console.log('✅ Logo successfully copied to src/assets/logo.png');
  } else {
    console.warn('⚠️ Source logo not found in temp storage.');
  }
} catch (err) {
  console.error('❌ Failed to copy logo:', err.message);
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
