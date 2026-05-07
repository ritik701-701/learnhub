const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const { protect, adminOnly } = require('../middleware/auth');
const Course = require('../models/Course');
const User = require('../models/User');

// Get progress for a specific course
router.get('/:courseId', protect, async (req, res) => {
  try {
    let progress = await Progress.findOne({ user: req.user._id, course: req.params.courseId });
    if (!progress) {
      progress = await Progress.create({ user: req.user._id, course: req.params.courseId, completedLessons: [] });
    }
    
    const totalLessons = await Lesson.countDocuments({ course: req.params.courseId });
    const percent = totalLessons === 0 ? 0 : (progress.completedLessons.length / totalLessons) * 100;

    res.json({ progress, percent });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Mark lesson as complete
router.post('/complete', protect, async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;
    let progress = await Progress.findOne({ user: req.user._id, course: courseId });
    let isNewCompletion = false;

    if (!progress) {
      progress = await Progress.create({ user: req.user._id, course: courseId, completedLessons: [lessonId] });
      isNewCompletion = true;
    } else if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
      await progress.save();
      isNewCompletion = true;
    }

    // Gamification Logic: Award points and badges
    if (isNewCompletion) {
      const Notification = require('../models/Notification');
      const user = await User.findById(req.user._id);
      if (user) {
        const currentPoints = (user.points || 0) + 10;
        const newBadges = [];
        
        if (currentPoints >= 50 && !(user.badges || []).includes('Fast Learner')) {
          newBadges.push('Fast Learner');
        }
        if (currentPoints >= 200 && !(user.badges || []).includes('Course Master')) {
          newBadges.push('Course Master');
        }

        await User.findByIdAndUpdate(req.user._id, {
          $inc: { points: 10 },
          $addToSet: { badges: { $each: newBadges } }
        });

        let msg = 'You earned 10 points for completing a lesson!';
        if (newBadges.length > 0) {
          msg += ` You also unlocked the "${newBadges.join(', ')}" badge!`;
        }
        await Notification.create({ user: req.user._id, message: msg });
      }
    }

    res.json(progress);
  } catch (error) {
    console.error('Progress complete error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Get attendance/roster for a course (instructor only)
router.get('/course/:courseId/attendance', protect, adminOnly, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).populate('students', 'name email');
    if (!course) return res.status(404).json({ msg: 'Course not found' });
    
    const totalLessons = await Lesson.countDocuments({ course: req.params.courseId });
    
    const roster = [];
    for (const student of course.students) {
      const progress = await Progress.findOne({ user: student._id, course: req.params.courseId });
      const completed = progress ? progress.completedLessons.length : 0;
      const percent = totalLessons === 0 ? 0 : (completed / totalLessons) * 100;
      
      roster.push({
        _id: student._id,
        name: student.name,
        email: student.email,
        completed,
        totalLessons,
        percent: Math.round(percent)
      });
    }

    res.json(roster);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
