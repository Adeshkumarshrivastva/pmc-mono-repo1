const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:      { type: String, trim: true, default: '' },
  // Optional now — phone+OTP accounts (see routes/auth.js send-otp/verify-otp)
  // don't collect an email or password. `sparse` lets many docs omit it
  // while still keeping it unique whenever it IS set.
  email:     { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  phone:     { type: String, required: true, trim: true },
  password:  { type: String },
  role:      { type: String, enum: ['user', 'admin'], default: 'user' },
  resetPasswordToken:   { type: String },
  resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
