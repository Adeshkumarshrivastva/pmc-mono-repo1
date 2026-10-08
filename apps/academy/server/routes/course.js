const express = require('express');

const { resolveIdentity, resolveIdentityFromQuery } = require('../middleware/identity');
const { callMainApi, callMainApiFile } = require('../utils/mainApiClient');

const router = express.Router();

// GET /api/course/:courseGroup/status — every part's lock/quiz state for this
// visitor, plus whether the final bundle assessment is unlocked/passed.
// Proxied to apps/server, which holds the real (migrated) quiz/certificate data.
router.get('/:courseGroup/status', resolveIdentity, async (req, res) => {
  try {
    const { ok, status, data } = await callMainApi(`/course-bundle/${req.params.courseGroup}/status`, {
      identity: req.identity,
    });
    if (!ok) return res.status(status).json(data || { message: 'Server error' });

    const parts = (data.parts || []).map(({ materialId, ...rest }) => ({ materialId, ...rest }));
    res.json({ ...data, parts });
  } catch (err) {
    console.error('Course status error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/course/:courseGroup/final — the bundle (all parts' MCQs + one
// long-answer prompt), only once every part above has been passed.
router.get('/:courseGroup/final', resolveIdentity, async (req, res) => {
  try {
    const { ok, status, data } = await callMainApi(`/course-bundle/${req.params.courseGroup}/final`, {
      identity: req.identity,
    });
    if (!ok) return res.status(status).json(data || { message: 'Server error' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/course/:courseGroup/final/submit
// body: { answers: { [questionId]: selectedOptionIndex }, longAnswerText }
router.post('/:courseGroup/final/submit', resolveIdentity, async (req, res) => {
  try {
    const { answers = {}, longAnswerText = '' } = req.body;
    const { ok, status, data } = await callMainApi(`/course-bundle/${req.params.courseGroup}/final/submit`, {
      method: 'POST',
      identity: req.identity,
      body: { answers, longAnswerText },
    });
    if (!ok) return res.status(status).json(data || { message: 'Server error' });
    res.json(data);
  } catch (err) {
    console.error('Final assessment submit error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/course/:courseGroup/certificate  (?token=<jwt> or ?guest=<uuid>)
router.get('/:courseGroup/certificate', resolveIdentityFromQuery, async (req, res) => {
  try {
    const result = await callMainApiFile(`/course-bundle/${req.params.courseGroup}/certificate`, {
      identity: req.identity,
    });
    if (!result.ok) return res.status(result.status).json(result.data || { message: 'Server error' });

    if (result.contentType) res.setHeader('Content-Type', result.contentType);
    if (result.contentDisposition) res.setHeader('Content-Disposition', result.contentDisposition);
    res.send(result.buffer);
  } catch (err) {
    console.error('Course certificate error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
