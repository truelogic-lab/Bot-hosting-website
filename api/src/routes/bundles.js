import express from 'express';
import { pool } from '../lib/db.js';

const router = express.Router();

// GET /api/bundles — public endpoint (no auth needed, it's just pricing info)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, tokens, price_kes AS "priceKes", label
       FROM token_bundles
       WHERE is_active = TRUE
       ORDER BY price_kes ASC`
    );
    res.json({ bundles: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bundles.' });
  }
});

export default router;
