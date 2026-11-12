import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

/**
 * Global limiter — applies to all /api/* routes.
 * 300 requests per 15 minutes per IP.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
  skip: (req) => req.path === '/health',
});

/**
 * Login limiter — 5 failed attempts per 15 minutes per IP.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
  skipSuccessfulRequests: true,
});

/**
 * Signup limiter — 3 accounts per hour per IP.
 */
export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many accounts created from this IP. Try again in an hour.' },
});

/**
 * Password reset limiter — 3 requests per hour per IP.
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many password reset requests. Try again in an hour.' },
});

/**
 * Payment limiter — 5 STK Push requests per 15 minutes per IP.
 */
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many payment attempts. Try again in 15 minutes.' },
});

/**
 * Authenticated action limiter — per-user throttle.
 * 60 requests per minute (by user ID, or IP as fallback for IPv6).
 */
export const authenticatedLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req.ip || '0.0.0.0'),
  message: { error: 'Too many requests. Slow down.' },
});

/**
 * Bot deploy limiter — 10 deployments per hour per user.
 */
export const deployLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req.ip || '0.0.0.0'),
  message: { error: 'Too many deployments. Try again in an hour.' },
});
