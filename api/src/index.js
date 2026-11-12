import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { globalLimiter } from './lib/rateLimit.js';

import authRoutes from './routes/auth.js';
import tokenRoutes from './routes/tokens.js';
import botRoutes from './routes/bots.js';
import dashboardRoutes from './routes/dashboard.js';
import transactionsRoutes from './routes/transactions.js';
import paymentsRoutes from './routes/payments.js';
import panelsRoutes from './routes/panels.js';
import notificationsRoutes from './routes/notifications.js';
import bundlesRoutes from './routes/bundles.js';

dotenv.config();

const app = express();

// Trust proxy — CRITICAL for rate limiting when behind nginx / Vercel / ngrok
app.set('trust proxy', 1);

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Health check (not rate limited)
app.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

// Apply global rate limit to ALL /api routes
app.use('/api', globalLimiter);

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/bots', botRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/panels', panelsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/bundles', bundlesRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));
