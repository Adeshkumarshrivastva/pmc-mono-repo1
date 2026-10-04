const mongoose = require('mongoose');

// One payment attempt/record for unlocking a CourseMaterial download.
//
// No login is required to browse or buy — `identity` is either
// `user:<mongoId>` (when a JWT is present) or `guest:<uuid>` (a per-browser
// id generated on the frontend), so purchases work with or without an account.
//
// Payment happens outside the app: the learner scans a static UPI QR
// (src/assets/payment-qr.jpg), pays directly on their own UPI app, and taps
// "I've Paid" — that immediately marks this as 'paid' and unlocks the
// material. There's no gateway callback to verify against, so this is
// trust-based by design (confirmed choice for this app).
const purchaseSchema = new mongoose.Schema({
  identity:   { type: String, required: true },
  materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseMaterial', required: true },

  // Details collected just before payment (pre-filled from profile, editable).
  name:   { type: String, required: true, trim: true },
  email:  { type: String, required: true, trim: true, lowercase: true },
  phone:  { type: String, required: true, trim: true },
  reason: { type: String, required: true, trim: true }, // "Why are you interested in this course?"

  amount:   { type: Number, required: true }, // in rupees
  currency: { type: String, default: 'INR' },

  status: { type: String, enum: ['paid'], default: 'paid' },

  createdAt: { type: Date, default: Date.now },
  paidAt:    { type: Date },
});

// Fast "has this identity already paid for this material?" lookups.
purchaseSchema.index({ identity: 1, materialId: 1, status: 1 });

module.exports = mongoose.model('Purchase', purchaseSchema);
