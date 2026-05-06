const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const Course = require('../models/Course');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const { courseId, stars } = req.body;
    let rating = await Rating.findOne({ user: req.user._id, course: courseId });
    
    if (rating) {
      rating.stars = stars;
      await rating.save();
    } else {
      rating = await Rating.create({ user: req.user._id, course: courseId, stars });
    }

    // Update average rating on course
    const allRatings = await Rating.find({ course: courseId });
    const avg = allRatings.reduce((acc, r) => acc + r.stars, 0) / allRatings.length;
    await Course.findByIdAndUpdate(courseId, { avgRating: avg });

    res.json(rating);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/:courseId/me', protect, async (req, res) => {
  try {
    const rating = await Rating.findOne({ user: req.user._id, course: req.params.courseId });
    res.json({ stars: rating ? rating.stars : 0 });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
