const express = require('express');
const crypto = require('crypto');

const { resolveIdentity, resolveIdentityFromQuery } = require('../middleware/identity');
const CourseMaterial = require('../models/CourseMaterial');
const Purchase = require('../models/Purchase');
const QuizAttempt = require('../models/QuizAttempt');
const CourseCertificate = require('../models/CourseCertificate');
const { getFinalAssessment } = require('../data/courseQuizzes');
const { hasAccess } = require('../utils/access');
const { streamCertificate } = require('../utils/certificate');

const router = express.Router();

async function loadOrderedParts(courseGroup) {
  // Order 0 is a free intro/preview with no quiz of its own (see
  // utils/access.js's always-open check) — excluded here so it never counts
  // against "every part passed" for the final certification assessment.
  return CourseMaterial.find({ courseGroup, order: { $gte: 1 } }).sort({ order: 1 });
}

// GET /api/course/:courseGroup/status — every part's lock/quiz state for this
// visitor, plus whether the final bundle assessment is unlocked/passed. Powers
// the whole sequential-course UI in one call.
router.get('/:courseGroup/status', resolveIdentity, async (req, res) => {
  try {
    const parts = await loadOrderedParts(req.params.courseGroup);
    if (parts.length === 0) return res.status(404).json({ message: 'Course not found' });

    const items = [];
    for (const material of parts) {
      const unlocked = await hasAccess(req.identity, material);
      const lastAttempt = unlocked
        ? await QuizAttempt.findOne({ identity: req.identity, materialId: material._id }).sort({ attemptedAt: -1 })
        : null;
      // "Passed" must reflect any attempt ever, not just the latest one —
      // hasAccess() (and requireAllPartsPassed below) unlock the next part
      // permanently on a first pass, so a later failed retake can't be
      // allowed to make this flip back to false and desync the UI from what
      // access control actually allows.
      const everPassed = unlocked
        ? !!(await QuizAttempt.exists({ identity: req.identity, materialId: material._id, passed: true }))
        : false;
      items.push({
        materialId: material._id,
        title: material.title,
        order: material.order,
        price: material.price,
        unlocked,
        quizPassed: everPassed,
        lastScore: lastAttempt ? { score: lastAttempt.score, total: lastAttempt.total } : null,
      });
    }

    const allPassed = items.every((i) => i.quizPassed);
    const certificate = await CourseCertificate.findOne({ identity: req.identity, courseGroup: req.params.courseGroup, passed: true });

    res.json({ parts: items, allPassed, finalUnlocked: allPassed, certificateEarned: !!certificate });
  } catch (err) {
    console.error('Course status error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

async function requireAllPartsPassed(req, res, next) {
  const parts = await loadOrderedParts(req.params.courseGroup);
  if (parts.length === 0) return res.status(404).json({ message: 'Course not found' });

  for (const material of parts) {
    const attempt = await QuizAttempt.findOne({ identity: req.identity, materialId: material._id, passed: true });
    if (!attempt) return res.status(403).json({ message: `Finish and pass "${material.title}" first.` });
  }
  req.parts = parts;
  next();
}

// GET /api/course/:courseGroup/final — the bundle (all parts' MCQs + one
// long-answer prompt), only once every part above has been passed.
router.get('/:courseGroup/final', resolveIdentity, requireAllPartsPassed, (req, res) => {
  const assessment = getFinalAssessment(req.params.courseGroup);
  if (!assessment) return res.status(404).json({ message: 'Final assessment not configured for this course' });

  res.json({
    mcq: assessment.mcq.map(({ id, question, options }) => ({ id, question, options })),
    longAnswer: assessment.longAnswer,
    passMark: Math.ceil(assessment.mcq.length * 0.5),
    total: assessment.mcq.length,
  });
});

// POST /api/course/:courseGroup/final/submit
// body: { answers: { [questionId]: selectedOptionIndex }, longAnswerText }
router.post('/:courseGroup/final/submit', resolveIdentity, requireAllPartsPassed, async (req, res) => {
  try {
    const assessment = getFinalAssessment(req.params.courseGroup);
    if (!assessment) return res.status(404).json({ message: 'Final assessment not configured for this course' });

    const { answers = {}, longAnswerText = '' } = req.body;

    let score = 0;
    for (const q of assessment.mcq) {
      if (Number(answers[q.id]) === q.correctIndex) score += 1;
    }
    const total = assessment.mcq.length;
    const passMark = Math.ceil(total * 0.5);
    const passed = score >= passMark && longAnswerText.trim().length > 0;

    const record = new CourseCertificate({
      identity: req.identity,
      courseGroup: req.params.courseGroup,
      score,
      total,
      passed,
      longAnswer: longAnswerText.trim(),
    });
    await record.save();

    res.json({
      score,
      total,
      passed,
      passMark,
      requiresLongAnswer: longAnswerText.trim().length === 0,
    });
  } catch (err) {
    console.error('Final assessment submit error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/course/:courseGroup/certificate  (?token=<jwt> or ?guest=<uuid>)
router.get('/:courseGroup/certificate', resolveIdentityFromQuery, async (req, res) => {
  try {
    const record = await CourseCertificate.findOne({
      identity: req.identity,
      courseGroup: req.params.courseGroup,
      passed: true,
    }).sort({ attemptedAt: -1 });
    if (!record) return res.status(403).json({ message: 'Pass the final assessment to unlock your certificate' });

    if (!record.certificateId) {
      record.certificateId = crypto.randomBytes(8).toString('hex').toUpperCase();
      await record.save();
    }

    const firstPart = await CourseMaterial.findOne({ courseGroup: req.params.courseGroup, order: 1 });
    const purchase = firstPart
      ? await Purchase.findOne({ identity: req.identity, materialId: firstPart._id, status: 'paid' })
      : null;

    streamCertificate(res, {
      name: purchase?.name || 'Learner',
      courseTitle: firstPart ? firstPart.title.replace(/^PART\s*1\s*-\s*/i, '') : 'Course',
      score: record.score,
      total: record.total,
      certificateId: record.certificateId,
      date: new Date(record.attemptedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
    });
  } catch (err) {
    console.error('Course certificate error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
