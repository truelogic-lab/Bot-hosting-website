import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import tokenRoutes from './routes/tokens.js';
import botRoutes from './routes/bots.js';
import dashboardRoutes from './routes/dashboard.js';
import transactionsRoutes from './routes/transactions.js';
import paymentsRoutes from './routes/payments.js';
import bundlesRoutes from './routes/bundles.js';
import panelsRoutes from './routes/panels.js';
import notificationsRoutes from './routes/notifications.js';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }));
app.use('/api/auth', authRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/bots', botRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/bundles', bundlesRoutes);
app.use('/api/panels', panelsRoutes);
app.use('/api/notifications', notificationsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));
