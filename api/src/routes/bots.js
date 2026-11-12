import express from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../lib/db.js';
import { deployLimiter } from '../lib/rateLimit.js';

const router = express.Router();

// ---------- Auth helpers ----------
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized.' });
  try {
    req.user = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Invalid token.' }); }
}

// Engine worker auth — uses a shared secret, not user JWT
function requireEngine(req, res, next) {
  const secret = req.headers['x-engine-secret'];
  if (!secret || secret !== process.env.ENGINE_API_SECRET) {
    return res.status(401).json({ error: 'Engine unauthorized.' });
  }
  next();
}

// ---------- User endpoints ----------

// GET /api/bots — full data including engine fields
router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, phone, status, 
              pairing_code AS "pairingCode",
              pairing_expires_at AS "pairingExpiresAt",
              last_error AS "lastError",
              deployed_at AS "deployedAt",
              last_seen_at AS "lastSeenAt"
       FROM bots WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ bots: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bots.' });
  }
});

// POST /api/bots — deploy (already has token + plan checks)
router.post('/', requireAuth, deployLimiter, async (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required.' });

  const normalizedPhone = phone.startsWith('+') ? phone.replace(/\s/g, '') : `+${phone.replace(/\s/g, '')}`;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('SELECT id FROM users WHERE id = $1 FOR UPDATE', [req.user.id]);

    // Get plan
    const planResult = await client.query(
      `SELECT p.bot_limit, p.name AS plan_name
       FROM subscriptions s JOIN plans p ON p.id = s.plan_id
       WHERE s.user_id = $1 AND s.status = 'active' LIMIT 1`,
      [req.user.id]
    );
    if (planResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'No active plan found.' });
    }
    const { bot_limit, plan_name } = planResult.rows[0];

    // Count bots
    const botCountResult = await client.query(
      `SELECT COUNT(*) AS count FROM bots WHERE user_id = $1 AND status != 'suspended'`,
      [req.user.id]
    );
    const currentBotCount = parseInt(botCountResult.rows[0].count);
    if (currentBotCount >= bot_limit) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        error: `Your ${plan_name} plan allows a maximum of ${bot_limit} bot${bot_limit > 1 ? 's' : ''}. Please upgrade to deploy more.`,
        code: 'PLAN_LIMIT_REACHED',
      });
    }

    // Balance
    const balResult = await client.query(
      `SELECT COALESCE(SUM(amount), 0)::BIGINT AS balance FROM token_ledger WHERE user_id = $1`,
      [req.user.id]
    );
    if (Number(balResult.rows[0]?.balance || 0) < 100) {
      await client.query('ROLLBACK');
      return res.status(402).json({ error: 'Insufficient tokens. Need at least 100 to deploy.' });
    }

    // Existing phone?
    const existing = await client.query(
      `SELECT id, user_id FROM bots WHERE phone = $1 AND status != 'suspended'`,
      [normalizedPhone]
    );

    if (existing.rows.length > 0) {
      const owner = existing.rows[0];
      if (owner.user_id === req.user.id) {
        // Redeploy
        const botResult = await client.query(
          `UPDATE bots SET name = $1, status = 'deploying', 
                  pairing_code = NULL, pairing_expires_at = NULL,
                  engine_worker_id = NULL, engine_claimed_at = NULL,
                  last_error = NULL, updated_at = NOW()
           WHERE id = $2
           RETURNING id, name, phone, status, deployed_at AS "deployedAt"`,
          [name, owner.id]
        );
        await client.query(
          `INSERT INTO token_ledger (user_id, amount, kind, bot_id, metadata)
           VALUES ($1, -100, 'bot_deploy_fee', $2, $3)`,
          [req.user.id, owner.id, JSON.stringify({ name, redeploy: true })]
        );
        await client.query('COMMIT');
        try { await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY user_token_balances'); } catch {}
        return res.status(200).json({ bot: botResult.rows[0], redeployed: true });
      }
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'This phone is already paired to another bot.' });
    }

    // New bot
    const botResult = await client.query(
      `INSERT INTO bots (user_id, name, phone, status)
       VALUES ($1, $2, $3, 'deploying')
       RETURNING id, name, phone, status, deployed_at AS "deployedAt"`,
      [req.user.id, name, normalizedPhone]
    );
    const bot = botResult.rows[0];

    await client.query(
      `INSERT INTO token_ledger (user_id, amount, kind, bot_id, metadata)
       VALUES ($1, -100, 'bot_deploy_fee', $2, $3)`,
      [req.user.id, bot.id, JSON.stringify({ name })]
    );

    await client.query('COMMIT');
    try { await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY user_token_balances'); } catch {}

    res.status(201).json({ bot });
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    console.error('Deploy error:', err);
    if (err.code === '23505') return res.status(409).json({ error: 'This phone is already paired to another bot.' });
    res.status(500).json({ error: 'Failed to deploy bot.' });
  } finally {
    client.release();
  }
});

// PATCH /api/bots/:id/status — pause/play from frontend
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

// DELETE /api/bots/:id — cleanup engine state too
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM bots WHERE id = $1 AND user_id = $2 RETURNING id`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bot not found.' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete bot.' });
  }
});

// ---------- Engine endpoints (protected by shared secret) ----------

// GET /api/bots/engine/pending — engine lists bots to process
router.get('/engine/pending', requireEngine, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, name, phone, session_data, status
       FROM bots
       WHERE status = 'deploying'
         AND engine_worker_id IS NULL
       ORDER BY created_at ASC
       LIMIT 5`
    );
    res.json({ bots: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list pending bots.' });
  }
});

// POST /api/bots/engine/:id/claim — atomic claim by a worker
router.post('/engine/:id/claim', requireEngine, async (req, res) => {
  const { workerId } = req.body;
  if (!workerId) return res.status(400).json({ error: 'workerId required.' });

  try {
    const result = await pool.query(
      `UPDATE bots
       SET engine_worker_id = $1, engine_claimed_at = NOW()
       WHERE id = $2
         AND status = 'deploying'
         AND engine_worker_id IS NULL
       RETURNING id, phone, session_data, name`,
      [workerId, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(409).json({ error: 'Bot already claimed or not in deploying state.' });
    }
    res.json({ bot: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Claim failed.' });
  }
});

// POST /api/bots/engine/:id/pairing-code — engine writes the code
router.post('/engine/:id/pairing-code', requireEngine, async (req, res) => {
  const { code, ttlSeconds = 60 } = req.body;
  if (!code) return res.status(400).json({ error: 'code required.' });

  try {
    await pool.query(
      `UPDATE bots
       SET pairing_code = $1,
           pairing_expires_at = NOW() + ($2 || ' seconds')::interval,
           status = 'offline',
           last_error = NULL
       WHERE id = $3`,
      [code, String(ttlSeconds), req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save pairing code.' });
  }
});

// POST /api/bots/engine/:id/status — engine updates status (online/offline/error)
router.post('/engine/:id/status', requireEngine, async (req, res) => {
  const { status, sessionData, lastError } = req.body;
  if (!['online', 'offline', 'suspended'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  try {
    const updateFields = ['status = $1', 'updated_at = NOW()'];
    const values = [status];
    let i = 2;

    if (status === 'online') {
      updateFields.push('pairing_code = NULL', 'pairing_expires_at = NULL', 'last_seen_at = NOW()');
    }
    if (sessionData !== undefined) {
      updateFields.push(`session_data = $${i++}`);
      values.push(sessionData);
    }
    if (lastError !== undefined) {
      updateFields.push(`last_error = $${i++}`);
      values.push(lastError);
    }
    values.push(req.params.id);

    const query = `UPDATE bots SET ${updateFields.join(', ')} WHERE id = $${i}`;
    await pool.query(query, values);

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update bot status.' });
  }
});

// POST /api/bots/:id/clear-pairing — frontend clears code after user enters it
router.post('/:id/clear-pairing', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE bots SET pairing_code = NULL, pairing_expires_at = NULL
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bot not found.' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to clear pairing code.' });
  }
});

export default router;
