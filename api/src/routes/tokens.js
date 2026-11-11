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

router.get('/balance', requireAuth, async (req, res) => {
  try {
    // Always read fresh from ledger (not the possibly-stale materialized view)
    const result = await pool.query(
      `SELECT COALESCE(SUM(amount), 0)::BIGINT AS balance
       FROM token_ledger WHERE user_id = $1`,
      [req.user.id]
    );
    res.json({ balance: Number(result.rows[0]?.balance || 0) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch balance.' });
  }
});

router.get('/usage/today', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT get_today_usage($1) AS used', [req.user.id]);
    res.json({ used: Number(result.rows[0]?.used || 0) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch usage.' });
  }
});

router.get('/summary', requireAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user.id;

    // 1. Balance — computed from ledger (always accurate)
    const balanceRes = await client.query(
      'SELECT COALESCE(SUM(amount), 0)::BIGINT AS balance FROM token_ledger WHERE user_id = $1',
      [userId]
    );
    const balance = Number(balanceRes.rows[0]?.balance || 0);

    // 2. Used today
    const usedTodayRes = await client.query('SELECT get_today_usage($1) AS used', [userId]);
    const usedToday = Number(usedTodayRes.rows[0]?.used || 0);

    // 3. Lifetime totals
    const lifetimeRes = await client.query(
      `SELECT
         COALESCE(SUM(amount) FILTER (WHERE amount > 0), 0) AS bought,
         COALESCE(ABS(SUM(amount) FILTER (WHERE amount < 0)), 0) AS used
       FROM token_ledger WHERE user_id = $1`,
      [userId]
    );
    const lifetimeBought = Number(lifetimeRes.rows[0].bought);
    const lifetimeUsed = Number(lifetimeRes.rows[0].used);

    // 4. Plan info
    const planRes = await client.query(
      `SELECT p.id, p.name, p.daily_tokens AS "dailyTokens",
              p.bot_limit AS "botLimit", s.current_period_end AS "renewsAt",
              s.status
       FROM subscriptions s JOIN plans p ON p.id = s.plan_id
       WHERE s.user_id = $1 AND s.status = 'active'
       LIMIT 1`,
      [userId]
    );
    const plan = planRes.rows[0] || null;

    // 5. Recent activity
    const recentRes = await client.query(
      `SELECT tl.id, tl.amount, tl.kind, tl.metadata, tl.created_at AS "createdAt",
              b.name AS "botName"
       FROM token_ledger tl
       LEFT JOIN bots b ON b.id = tl.bot_id
       WHERE tl.user_id = $1
       ORDER BY tl.created_at DESC
       LIMIT 10`,
      [userId]
    );

    res.json({
      balance,
      usedToday,
      lifetimeBought,
      lifetimeUsed,
      plan,
      recent: recentRes.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load summary.' });
  } finally {
    client.release();
  }
});

export default router;
