// One-time helper: promote a phone number to admin so it can sign in at
// /admin/login and reach the Admin Dashboard (upload access).
//
// Usage:  node make-admin.js 9876543210
//
// If no account exists yet for that phone, one is created directly with
// role 'admin' — you can then just use the OTP login on /admin/login.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

async function main() {
  const phone = (process.argv[2] || '').trim();
  if (!/^[6-9]\d{9}$/.test(phone)) {
    console.error('Usage: node make-admin.js <10-digit-phone-number>');
    process.exit(1);
  }

  await connectDB();

  let user = await User.findOne({ phone }).sort({ createdAt: -1 });
  if (!user) {
    user = new User({ phone, name: `Admin ${phone.slice(-4)}`, role: 'admin' });
  } else {
    user.role = 'admin';
  }
  await user.save();

  console.log(`✔ ${phone} (${user.name}) is now an admin. Log in via /admin/login.`);
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
