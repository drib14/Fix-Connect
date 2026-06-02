import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LogLevel = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  SECURITY: 'SECURITY',
};

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.logFile = path.join(this.logDir, 'combined.log');
    this.ensureLogDir();
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  writeLog(level, message, meta) {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` | Meta: ${JSON.stringify(meta)}` : '';
    const logLine = `[${timestamp}] [${level}] ${message}${metaString}\n`;

    // Console output with colors
    let color = '\x1b[0m'; // Reset
    switch (level) {
      case LogLevel.INFO:
        color = '\x1b[36m'; // Cyan
        break;
      case LogLevel.WARN:
        color = '\x1b[33m'; // Yellow
        break;
      case LogLevel.ERROR:
        color = '\x1b[31m'; // Red
        break;
      case LogLevel.SECURITY:
        color = '\x1b[35m'; // Magenta
        break;
    }

    console.log(`${color}[${timestamp}] [${level}] ${message}\x1b[0m`, meta ? meta : '');

    try {
      fs.appendFileSync(this.logFile, logLine, 'utf8');
    } catch (err) {
      console.error('Failed to write log to file:', err);
    }
  }

  info(message, meta) {
    this.writeLog(LogLevel.INFO, message, meta);
  }

  warn(message, meta) {
    this.writeLog(LogLevel.WARN, message, meta);
  }

  error(message, error, meta) {
    const errorMeta = error instanceof Error 
      ? { ...meta, name: error.name, message: error.message, stack: error.stack }
      : { ...meta, rawError: error };
    this.writeLog(LogLevel.ERROR, message, errorMeta);
  }

  security(message, meta) {
    this.writeLog(LogLevel.SECURITY, message, meta);
  }
}

export const logger = new Logger();
