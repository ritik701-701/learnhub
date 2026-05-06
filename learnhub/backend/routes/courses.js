const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const { protect, instructorOnly } = require('../middleware/auth');

// Get all courses (with search and filter)
router.get('/', async (req, res) => {
  try {
    const { search, category, rating } = req.query;
    let query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (rating) query.avgRating = { $gte: Number(rating) };

    const courses = await Course.find(query).populate('instructor', 'name');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create course (instructor only)
router.post('/', protect, instructorOnly, async (req, res) => {
  try {
    const course = await Course.create({ ...req.body, instructor: req.user._id });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get single course
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name');
    if (!course) return res.status(404).json({ msg: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Enroll in a course
router.post('/:id/enroll', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    if (course.students.includes(req.user._id)) {
      return res.status(400).json({ msg: 'Already enrolled' });
    }

    course.students.push(req.user._id);
    await course.save();

    await Notification.create({
      user: req.user._id,
      message: `You successfully enrolled in ${course.title}`
    });

    res.json({ msg: 'Enrolled successfully' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update course (instructor only)
router.put('/:id', protect, instructorOnly, async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }

    // Make sure user owns course
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(401).json({ msg: 'Not authorized to update this course' });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json(course);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
