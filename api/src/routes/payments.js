import express from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { pool } from '../lib/db.js';
import { paymentLimiter } from '../lib/rateLimit.js';

const router = express.Router();

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized.' });
  try {
    req.user = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Invalid token.' }); }
}

const TOKENS_PER_KSH = 100;

// Verify required env vars are present before allowing payments
function validateEnv() {
  const required = ['MPESA_CONSUMER_KEY', 'MPESA_CONSUMER_SECRET', 'MPESA_SHORTCODE', 'MPESA_PASSKEY', 'MPESA_CALLBACK_URL'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(`Missing M-Pesa config: ${missing.join(', ')}`);
  }
}

async function getMpesaToken() {
  validateEnv();
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  const url = process.env.MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
  const { data } = await axios.get(url, { headers: { Authorization: `Basic ${auth}` } });
  return data.access_token;
}

// POST /api/payments/stkpush
router.post('/stkpush', requireAuth, paymentLimiter, async (req, res) => {
  const { phone, amountKes } = req.body;

  if (!phone || !amountKes) {
    return res.status(400).json({ error: 'Phone and amount are required.' });
  }

  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length < 9 || cleanPhone.length > 12) {
    return res.status(400).json({ error: 'Invalid phone number.' });
  }

  const amount = parseInt(amountKes);
  if (!amount || amount < 10) {
    return res.status(400).json({ error: 'Minimum is KSh 10.' });
  }

  const tokensToCredit = amount * TOKENS_PER_KSH;

  try {
    const token = await getMpesaToken();
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, 14);

    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
    const callbackUrl = process.env.MPESA_CALLBACK_URL;

    const url = process.env.MPESA_ENV === 'production'
      ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

    const { data } = await axios.post(url, {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: cleanPhone,
      PartyB: shortcode,
      PhoneNumber: cleanPhone,
      CallBackURL: callbackUrl,
      AccountReference: `WARREN-${req.user.id.slice(0, 8)}`,
      TransactionDesc: `Top up ${tokensToCredit} tokens`,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Save pending payment — tokens credited only after callback
    await pool.query(
      `INSERT INTO payments (user_id, amount_kes, tokens_to_credit, provider, status, checkout_request_id, phone)
       VALUES ($1, $2, $3, 'mpesa', 'pending', $4, $5)`,
      [req.user.id, amount, tokensToCredit, data.CheckoutRequestID, cleanPhone]
    );

    res.json({
      message: 'STK Push sent. Enter your M-Pesa PIN on your phone.',
      checkoutRequestId: data.CheckoutRequestID,
      tokensToCredit,
    });
  } catch (err) {
    const msg = err.response?.data?.errorMessage || err.message;
    console.error('M-Pesa STK error:', msg);
    res.status(500).json({ error: msg });
  }
});

// POST /api/payments/mpesa/callback
// Safaricom calls this when the user enters their PIN
router.post('/mpesa/callback', async (req, res) => {
  const body = req.body?.Body?.stkCallback;
  if (!body) return res.json({ ok: true });

  const { CheckoutRequestID, ResultCode, CallbackMetadata } = body;
  console.log('📞 M-Pesa callback:', CheckoutRequestID, '→ ResultCode', ResultCode);

  try {
    const paymentResult = await pool.query(
      'SELECT * FROM payments WHERE checkout_request_id = $1',
      [CheckoutRequestID]
    );
    if (paymentResult.rows.length === 0) return res.json({ ok: true });

    const payment = paymentResult.rows[0];
    if (payment.status !== 'pending') return res.json({ ok: true }); // idempotency

    if (ResultCode === 0) {
      const receipt = CallbackMetadata?.Item?.find(i => i.Name === 'MpesaReceiptNumber')?.Value;

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        await client.query(
          `UPDATE payments SET status = 'completed', mpesa_receipt = $1,
           raw_payload = $2, completed_at = NOW()
           WHERE id = $3`,
          [receipt, JSON.stringify(body), payment.id]
        );

        await client.query(
          `INSERT INTO token_ledger (user_id, amount, kind, ref_id, metadata)
           VALUES ($1, $2, 'topup', $3, $4)`,
          [payment.user_id, payment.tokens_to_credit, receipt, JSON.stringify({ paymentId: payment.id })]
        );

        await client.query('COMMIT');
        await client.query('REFRESH MATERIALIZED VIEW CONCURRENTLY user_token_balances');
        console.log(`✅ Payment ${receipt}: ${payment.tokens_to_credit} tokens credited to user ${payment.user_id}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('Callback DB error:', err);
      } finally {
        client.release();
      }
    } else {
      await pool.query(
        `UPDATE payments SET status = 'failed', raw_payload = $1 WHERE id = $2`,
        [JSON.stringify(body), payment.id]
      );
      console.log(`❌ Payment failed: ${CheckoutRequestID} → ResultCode ${ResultCode}`);
    }
  } catch (err) {
    console.error('Callback error:', err);
  }

  res.json({ ok: true });
});

export default router;
