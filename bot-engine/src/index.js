import 'dotenv/config';
import axios from 'axios';
import pino from 'pino';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logger = pino({ level: 'info' });

const API_URL = process.env.API_URL || 'http://localhost:5000';
const ENGINE_SECRET = process.env.ENGINE_API_SECRET;
const POLL_MS = 3000;
const WARREN_XMD_PATH = process.env.WARREN_XMD_PATH || '/data/data/com.termux/files/home/Warren-XMD';

const activeProcesses = new Map();

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

async function launchBot(bot) {
  logger.info({ botId: bot.id }, '🚀 Spawning Warren-XMD instance...');
  const sessionDir = path.join(WARREN_XMD_PATH, `data/sessions/${bot.id}`);
  const phone = bot.phone.replace(/\D/g, '');

  const child = spawn('node', ['src/index.js'], {
    cwd: WARREN_XMD_PATH,
    env: {
      ...process.env,
      BOT_ID: bot.id,
      BOT_PHONE: phone,
      SESSION_DIR: sessionDir,
      PORT: '0',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const logFile = fs.createWriteStream(path.join(logsDir, `${bot.id}.log`), { flags: 'a' });
  child.stdout.pipe(logFile);
  child.stderr.pipe(logFile);

  child.stdout.on('data', (data) => logger.info({ botId: bot.id }, data.toString().trim()));
  child.stderr.on('data', (data) => logger.error({ botId: bot.id }, data.toString().trim()));

  child.on('exit', async (code) => {
    logger.warn({ botId: bot.id, code }, 'Warren-XMD instance exited');
    activeProcesses.delete(bot.id);
    try {
      await axios.post(`${API_URL}/api/bots/engine/${bot.id}/status`,
        { status: 'offline', lastError: `Process exited with code ${code}` },
        { headers: { 'x-engine-secret': ENGINE_SECRET } }
      );
    } catch (err) {}
  });

  activeProcesses.set(bot.id, child);
}

async function loop() {
  try {
    const { data } = await axios.get(`${API_URL}/api/bots/engine/pending`, {
      headers: { 'x-engine-secret': ENGINE_SECRET },
    });
    const bots = data.bots || [];

    for (const bot of bots) {
      if (activeProcesses.has(bot.id)) continue;
      try {
        await axios.post(`${API_URL}/api/bots/engine/${bot.id}/claim`,
          { workerId: `worker-${process.pid}` },
          { headers: { 'x-engine-secret': ENGINE_SECRET } }
        );
        await launchBot(bot);
      } catch (err) {
        if (err.response?.status !== 409) {
          logger.error({ botId: bot.id, err: err.message }, 'Claim failed');
        }
      }
    }
  } catch (err) {
    logger.error({ err: err.message }, 'Polling error');
  }
  setTimeout(loop, POLL_MS);
}

process.on('SIGINT', () => {
  logger.info('👋 Shutting down engine...');
  for (const child of activeProcesses.values()) child.kill('SIGTERM');
  process.exit(0);
});

logger.info('🤖 Bot Engine Supervisor started.');
logger.info(`📡 API: ${API_URL}`);
logger.info(`📁 Warren-XMD: ${WARREN_XMD_PATH}`);
logger.info(`🔑 Engine Secret: ${ENGINE_SECRET ? 'SET ✅' : 'MISSING ❌'}`);

loop();
