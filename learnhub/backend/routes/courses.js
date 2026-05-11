const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { search, category, rating } = req.query;
    let query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (rating) query.avgRating = { $gte: Number(rating) };

    const courses = await Course.find(query).populate('admin', 'name');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const course = await Course.create({ 
      ...req.body, 
      admin: req.user._id
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('admin', 'name');
    if (!course) return res.status(404).json({ msg: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

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

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    course = await Course.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    res.json(course);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    await course.deleteOne();
    res.json({ msg: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;