const mongoose = require('mongoose');

function createCourseSchema() {
  return new mongoose.Schema({
    emoji:    { type: String, default: '' },
    title:    { type: String, required: true, trim: true },
    desc:     { type: String, required: true },
    duration: { type: String, required: true },
    students: { type: String, default: '0 enrolled' },
    rating:   { type: String, default: '0★' },
    price:    { type: String, required: true },
    oldPrice: { type: String, default: '' },
    level:    {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'All Levels'
    },
    isActive:  { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
  });
}

module.exports = createCourseSchema;
