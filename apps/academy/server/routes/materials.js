const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');

const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');
const { resolveIdentity, resolveIdentityFromQuery } = require('../middleware/identity');
const CourseMaterial = require('../models/CourseMaterial');
const { hasAccess } = require('../utils/access');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) return cb(new Error('Only PDF or PPT/PPTX files are allowed'));
    cb(null, true);
  },
});

function publicMaterial(m) {
  return {
    _id: m._id,
    title: m.title,
    fileName: m.fileName,
    mimeType: m.mimeType,
    size: m.size,
    price: m.price,
    uploadedAt: m.uploadedAt,
    courseGroup: m.courseGroup || null,
    // `?? null`, not `|| null` — order 0 (the free intro/preview part) is a
    // real, meaningful value and must not collapse to null like an unset one.
    order: m.order ?? null,
  };
}

// POST /api/materials/upload  (admin only)
router.post('/upload', authMiddleware, requireAdmin, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

      const order = req.body.order ? Number(req.body.order) : null;
      const courseGroup = (req.body.courseGroup || '').trim() || null;

      // Order 0 = free intro/preview (open to everyone). Order 1 = the paid
      // entry point. Order 2+ is earned by the previous part's quiz, not
      // paid for. A material with no courseGroup is a plain paid download.
      let price = 99;
      if (courseGroup) {
        if (order === 0) price = 0;
        else if (order > 1) price = 0;
      }

      const material = new CourseMaterial({
        title: (req.body.title || req.file.originalname).trim(),
        fileName: req.file.originalname,
        storedFileName: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        price,
        uploadedBy: req.user.id,
        courseGroup,
        order,
      });
      await material.save();
      res.status(201).json({ message: 'Uploaded successfully', material: publicMaterial(material) });
    } catch (e) {
      console.error('Material upload error:', e.message);
      res.status(500).json({ message: 'Server error' });
    }
  });
});

// GET /api/materials  — list all materials (metadata only). Open to everyone, no login needed.
router.get('/', async (req, res) => {
  try {
    // Sequential-course parts (courseGroup + order) sort together in order;
    // everything else keeps the old newest-first behaviour.
    const materials = await CourseMaterial.find().sort({ order: 1, uploadedAt: -1 });
    res.json({ materials: materials.map(publicMaterial) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/materials/:id/access  — can this visitor (logged in or guest) see this material?
// `purchased` means "unlocked" here — for order>1 of a sequential course
// that's earned via the previous part's quiz, not a real payment.
router.get('/:id/access', resolveIdentity, async (req, res) => {
  try {
    const material = await CourseMaterial.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });

    const purchased = await hasAccess(req.identity, material);
    const locked = !purchased && !!(material.courseGroup && material.order > 1);
    res.json({ purchased, locked });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/materials/:id/download  (?token=<jwt> or ?guest=<uuid>) — only once unlocked
router.get('/:id/download', resolveIdentityFromQuery, async (req, res) => {
  try {
    const material = await CourseMaterial.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });

    const ok = await hasAccess(req.identity, material);
    if (!ok) {
      const message =
        material.courseGroup && material.order > 1
          ? "Complete the previous part's quiz first to unlock this file"
          : 'Please complete the ₹99 payment to download this file';
      return res.status(403).json({ message });
    }

    const filePath = path.join(UPLOAD_DIR, material.storedFileName);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File missing on server' });

    res.setHeader('Content-Type', material.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${material.fileName}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/materials/:id  (admin only)
router.delete('/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const material = await CourseMaterial.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });

    const filePath = path.join(UPLOAD_DIR, material.storedFileName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await CourseMaterial.deleteOne({ _id: material._id });

    res.json({ message: 'Material removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
