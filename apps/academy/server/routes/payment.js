const express = require('express');

const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');
const { resolveIdentity } = require('../middleware/identity');
const CourseMaterial = require('../models/CourseMaterial');
const Purchase = require('../models/Purchase');
const QuizAttempt = require('../models/QuizAttempt');

const router = express.Router();

// POST /api/payment/confirm  (no login required — works for guests too)
// Payment happens outside the app: the learner scans the static UPI QR shown
// on the page and pays directly, then taps "I've Paid" which calls this
// endpoint to record the purchase and unlock the material immediately.
// There is no gateway callback to verify against, so this is trust-based by
// design (confirmed choice for this app).
// body: { materialId, name, email, phone, reason }
router.post('/confirm', resolveIdentity, async (req, res) => {
  try {
    const { materialId, name, email, phone, reason } = req.body;
    if (!materialId || !name || !email || !phone || !reason)
      return res.status(400).json({ message: 'Name, email, phone and reason are required' });

    const material = await CourseMaterial.findById(materialId);
    if (!material) return res.status(404).json({ message: 'Material not found' });

    // Part 2+ of a sequential course (price: 0) is earned via the previous
    // part's quiz, never paid for — reject rather than silently charging the
    // `?? 99` fallback below, which would happen if `||` were used instead
    // since 0 is falsy in JS.
    if (material.courseGroup && material.order > 1) {
      return res.status(400).json({ message: 'This part is unlocked by quiz, not payment' });
    }

    const alreadyPaid = await Purchase.findOne({ identity: req.identity, materialId, status: 'paid' });
    if (alreadyPaid) return res.status(409).json({ message: 'Already purchased' });

    const purchase = new Purchase({
      identity: req.identity,
      materialId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      reason: reason.trim(),
      amount: material.price ?? 99,
      status: 'paid',
      paidAt: new Date(),
    });
    await purchase.save();

    res.json({ message: 'Thanks! You can now download the file.', materialId: purchase.materialId });
  } catch (err) {
    console.error('Confirm payment error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/payment/my-purchases  — the current visitor's own purchase history
router.get('/my-purchases', resolveIdentity, async (req, res) => {
  try {
    const purchases = await Purchase.find({ identity: req.identity, status: 'paid' })
      .populate('materialId', 'title')
      .sort({ paidAt: -1 });
    res.json({
      purchases: purchases.map(p => ({
        _id: p._id,
        materialId: p.materialId?._id,
        materialTitle: p.materialId?.title || 'Untitled',
        amount: p.amount,
        paidAt: p.paidAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/payment/purchases  (admin only) — every buyer's details, for follow-up
router.get('/purchases', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const purchases = await Purchase.find({ status: 'paid' })
      .populate('materialId', 'title')
      .sort({ paidAt: -1 })
      .limit(200);
    res.json({
      purchases: purchases.map(p => ({
        _id: p._id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        reason: p.reason,
        materialTitle: p.materialId?.title || 'Untitled',
        amount: p.amount,
        paidAt: p.paidAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/payment/stats  (admin only) — quick dashboard numbers
router.get('/stats', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const [materials, paidPurchases, revenueAgg, certificates] = await Promise.all([
      CourseMaterial.countDocuments(),
      Purchase.countDocuments({ status: 'paid' }),
      Purchase.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      QuizAttempt.countDocuments({ passed: true }),
    ]);
    res.json({
      materials,
      purchases: paidPurchases,
      revenue: revenueAgg[0]?.total || 0,
      certificates,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
