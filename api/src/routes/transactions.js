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

// GET /api/transactions — full ledger history (paged)
router.get('/', requireAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;
    const filter = req.query.kind; // optional: 'topup', 'bot_deploy_fee', 'message_usage', etc.

    let query = `
      SELECT
        id,
        amount,
        kind,
        ref_id AS "refId",
        metadata,
        created_at AS "createdAt"
      FROM token_ledger
      WHERE user_id = $1
    `;
    const params = [req.user.id];

    if (filter) {
      params.push(filter);
      query += ` AND kind = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await client.query(query, params);

    // Total count (for pagination)
    const countQuery = filter
      ? 'SELECT COUNT(*) FROM token_ledger WHERE user_id = $1 AND kind = $2'
      : 'SELECT COUNT(*) FROM token_ledger WHERE user_id = $1';
    const countParams = filter ? [req.user.id, filter] : [req.user.id];
    const countResult = await client.query(countQuery, countParams);

    res.json({
      transactions: result.rows,
      total: Number(countResult.rows[0].count),
      limit,
      offset,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transactions.' });
  } finally {
    client.release();
  }
});

export default router;
