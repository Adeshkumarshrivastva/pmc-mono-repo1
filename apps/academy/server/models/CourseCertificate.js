const mongoose = require('mongoose');

// The final, whole-course certificate — separate from the per-part
// QuizAttempt records. Earned by passing the final bundle assessment (every
// part's MCQs together, plus a required long-answer submission) once every
// part in the courseGroup has already been individually passed.
const courseCertificateSchema = new mongoose.Schema({
  identity:    { type: String, required: true },
  courseGroup: { type: String, required: true },

  score: { type: Number, required: true }, // MCQ correct count
  total: { type: Number, required: true },
  passed: { type: Boolean, required: true },

  longAnswer: { type: String, default: '' }, // not auto-graded, kept for record/review

  certificateId: { type: String }, // set once issued
  attemptedAt:   { type: Date, default: Date.now },
});

courseCertificateSchema.index({ identity: 1, courseGroup: 1 });

module.exports = mongoose.model('CourseCertificate', courseCertificateSchema);
