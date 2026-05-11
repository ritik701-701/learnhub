const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/:courseId', protect, async (req, res) => {
  try {
    const lessons = await Lesson.find({ course: req.params.courseId });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { title, youtubeLink, course } = req.body;
    const lesson = await Lesson.create({ title, youtubeLink, course });

    const courseObj = await Course.findById(course);
    if (courseObj) {
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
