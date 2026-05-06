const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  text: { type: String, required: true },
  reply: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
