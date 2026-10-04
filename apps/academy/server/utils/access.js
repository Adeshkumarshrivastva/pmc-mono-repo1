// Shared "can this identity see/download this material" check, used by both
// routes/materials.js and routes/quiz.js so the two can't drift apart.
//
// Order 0 of a group: free intro/preview — open to everyone, no payment or
// quiz needed (e.g. "Foundations of Clinical Work" ahead of Part 1).
// Order 1 of a group, or a plain (non-grouped) material: access = paid
// Purchase for this exact material.
// Grouped, order > 1 materials (routes/course.js): access is earned, not paid
// for — it's granted once the identity has passed the quiz for the previous
// part in the same courseGroup.
const CourseMaterial = require('../models/CourseMaterial');
const Purchase = require('../models/Purchase');
const QuizAttempt = require('../models/QuizAttempt');

async function hasAccess(identity, material) {
  if (material.courseGroup && material.order === 0) return true;

  if (material.courseGroup && material.order > 1) {
    const prev = await CourseMaterial.findOne({ courseGroup: material.courseGroup, order: material.order - 1 });
    if (!prev) return false;
    const prevAttempt = await QuizAttempt.findOne({ identity, materialId: prev._id, passed: true });
    return !!prevAttempt;
  }
  const purchase = await Purchase.findOne({ identity, materialId: material._id, status: 'paid' });
  return !!purchase;
}

module.exports = { hasAccess };
