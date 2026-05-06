const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const { protect, instructorOnly } = require('../middleware/auth');

// Create quiz (instructor only)
router.post('/create', protect, instructorOnly, async (req, res) => {
  try {
    const { course, questions, passingPercent } = req.body;
    let quiz = await Quiz.findOne({ course });
    if (quiz) {
      quiz.questions = questions;
      quiz.passingPercent = passingPercent;
      await quiz.save();
    } else {
      quiz = await Quiz.create({ course, questions, passingPercent });
    }
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get quiz for a course
router.get('/:courseId', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ course: req.params.courseId });
    if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Submit quiz attempt
router.post('/attempt', protect, async (req, res) => {
  try {
    const { quizId, courseId, answers } = req.body; // answers: { [questionId]: 'selectedOption' }
    
    const existingAttempt = await QuizAttempt.findOne({ user: req.user._id, course: courseId });
    if (existingAttempt) {
      return res.status(400).json({ msg: 'You can only attempt the quiz once' });
    }

    const quiz = await Quiz.findById(quizId);
    let score = 0;
    let totalMarks = 0;

    quiz.questions.forEach(q => {
      totalMarks += q.marks;
      if (answers[q._id] === q.correctAnswer) {
        score += q.marks;
      }
    });

    const percent = (score / totalMarks) * 100;
    const passed = percent >= quiz.passingPercent;

    const attempt = await QuizAttempt.create({
      user: req.user._id,
      quiz: quizId,
      course: courseId,
      score: percent,
      passed
    });

    // Gamification Logic: Award points for passing the quiz
    if (passed) {
      const User = require('../models/User');
      const Notification = require('../models/Notification');
      const student = await User.findById(req.user._id);
      if (student) {
        const currentPoints = (student.points || 0) + 100;
        const newBadges = [];
        
        // Award "Quiz Master" badge if they get full marks
        if (percent === 100 && !(student.badges || []).includes('Quiz Master')) {
          newBadges.push('Quiz Master');
        }

        await User.findByIdAndUpdate(req.user._id, {
          $inc: { points: 100 },
          $addToSet: { badges: { $each: newBadges } }
        });

        let msg = 'You earned 100 points for passing the quiz!';
        if (newBadges.length > 0) {
          msg += ` You also unlocked the "${newBadges.join(', ')}" badge!`;
        }
        await Notification.create({ user: req.user._id, message: msg });
      }
    }

    res.json(attempt);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get my result
router.get('/result/:courseId', protect, async (req, res) => {
  try {
    const attempt = await QuizAttempt.findOne({ user: req.user._id, course: req.params.courseId });
    if (!attempt) return res.status(404).json({ msg: 'No attempt found' });
    res.json(attempt);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
