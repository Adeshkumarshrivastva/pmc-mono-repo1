// One-time fix: the `email_1` unique index on User was created back when the
// schema didn't mark it `sparse`. A non-sparse unique index treats a missing
// email field as `null`, so two OTP-only accounts (no email) collide with
// "dup key: { email: null }". This drops the stale index and lets Mongoose
// recreate it to match the current schema (unique + sparse).
//
// Usage: node fix-email-index.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

async function main() {
  await connectDB();

  const before = await User.collection.indexes();
  console.log('Indexes before:', JSON.stringify(before, null, 2));

  const emailIndex = before.find(i => i.key && Object.keys(i.key).join(',') === 'email');
  if (emailIndex && !emailIndex.sparse) {
    await User.collection.dropIndex(emailIndex.name);
    console.log(`Dropped stale non-sparse index: ${emailIndex.name}`);
  } else if (emailIndex) {
    console.log('email index is already sparse — nothing to drop.');
  } else {
    console.log('No email index found — nothing to drop.');
  }

  // Also clean up any existing docs where email got stored as the literal
  // string "" or null explicitly (would still collide even after the index
  // is sparse, since sparse only skips fields that are fully absent).
  const junk = await User.collection.updateMany(
    { $or: [{ email: null }, { email: '' }] },
    { $unset: { email: '' } }
  );
  if (junk.modifiedCount) console.log(`Unset empty/null email on ${junk.modifiedCount} doc(s).`);

  await User.syncIndexes();
  const after = await User.collection.indexes();
  console.log('Indexes after:', JSON.stringify(after, null, 2));

  await mongoose.disconnect();
  console.log('✔ Done.');
}

main().catch(e => { console.error(e); process.exit(1); });
