import express from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../lib/db.js';

const router = express.Router();

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized.' });
  try {
    req.user = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Invalid token.' }); }
}

router.get('/overview', requireAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user.id;

    const balanceResult = await client.query(
      'SELECT COALESCE(SUM(amount), 0)::BIGINT AS balance FROM token_ledger WHERE user_id = $1',
      [userId]
    );
    const balance = Number(balanceResult.rows[0]?.balance || 0);

    const usageResult = await client.query('SELECT get_today_usage($1) AS used', [userId]);
    const usedToday = Number(usageResult.rows[0]?.used || 0);

    const botsResult = await client.query(
      `SELECT COUNT(*) FILTER (WHERE status = 'online') AS online,
              COUNT(*) AS total
       FROM bots WHERE user_id = $1`,
      [userId]
    );
    const activeBots = Number(botsResult.rows[0]?.online || 0);
    const totalBots = Number(botsResult.rows[0]?.total || 0);

    const subResult = await client.query(
      `SELECT p.id AS plan_id, p.name, p.daily_tokens, p.bot_limit,
              s.current_period_end AS renews_at
       FROM subscriptions s JOIN plans p ON p.id = s.plan_id
       WHERE s.user_id = $1 AND s.status = 'active'
       LIMIT 1`,
      [userId]
    );

    res.json({
      balance,
      usedToday,
      activeBots,
      totalBots,
      plan: subResult.rows[0] || null,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard.' });
  } finally {
    client.release();
  }
});

export default router;
