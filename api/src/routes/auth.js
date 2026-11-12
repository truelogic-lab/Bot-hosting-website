import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../lib/db.js';
import { loginLimiter, signupLimiter, passwordResetLimiter } from '../lib/rateLimit.js';

const router = express.Router();

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// POST /api/auth/register
router.post('/register', signupLimiter, async (req, res) => {
  try {
    const { name, email, password, planId = 'starter' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Validate plan exists
    const planCheck = await pool.query('SELECT id, name, price_kes, daily_tokens, bot_limit FROM plans WHERE id = $1', [planId]);
    if (planCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid plan selected.' });
    }
    const plan = planCheck.rows[0];

    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Create user
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, full_name)
         VALUES ($1, $2, $3)
         RETURNING id, email, full_name, role, created_at`,
        [normalizedEmail, passwordHash, name]
      );
      const user = userResult.rows[0];

      // 2. Create subscription for the chosen plan
      await client.query(
        `INSERT INTO subscriptions (user_id, plan_id, status, current_period_end)
         VALUES ($1, $2, 'active', NOW() + INTERVAL '30 days')`,
        [user.id, planId]
      );

      // 3. Grant 1,000 signup bonus tokens
      await client.query(
        `INSERT INTO token_ledger (user_id, amount, kind, metadata)
         VALUES ($1, $2, 'signup_bonus', $3)`,
        [user.id, 1000, JSON.stringify({ reason: 'Welcome bonus' })]
      );

      await client.query('COMMIT');

      // Non-critical: welcome notification
      try {
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, body, link)
           VALUES ($1, 'success', 'Welcome to Warren-XMD!', 'Your account is ready. You have 1,000 starter tokens and a free trial on the ' || $2 || ' plan.', '/dashboard/deploy')`,
          [user.id, plan.name]
        );
      } catch (notifErr) {
        console.warn('⚠️ Could not create welcome notification:', notifErr.message);
      }

      // Refresh balances view
      try {
        await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY user_token_balances');
      } catch {}

      const token = signToken(user);

      res.status(201).json({
        token,
        user: {
          id: user.id,
          name: user.full_name,
          email: user.email,
          role: user.role,
        },
        plan: { id: plan.id, name: plan.name },
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

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
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

// GET /api/auth/me
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
