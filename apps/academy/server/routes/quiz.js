const express = require('express');
const crypto = require('crypto');

const { resolveIdentity, resolveIdentityFromQuery } = require('../middleware/identity');
const CourseMaterial = require('../models/CourseMaterial');
const QuizAttempt = require('../models/QuizAttempt');
const legacyQuizQuestions = require('../data/quizQuestions');
const { getPartQuestions } = require('../data/courseQuizzes');
const { hasAccess } = require('../utils/access');

const router = express.Router();
const LEGACY_PASS_MARK = 5; // out of 10 — unchanged behaviour for non-grouped materials

// Materials that belong to a sequential courseGroup (order set by
// seed-clinical-intake.js / the admin upload form) get their own per-part
// question set from data/courseQuizzes.js. Anything else keeps using the
// single shared bank that existed before, so old materials are unaffected.
function questionsForMaterial(material) {
  if (material.courseGroup && material.order) {
    const partQuestions = getPartQuestions(material.courseGroup, material.order);
    if (partQuestions) return { questions: partQuestions, passMark: Math.ceil(partQuestions.length * 0.5) };
  }
  return { questions: legacyQuizQuestions, passMark: LEGACY_PASS_MARK };
}

async function requireAccess(req, res, next) {
  const material = await CourseMaterial.findById(req.params.materialId);
  if (!material) return res.status(404).json({ message: 'Course material not found' });

  const ok = await hasAccess(req.identity, material);
  if (!ok) {
    const message =
      material.courseGroup && material.order > 1
        ? 'Complete the previous part\'s quiz first to unlock this one'
        : 'Please purchase the course material first';
    return res.status(403).json({ message });
  }
  req.material = material;
  next();
}

// GET /api/quiz/:materialId/questions  (must have access)
router.get('/:materialId/questions', resolveIdentity, requireAccess, (req, res) => {
  const { questions, passMark } = questionsForMaterial(req.material);
  const safeQuestions = questions.map(({ id, question, options }) => ({ id, question, options }));
  res.json({ questions: safeQuestions, passMark, total: questions.length });
});

// POST /api/quiz/:materialId/submit  (must have access)
// body: { answers: { [questionId]: selectedOptionIndex } }
router.post('/:materialId/submit', resolveIdentity, requireAccess, async (req, res) => {
  try {
    const { answers = {} } = req.body;
    const { questions, passMark } = questionsForMaterial(req.material);

    let score = 0;
    for (const q of questions) {
      if (Number(answers[q.id]) === q.correctIndex) score += 1;
    }
    const total = questions.length;
    const passed = score >= passMark;

    const attempt = new QuizAttempt({
      identity: req.identity,
      materialId: req.params.materialId,
      score,
      total,
      passed,
    });
    await attempt.save();

    res.json({ score, total, passed, passMark });
  } catch (err) {
    console.error('Quiz submit error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/quiz/:materialId/certificate  (?token=<jwt> or ?guest=<uuid>, must have passed)
router.get('/:materialId/certificate', resolveIdentityFromQuery, async (req, res) => {
  try {
    const material = await CourseMaterial.findById(req.params.materialId);
    if (!material) return res.status(404).json({ message: 'Course material not found' });

    // A sequential course's per-part quiz only unlocks the next part — the
    // certificate is earned once, from the final bundle assessment
    // (routes/course.js). Without this guard, hitting this endpoint directly
    // for e.g. Part 1's materialId would still hand out a "certificate" for
    // passing a single part, which contradicts that design.
    if (material.courseGroup) {
      return res.status(403).json({ message: 'This course issues one certificate after the final assessment, not per part.' });
    }

    const ok = await hasAccess(req.identity, material);
    if (!ok) return res.status(403).json({ message: 'Please purchase the course material first' });

    const attempt = await QuizAttempt.findOne({
      identity: req.identity,
      materialId: req.params.materialId,
      passed: true,
    }).sort({ attemptedAt: -1 });

    if (!attempt) return res.status(403).json({ message: 'Pass the quiz to unlock your certificate' });

    if (!attempt.certificateId) {
      attempt.certificateId = crypto.randomBytes(8).toString('hex').toUpperCase();
      await attempt.save();
    }

    // Grouped materials are rejected above, so this is always a plain,
    // directly-paid-for material — its own Purchase record has the name.
    const Purchase = require('../models/Purchase');
    const purchase = await Purchase.findOne({ identity: req.identity, materialId: material._id, status: 'paid' });

    const { streamCertificate } = require('../utils/certificate');
    streamCertificate(res, {
      name: purchase?.name || 'Learner',
      courseTitle: material.title,
      score: attempt.score,
      total: attempt.total,
      certificateId: attempt.certificateId,
      date: new Date(attempt.attemptedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
    });
  } catch (err) {
    console.error('Certificate error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/quiz/my-certificates  — the current visitor's earned certificates
router.get('/my-certificates', resolveIdentity, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ identity: req.identity, passed: true })
      .populate('materialId', 'title')
      .sort({ attemptedAt: -1 });

    // Keep only the latest passing attempt per material.
    const seen = new Set();
    const certificates = [];
    for (const a of attempts) {
      const matId = a.materialId?._id?.toString();
      if (!matId || seen.has(matId)) continue;
      seen.add(matId);
      certificates.push({
        materialId: matId,
        materialTitle: a.materialId?.title || 'Untitled',
        score: a.score,
        total: a.total,
        certificateId: a.certificateId,
        attemptedAt: a.attemptedAt,
      });
    }
    res.json({ certificates });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
