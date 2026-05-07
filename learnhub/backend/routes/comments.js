const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/:lessonId', protect, async (req, res) => {
  try {
    const comments = await Comment.find({ lesson: req.params.lessonId }).populate('user', 'name');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const comment = await Comment.create({ ...req.body, user: req.user._id });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/:id/reply', protect, adminOnly, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });

    comment.reply = req.body.reply;
    await comment.save();

    await Notification.create({
      user: comment.user,
      message: `An admin replied to your doubt`
    });

    res.json(comment);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
