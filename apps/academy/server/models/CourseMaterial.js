const mongoose = require('mongoose');

// A single uploaded course resource (PPT/PDF) for the Online Course page.
// Stored on disk under backend/uploads — this schema only holds the metadata.
const courseMaterialSchema = new mongoose.Schema({
  title:          { type: String, required: true, trim: true },
  fileName:       { type: String, required: true },   // original name shown to users
  storedFileName: { type: String, required: true },    // actual name on disk (unique)
  mimeType:       { type: String, required: true },
  size:           { type: Number, default: 0 },
  price:          { type: Number, default: 99 },        // rupees, charged to unlock download
  uploadedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt:     { type: Date, default: Date.now },

  // Optional sequential-course grouping: materials sharing the same
  // `courseGroup` unlock in `order` (1, 2, 3...) — paying for order 1 starts
  // the course, and each later part unlocks only once the previous part's
  // quiz (data/courseQuizzes.js) has been passed. Materials with no
  // `courseGroup` behave exactly as before (independent pay-per-material).
  courseGroup:    { type: String, default: null },
  order:          { type: Number, default: null },
});

module.exports = mongoose.model('CourseMaterial', courseMaterialSchema);
