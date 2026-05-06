const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  youtubeLink: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  isLive: { type: Boolean, default: false },
  liveDate: { type: Date },
  liveMeetingLink: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);
