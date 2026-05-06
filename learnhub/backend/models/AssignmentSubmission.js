const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  answerText: { type: String, required: true },
  grade: { type: Number, default: null }, // Null means ungraded
  feedback: { type: String },
  pointsAwarded: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('AssignmentSubmission', submissionSchema);
