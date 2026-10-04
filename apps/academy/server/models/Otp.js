const mongoose = require('mongoose');

// One-time-password for phone-based login (used for both the user flow and
// the admin flow — same mechanism, gated by User.role afterwards).
const otpSchema = new mongoose.Schema({
  phone:     { type: String, required: true, unique: true, trim: true },
  code:      { type: String, required: true },
  attempts:  { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Otp', otpSchema);
