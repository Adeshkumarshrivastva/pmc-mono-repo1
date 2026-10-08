const express = require('express');
const { callMainApi } = require('../utils/mainApiClient');

const router = express.Router();

const VALID_TYPES = new Set(['webinar', 'online-course', 'hybrid-course', 'online-class', 'offline-course']);

// GET /api/courses/:type  — fetch all courses of a given type.
// Proxied to apps/server, which holds the real (migrated) course data —
// see utils/mainApiClient.js. `:type` slugs are unchanged from the demo
// (apps/server/src/routes/academy/academy.input.ts keeps the same spelling),
// so no translation is needed beyond restoring `_id` for this app's
// frontend, which still reads `course._id`.
router.get('/:type', async (req, res) => {
  try {
    if (!VALID_TYPES.has(req.params.type)) return res.status(404).json({ message: 'Course type not found' });

    const { ok, status, data } = await callMainApi(`/courses/${req.params.type}`);
    if (!ok) return res.status(status).json(data || { message: 'Server error' });

    const courses = (data.courses || []).map(({ id, ...rest }) => ({ _id: id, ...rest }));
    res.json({ courses });
  } catch (err) {
    console.error('Courses fetch error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
