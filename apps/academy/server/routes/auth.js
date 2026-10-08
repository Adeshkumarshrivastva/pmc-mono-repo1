const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const authMiddleware = require('../middleware/authMiddleware');
const { generateOtp, sendOtpMessage } = require('../utils/otp');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pmc_secret_key_2025';

// Phone numbers that are always treated as admin (course upload access),
// regardless of what's in the DB — configurable via env, defaulting to the
// one requested for this deployment. Enforced on every OTP login below so a
// fresh DB (or a stale non-admin row from before) self-heals without needing
// the make-admin.js script run by hand.
const ADMIN_PHONES = (process.env.ADMIN_PHONES || '8826873387')
  .split(',')
  .map((p) => p.trim())
  .filter(Boolean);

function signToken(user) {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists)
      return res.status(409).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password: hashedPassword
    });
    await user.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user)
      return res.status(401).json({ message: 'Username and password is wrong.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Username and password is wrong.' });

    const token = signToken(user);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // No email service configured — return the token directly so the demo flow can continue.
    res.json({ message: 'Reset token generated', resetToken: rawToken });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and new password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Reset link is invalid or has expired' });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me  (protected)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ---- Phone + OTP login (used by both the user and admin dashboards) ----

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const OTP_MAX_ATTEMPTS = 5;

// POST /api/auth/send-otp   body: { phone }
router.post('/send-otp', async (req, res) => {
  try {
    const phone = (req.body.phone || '').trim();
    if (!/^[6-9]\d{9}$/.test(phone))
      return res.status(400).json({ message: 'Enter a valid 10-digit phone number' });

    const otp = generateOtp();
    await Otp.findOneAndUpdate(
      { phone },
      { code: otp, attempts: 0, expiresAt: new Date(Date.now() + OTP_TTL_MS) },
      { upsert: true }
    );

    const result = await sendOtpMessage({ phone, otp });
    if (!result.sent) return res.status(502).json({ message: 'Could not send OTP. Please try again.' });

    // Outside production, always hand back the real OTP too — SMS/WhatsApp
    // gateway "success" only means the gateway accepted the message, not
    // that it actually reached the phone (DLT content filtering, carrier
    // delays, etc. can silently swallow it after acceptance), so devMode
    // alone isn't a reliable signal that a human can read the code somewhere.
    const isDevelopment = process.env.NODE_ENV !== 'production';
    res.json({ message: 'OTP sent', ...(result.devMode || isDevelopment ? { devOtp: otp } : {}) });
  } catch (err) {
    console.error('Send OTP error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/verify-otp   body: { phone, otp, name? }
router.post('/verify-otp', async (req, res) => {
  try {
    const phone = (req.body.phone || '').trim();
    const otp = (req.body.otp || '').trim();
    if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP are required' });

    const record = await Otp.findOne({ phone });
    if (!record || record.expiresAt < new Date())
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });

    if (record.attempts >= OTP_MAX_ATTEMPTS)
      return res.status(429).json({ message: 'Too many attempts. Please request a new OTP.' });

    if (record.code !== otp) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ message: 'Incorrect OTP' });
    }

    await Otp.deleteOne({ phone }); // one-time use

    // Most recently active account for this phone — some numbers have older
    // duplicate test accounts from before phone became the login identity.
    let user = await User.findOne({ phone }).sort({ createdAt: -1 });
    if (!user) {
      const role = ADMIN_PHONES.includes(phone) ? 'admin' : 'user';
      user = new User({ phone, name: (req.body.name || '').trim() || `Member ${phone.slice(-4)}`, role });
      await user.save();
    } else if (ADMIN_PHONES.includes(phone) && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    const token = signToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
  } catch (err) {
    console.error('Verify OTP error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
