const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId:       { type: mongoose.Schema.Types.ObjectId, required: true },
  courseType:     { type: String, required: true },
  courseTitle:    { type: String, required: true },
  price:          { type: String, default: '' },
  status:         { type: String, enum: ['active', 'completed'], default: 'active' },
  progress:       { type: Number, min: 0, max: 100, default: 0 },
  lastAccessedAt: { type: Date, default: null },
  enrolledAt:     { type: Date, default: Date.now },
});

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
