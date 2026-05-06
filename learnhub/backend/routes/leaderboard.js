const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   GET /api/leaderboard
// @desc    Get top 10 students by points
// @access  Public
router.get('/', async (req, res) => {
  try {
    const topStudents = await User.find({ role: 'student' })
      .sort({ points: -1 })
      .limit(10)
      .select('name avatar points badges');
      
    res.json(topStudents);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
