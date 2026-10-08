const express = require('express');

const { resolveIdentity } = require('../middleware/identity');
const { callMainApi } = require('../utils/mainApiClient');

const router = express.Router();

// The public Razorpay key id the frontend checkout widget needs — not a
// secret, just the account identifier. Must match apps/server's own
// RAZORPAY_KEY_ID (same Razorpay account), since apps/server is the one
// raising the order below.
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;

// POST /api/payment/create-order  (no login required — works for guests too)
// Raises a real Razorpay order via apps/server (purchases.service.ts).
// Replaces the old static-UPI-QR "I've Paid" trust-based confirm — payment is
// now verified server-to-server by Razorpay's webhook before access unlocks.
// body: { materialId, name, email, phone, reason }
router.post('/create-order', resolveIdentity, async (req, res) => {
  try {
    const { materialId, name, email, phone, reason } = req.body;
    if (!materialId || !name || !email || !phone || !reason)
      return res.status(400).json({ message: 'Name, email, phone and reason are required' });

    const { ok, status, data } = await callMainApi('/purchases', {
      method: 'POST',
      identity: req.identity,
      body: { materialId, name, email, phone, reason },
    });
    if (!ok) return res.status(status).json(data || { message: 'Server error' });

    res.json({ ...data, keyId: RAZORPAY_KEY_ID });
  } catch (err) {
    console.error('Create order error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/payment/my-purchases  — the current visitor's own purchase history
router.get('/my-purchases', resolveIdentity, async (req, res) => {
  try {
    const { ok, status, data } = await callMainApi('/purchases/me', { identity: req.identity });
    if (!ok) return res.status(status).json(data || { message: 'Server error' });

    const purchases = (data.purchases || []).map(({ id, ...rest }) => ({ _id: id, ...rest }));
    res.json({ purchases });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin purchase list/stats (authMiddleware + requireAdmin) are NOT proxied
// yet — same gap as materials.js's upload/delete: apps/server's admin routes
// require a real better-auth ADMIN session and this app's own JWT admin login
// has no bridge for that. Returning 501 rather than silently showing stale
// zeros from this app's own now-orphaned local database.
router.get('/purchases', (req, res) => {
  res.status(501).json({ message: 'Admin purchase list is temporarily unavailable — contact an engineer.' });
});

router.get('/stats', (req, res) => {
  res.status(501).json({ message: 'Admin payment stats are temporarily unavailable — contact an engineer.' });
});

module.exports = router;
