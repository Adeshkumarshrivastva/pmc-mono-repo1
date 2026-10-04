const express = require('express');
const Webinar = require('../models/Webinar');
const OnlineCourse = require('../models/OnlineCourse');
const HybridCourse = require('../models/HybridCourse');
const OnlineClass = require('../models/OnlineClass');
const OfflineCourse = require('../models/OfflineCourse');

const router = express.Router();

const modelMap = {
  'webinar':        Webinar,
  'online-course':  OnlineCourse,
  'hybrid-course':  HybridCourse,
  'online-class':   OnlineClass,
  'offline-course': OfflineCourse,
};

// GET /api/courses/:type  — fetch all courses of a given type
router.get('/:type', async (req, res) => {
  try {
    const Model = modelMap[req.params.type];
    if (!Model) return res.status(404).json({ message: 'Course type not found' });

    const courses = await Model.find({ isActive: true }).sort({ createdAt: 1 });
    res.json({ courses });
  } catch (err) {
    console.error('Courses fetch error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
