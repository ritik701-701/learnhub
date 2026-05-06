const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  marks: { type: Number, default: 1 }
});

const quizSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  questions: [questionSchema],
  passingPercent: { type: Number, default: 60 }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
