const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const { protect, instructorOnly } = require('../middleware/auth');

// Get lessons for a course (enrolled students only ideally, but simple for now)
router.get('/:courseId', protect, async (req, res) => {
  try {
    const lessons = await Lesson.find({ course: req.params.courseId });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add a lesson (instructor only)
router.post('/', protect, instructorOnly, async (req, res) => {
  try {
    const { title, youtubeLink, course } = req.body;
    const lesson = await Lesson.create({ title, youtubeLink, course });

    const courseObj = await Course.findById(course);
    if (courseObj) {
      // Notify enrolled students
      const notifications = courseObj.students.map(studentId => ({
        user: studentId,
        message: `New lesson added to ${courseObj.title}: ${title}`
      }));
      await Notification.insertMany(notifications);
    }

    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
