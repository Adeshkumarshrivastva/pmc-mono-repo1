const mongoose = require('mongoose');
const createCourseSchema = require('./courseSchema');
module.exports = mongoose.model('OnlineCourse', createCourseSchema());
