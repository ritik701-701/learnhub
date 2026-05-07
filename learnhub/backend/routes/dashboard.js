const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/student', protect, async (req, res) => {
  try {
    const courses = await Course.find({ students: req.user._id });
    const progressList = await Progress.find({ user: req.user._id });
    
    let totalProgress = 0;
    let completedCourses = 0;

    for (const p of progressList) {
      const totalLessons = await Lesson.countDocuments({ course: p.course });
      if (totalLessons > 0) {
        const percent = (p.completedLessons.length / totalLessons) * 100;
        totalProgress += percent;
        if (percent === 100) completedCourses++;
      }
    }

    const avgProgress = courses.length > 0 ? (totalProgress / courses.length) : 0;

    const User = require('../models/User');
    const user = await User.findById(req.user._id).select('points badges');

    res.json({
      enrolledCourses: courses.length,
      completedCourses,
      avgProgress: Math.round(avgProgress),
      recentCourses: courses.slice(-3), // Mock recent activity
      points: user.points || 0,
      badges: user.badges || []
    });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    // Admin sees ALL platform courses, not just ones they created
    const courses = await Course.find({});
    const totalStudents = courses.reduce((acc, course) => acc + course.students.length, 0);
    
    const topCourse = courses.length > 0
      ? courses.reduce((prev, current) => (prev.avgRating > current.avgRating) ? prev : current)
      : null;

    res.json({
      totalCourses: courses.length,
      totalStudents,
      topCourse: topCourse ? topCourse.title : 'N/A',
      coursesStats: courses.map(c => ({ _id: c._id, title: c.title, students: c.students.length }))
    });
  } catch (error) {
    console.error("Dashboard Admin Route Error:", error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

module.exports = router;
