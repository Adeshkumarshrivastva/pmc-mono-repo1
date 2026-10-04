const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Enrollment = require('../models/Enrollment');

const router = express.Router();

// GET /api/enrollments/stats  — dashboard stats (protected)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user.id });
    const total = enrollments.length;
    const completed = enrollments.filter(e => e.status === 'completed').length;
    const inProgress = enrollments.filter(e => (e.progress || 0) > 0 && e.status !== 'completed').length;
    const avgProgress = total > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / total)
      : 0;
    res.json({ total, completed, inProgress, notStarted: total - completed - inProgress, avgProgress });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/enrollments/me  — user's enrollments (protected)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user.id }).sort({ enrolledAt: -1 });
    res.json({ enrollments });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/enrollments  — enroll in a course (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { courseId, courseType, courseTitle, price } = req.body;
    if (!courseId || !courseType || !courseTitle)
      return res.status(400).json({ message: 'Missing required fields' });

    const existing = await Enrollment.findOne({ userId: req.user.id, courseId });
    if (existing)
      return res.status(409).json({ message: 'Already enrolled in this course' });

    const enrollment = new Enrollment({
      userId: req.user.id,
      courseId,
      courseType,
      courseTitle,
      price: price || '',
    });
    await enrollment.save();
    res.status(201).json({ message: 'Enrolled successfully!', enrollment });
  } catch (err) {
    console.error('Enrollment error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/enrollments/:id/progress  — update course progress (protected)
router.patch('/:id/progress', authMiddleware, async (req, res) => {
  try {
    const { progress } = req.body;
    if (progress === undefined || progress < 0 || progress > 100)
      return res.status(400).json({ message: 'Progress must be between 0 and 100' });

    const enrollment = await Enrollment.findOne({ _id: req.params.id, userId: req.user.id });
    if (!enrollment)
      return res.status(404).json({ message: 'Enrollment not found' });

    enrollment.progress = progress;
    enrollment.lastAccessedAt = new Date();
    enrollment.status = progress >= 100 ? 'completed' : 'active';
    await enrollment.save();

    res.json({ message: 'Progress updated', enrollment });
  } catch (err) {
    console.error('Progress error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
