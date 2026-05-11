const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const assignment = await Assignment.create(req.body);
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/submit', protect, async (req, res) => {
  try {
    const { assignmentId, courseId, answerText } = req.body;
    let submission = await AssignmentSubmission.findOne({ user: req.user._id, assignment: assignmentId });
    
    if (submission) {
      submission.answerText = answerText;
      await submission.save();
    } else {
      submission = await AssignmentSubmission.create({
        user: req.user._id,
        assignment: assignmentId,
        course: courseId,
        answerText
      });
    }
    res.json(submission);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/:assignmentId/submissions', protect, adminOnly, async (req, res) => {
  try {
    const submissions = await AssignmentSubmission.find({ assignment: req.params.assignmentId }).populate('user', 'name');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

const PASSING_GRADES = ['A', 'B', 'C'];

router.post('/grade/:submissionId', protect, adminOnly, async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const validGrades = ['A', 'B', 'C', 'D', 'F'];
    const upperGrade = (grade || '').toUpperCase().trim();
    if (!validGrades.includes(upperGrade)) {
      return res.status(400).json({ msg: 'Invalid grade. Must be A, B, C, D, or F.' });
    }

    const passed = PASSING_GRADES.includes(upperGrade);

    const submission = await AssignmentSubmission.findByIdAndUpdate(
      req.params.submissionId,
      { grade: upperGrade, passed, feedback },
      { new: true }
    );

    if (!submission) return res.status(404).json({ msg: 'Submission not found' });

    if (passed && !submission.pointsAwarded) {
      const User = require('../models/User');
      const Notification = require('../models/Notification');
      const student = await User.findById(submission.user);
      if (student) {
        const newBadges = [];
        const currentPoints = (student.points || 0) + 50;

        if (currentPoints >= 100 && !(student.badges || []).includes('Assignment Pro')) {
          newBadges.push('Assignment Pro');
        }

        await User.findByIdAndUpdate(submission.user, {
          $inc: { points: 50 },
          $addToSet: { badges: { $each: newBadges } }
        });

        let msg = `You got grade ${upperGrade} on your assignment and earned 50 points!`;
        if (newBadges.length > 0) {
          msg += ` You also unlocked the "${newBadges.join(', ')}" badge!`;
        }
        await Notification.create({ user: submission.user, message: msg });

        await AssignmentSubmission.findByIdAndUpdate(req.params.submissionId, { pointsAwarded: true });
      }
    }

    res.json(submission);
  } catch (error) {
    console.error('Grade error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/my-submissions/:courseId', protect, async (req, res) => {
  try {
    const submissions = await AssignmentSubmission.find({ user: req.user._id, course: req.params.courseId });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
