const express = require('express');

const { resolveIdentity, resolveIdentityFromQuery } = require('../middleware/identity');
const { callMainApi, callMainApiFile } = require('../utils/mainApiClient');

const router = express.Router();

// GET /api/quiz/:materialId/questions  (must have access) — proxied to
// apps/server, which holds the real (migrated) quiz/attempt data.
router.get('/:materialId/questions', resolveIdentity, async (req, res) => {
  try {
    const { ok, status, data } = await callMainApi(`/quiz/${req.params.materialId}/questions`, {
      identity: req.identity,
    });
    if (!ok) return res.status(status).json(data || { message: 'Server error' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/quiz/:materialId/submit  (must have access)
// body: { answers: { [questionId]: selectedOptionIndex } }
router.post('/:materialId/submit', resolveIdentity, async (req, res) => {
  try {
    const { answers = {} } = req.body;
    const { ok, status, data } = await callMainApi(`/quiz/${req.params.materialId}/submit`, {
      method: 'POST',
      identity: req.identity,
      body: { answers },
    });
    if (!ok) return res.status(status).json(data || { message: 'Server error' });
    res.json(data);
  } catch (err) {
    console.error('Quiz submit error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/quiz/:materialId/certificate  (?token=<jwt> or ?guest=<uuid>, must have passed)
router.get('/:materialId/certificate', resolveIdentityFromQuery, async (req, res) => {
  try {
    const result = await callMainApiFile(`/quiz/${req.params.materialId}/certificate`, { identity: req.identity });
    if (!result.ok) return res.status(result.status).json(result.data || { message: 'Server error' });

    if (result.contentType) res.setHeader('Content-Type', result.contentType);
    if (result.contentDisposition) res.setHeader('Content-Disposition', result.contentDisposition);
    res.send(result.buffer);
  } catch (err) {
    console.error('Certificate error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/quiz/my-certificates  — the current visitor's earned certificates
router.get('/my-certificates', resolveIdentity, async (req, res) => {
  try {
    const { ok, status, data } = await callMainApi('/certificates/me', { identity: req.identity });
    if (!ok) return res.status(status).json(data || { message: 'Server error' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
