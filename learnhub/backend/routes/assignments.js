const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const { protect, adminOnly } = require('../middleware/auth');

// Create assignment
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const assignment = await Assignment.create(req.body);
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get assignments for a course
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Submit assignment
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

// Get submissions for an assignment (admin only)
router.get('/:assignmentId/submissions', protect, adminOnly, async (req, res) => {
  try {
    const submissions = await AssignmentSubmission.find({ assignment: req.params.assignmentId }).populate('user', 'name');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Grade submission (admin only)
router.post('/grade/:submissionId', protect, adminOnly, async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const submission = await AssignmentSubmission.findByIdAndUpdate(
      req.params.submissionId,
      { grade, feedback },
      { new: true }
    );

    // Gamification Logic: Award points for getting graded
    if (submission) {
      const User = require('../models/User');
      const Notification = require('../models/Notification');
      const student = await User.findById(submission.user);
      if (student && !submission.pointsAwarded) {
        const currentPoints = (student.points || 0) + 50;
        const newBadges = [];
        
        // Check for Assignment Pro badge
        if (currentPoints >= 100 && !(student.badges || []).includes('Assignment Pro')) {
          newBadges.push('Assignment Pro');
        }
        
        await User.findByIdAndUpdate(submission.user, {
          $inc: { points: 50 },
          $addToSet: { badges: { $each: newBadges } }
        });
        
        let msg = 'You earned 50 points for getting your assignment graded!';
        if (newBadges.length > 0) {
          msg += ` You also unlocked the "${newBadges.join(', ')}" badge!`;
        }
        await Notification.create({ user: submission.user, message: msg });
        
        // Mark submission so points aren't awarded twice if graded again
        submission.pointsAwarded = true;
        await submission.save();
      }
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get my submissions for a course
router.get('/my-submissions/:courseId', protect, async (req, res) => {
  try {
    const submissions = await AssignmentSubmission.find({ user: req.user._id, course: req.params.courseId });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
