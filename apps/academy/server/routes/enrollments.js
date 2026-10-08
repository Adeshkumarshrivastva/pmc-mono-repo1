const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { callMainApi } = require('../utils/mainApiClient');

const router = express.Router();

// Enrollments are proxied to apps/server, which holds the real (migrated)
// enrollment data — see utils/mainApiClient.js. This app's own JWT login
// (authMiddleware) is unchanged; `user:<id>` built from the verified JWT's
// id is what maps to the exact `legacy:<id>` identity the migration stored
// this user's existing enrollments under.
function identityFor(req) {
  return `user:${req.user.id}`;
}

// GET /api/enrollments/stats  — dashboard stats (protected)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const { ok, status, data } = await callMainApi('/enrollments/stats', { identity: identityFor(req) });
    if (!ok) return res.status(status).json(data || { message: 'Server error' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/enrollments/me  — user's enrollments (protected)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { ok, status, data } = await callMainApi('/enrollments/me', { identity: identityFor(req) });
    if (!ok) return res.status(status).json(data || { message: 'Server error' });
    res.json({ enrollments: (data.enrollments || []).map(({ id, ...rest }) => ({ _id: id, ...rest })) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/enrollments  — enroll in a course (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { courseId, courseType, courseTitle } = req.body;
    if (!courseId || !courseType || !courseTitle)
      return res.status(400).json({ message: 'Missing required fields' });

    const { ok, status, data } = await callMainApi('/enrollments', {
      method: 'POST',
      identity: identityFor(req),
      body: { courseId },
    });
    if (!ok) return res.status(status).json(data || { message: 'Server error' });

    const { id, ...rest } = data.enrollment;
    res.status(201).json({ message: 'Enrolled successfully!', enrollment: { _id: id, ...rest } });
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

    const { ok, status, data } = await callMainApi(`/enrollments/${req.params.id}/progress`, {
      method: 'PATCH',
      identity: identityFor(req),
      body: { progress },
    });
    if (!ok) return res.status(status).json(data || { message: 'Server error' });

    const { id, ...rest } = data.enrollment;
    res.json({ message: 'Progress updated', enrollment: { _id: id, ...rest } });
  } catch (err) {
    console.error('Progress error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
