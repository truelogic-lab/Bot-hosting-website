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
      `SELECT id, type, title, body, link, is_read AS "isRead", created_at AS "createdAt"
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    );
    const unread = result.rows.filter(n => !n.isRead).length;
    res.json({ notifications: result.rows, unread });
  } catch (err) {
    // Table might not exist yet — return empty list instead of 500
    if (err.code === '42P01') {
      return res.json({ notifications: [], unread: 0 });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    await pool.query(
      `UPDATE notifications SET is_read = TRUE
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark as read.' });
  }
});

router.patch('/mark-all-read', requireAuth, async (req, res) => {
  try {
    await pool.query(
      `UPDATE notifications SET is_read = TRUE
       WHERE user_id = $1 AND is_read = FALSE`,
      [req.user.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark all as read.' });
  }
});

export default router;
