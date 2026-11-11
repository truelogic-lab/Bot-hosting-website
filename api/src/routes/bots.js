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

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, phone, status, deployed_at AS "deployedAt", last_seen_at AS "lastSeenAt"
       FROM bots WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ bots: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bots.' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check balance
    const balResult = await client.query(
      'SELECT COALESCE(balance, 0) AS balance FROM user_token_balances WHERE user_id = $1',
      [req.user.id]
    );
    const balance = Number(balResult.rows[0]?.balance || 0);
    if (balance < 100) {
      await client.query('ROLLBACK');
      return res.status(402).json({ error: 'Insufficient tokens. Need at least 100 to deploy.' });
    }

    // Insert bot
    const botResult = await client.query(
      `INSERT INTO bots (user_id, name, phone, status)
       VALUES ($1, $2, $3, 'deploying')
       RETURNING id, name, phone, status, deployed_at AS "deployedAt"`,
      [req.user.id, name, phone]
    );
    const bot = botResult.rows[0];

    // Deduct tokens
    await client.query(
      `INSERT INTO token_ledger (user_id, amount, kind, bot_id, metadata)
       VALUES ($1, -100, 'bot_deploy_fee', $2, $3)`,
      [req.user.id, bot.id, JSON.stringify({ name })]
    );

    await client.query('COMMIT');

    // Refresh view sequentially (not in a transaction, but on same client)
    await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY user_token_balances');

    res.status(201).json({ bot });
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    console.error(err);
    res.status(500).json({ error: 'Failed to deploy bot.' });
  } finally {
    client.release();
  }
});

router.patch('/:id/status', requireAuth, async (req, res) => {
  const { status } = req.body;
  if (!['online', 'offline'].includes(status)) {
    return res.status(400).json({ error: 'Status must be online or offline.' });
  }
  try {
    const result = await pool.query(
      `UPDATE bots SET status = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING id, name, status`,
      [status, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bot not found.' });
    res.json({ bot: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update bot.' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM bots WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bot not found.' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete bot.' });
  }
});

export default router;
