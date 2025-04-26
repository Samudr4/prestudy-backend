const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedOptionId: { type: String },
  isCorrect: { type: Boolean },
  timeSpent: { type: Number } // Time spent on this question in seconds
});

const quizResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  incorrectAnswers: { type: Number, required: true },
  notAttempted: { type: Number, required: true },
  timeTaken: { type: Number, required: true }, // in seconds
  completed: { type: Boolean, default: false },
  answers: [answerSchema],
  rank: { type: String },
  points: { type: Number, default: 0 },
  percentage: { type: Number },
  completedAt: { type: Date }
}, {
  timestamps: true
});

// Add indexes for faster querying
quizResultSchema.index({ userId: 1, quizId: 1 });
quizResultSchema.index({ quizId: 1, score: -1 }); // For leaderboard

module.exports = mongoose.model('QuizResult', quizResultSchema); 