const mongoose = require('mongoose');

// A user's attempt at the certification quiz for a given CourseMaterial.
// `identity` mirrors Purchase — `user:<mongoId>` or `guest:<uuid>`.
const quizAttemptSchema = new mongoose.Schema({
  identity:   { type: String, required: true },
  materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseMaterial', required: true },

  score: { type: Number, required: true }, // number of correct answers
  total: { type: Number, required: true }, // total questions
  passed: { type: Boolean, required: true }, // score >= 5/10

  certificateId: { type: String }, // set once a certificate has been issued
  attemptedAt:   { type: Date, default: Date.now },
});

quizAttemptSchema.index({ identity: 1, materialId: 1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
