const express = require('express');

const { resolveIdentity, resolveIdentityFromQuery } = require('../middleware/identity');
const { callMainApi, callMainApiFile } = require('../utils/mainApiClient');

const router = express.Router();

// GET /api/materials  — list all materials (metadata only). Open to everyone,
// no login needed. Proxied to apps/server, which holds the real (migrated)
// material data — see utils/mainApiClient.js.
router.get('/', async (req, res) => {
  try {
    const { ok, status, data } = await callMainApi('/materials');
    if (!ok) return res.status(status).json(data || { message: 'Server error' });

    const materials = (data.materials || []).map(({ id, ...rest }) => ({ _id: id, ...rest }));
    res.json({ materials });
  } catch (err) {
    console.error('Materials fetch error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/materials/:id/access  — can this visitor (logged in or guest) see this material?
router.get('/:id/access', resolveIdentity, async (req, res) => {
  try {
    const { ok, status, data } = await callMainApi(`/materials/${req.params.id}/access`, {
      identity: req.identity,
    });
    if (!ok) return res.status(status).json(data || { message: 'Server error' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/materials/:id/download  (?token=<jwt> or ?guest=<uuid>) — only once unlocked
router.get('/:id/download', resolveIdentityFromQuery, async (req, res) => {
  try {
    const result = await callMainApiFile(`/materials/${req.params.id}/download`, { identity: req.identity });
    if (!result.ok) return res.status(result.status).json(result.data || { message: 'Server error' });

    if (result.contentType) res.setHeader('Content-Type', result.contentType);
    if (result.contentDisposition) res.setHeader('Content-Disposition', result.contentDisposition);
    res.send(result.buffer);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload/delete (admin only) are NOT proxied yet: apps/server's admin routes
// require a real better-auth ADMIN session, and this app's own admin login
// (JWT + ADMIN_PHONES) has no bridge for that — same gap flagged for
// courses/enrollments writes. Managing materials needs a decision/bridge
// before these can move; left unimplemented here rather than silently
// writing to this app's own now-orphaned local database.
router.post('/upload', (req, res) => {
  res.status(501).json({ message: 'Material upload is temporarily unavailable — contact an engineer.' });
});

router.delete('/:id', (req, res) => {
  res.status(501).json({ message: 'Material deletion is temporarily unavailable — contact an engineer.' });
});

module.exports = router;
