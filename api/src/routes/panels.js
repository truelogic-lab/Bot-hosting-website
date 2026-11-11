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

// GET /api/panels — list user's hosting panels
router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, panel_type AS "panelType", status, ip, url,
              username, ram_mb AS "ramMb", cpu_percent AS "cpuPercent",
              disk_mb AS "diskMb", created_at AS "createdAt",
              bot_id AS "botId"
       FROM hosting_panels
       WHERE user_id = $1 AND status != 'deleted'
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ panels: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch panels.' });
  }
});

// GET /api/panels/:id/reveal — returns the decrypted password ON DEMAND
// (Only when the user explicitly clicks the eye icon)
router.get('/:id/reveal', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT password_enc FROM hosting_panels
       WHERE id = $1 AND user_id = $2 AND status = 'active'`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Panel not found.' });

    // In production, decrypt here with your app secret (AES-256-GCM).
    // For now, return the stored value directly (dev mode).
    res.json({ password: result.rows[0].password_enc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reveal password.' });
  }
});

export default router;
