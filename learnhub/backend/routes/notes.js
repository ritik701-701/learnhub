const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { protect } = require('../middleware/auth');

// @route   GET /api/notes/:lessonId
// @desc    Get user notes for a lesson
// @access  Private
router.get('/:lessonId', protect, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id, lesson: req.params.lessonId }).sort({ createdAt: 1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/notes
// @desc    Create a new note
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { lesson, text, timestamp } = req.body;
    const note = await Note.create({ user: req.user._id, lesson, text, timestamp: timestamp || 0 });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ msg: 'Note not found' });
    if (note.user.toString() !== req.user._id.toString()) return res.status(401).json({ msg: 'Not authorized' });

    await note.remove();
    res.json({ msg: 'Note removed' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
