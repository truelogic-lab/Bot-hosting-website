import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../lib/db.js';

const router = express.Router();

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, full_name)
         VALUES ($1, $2, $3)
         RETURNING id, email, full_name, role, created_at`,
        [normalizedEmail, passwordHash, name]
      );
      const user = userResult.rows[0];

      await client.query(
        `INSERT INTO token_ledger (user_id, amount, kind, metadata)
         VALUES ($1, $2, 'signup_bonus', $3)`,
        [user.id, 1000, JSON.stringify({ reason: 'Welcome bonus' })]
      );

      await client.query('COMMIT');

      // Non-critical: welcome notification (wrapped so a missing table doesn't break signup)
      try {
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, body, link)
           VALUES ($1, 'success', 'Welcome to Warren-XMD!', 'Your account has been created. You have 1,000 starter tokens to test deployments.', '/dashboard/deploy')`,
          [user.id]
        );
      } catch (notifErr) {
        console.warn('⚠️ Could not create welcome notification:', notifErr.message);
      }

      // Refresh balances view
      try {
        await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY user_token_balances');
      } catch (e) {
        // Non-critical
      }

      const token = signToken(user);

      res.status(201).json({
        token,
        user: {
          id: user.id,
          name: user.full_name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
      'SELECT id, email, password_hash, full_name, role, is_active FROM users WHERE LOWER(email) = $1',
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing token.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      'SELECT id, email, full_name, role, created_at FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = result.rows[0];
    res.json({ user: { id: user.id, name: user.full_name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
});

export default router;
