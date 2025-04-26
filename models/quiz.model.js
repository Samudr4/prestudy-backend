const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  id: { type: String, required: true }, // A, B, C, D
  text: { type: String, required: true }
});

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  nativeText: { type: String }, // For multilingual support
  options: [optionSchema],
  correctOptionId: { type: String, required: true },
  explanation: { type: String },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  order: { type: Number, default: 0 }
}, { _id: true });

const quizSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true }, // in minutes
  totalQuestions: { type: Number, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  questions: [questionSchema],
  price: { type: Number, default: 0 }, // 0 means free
  isLocked: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  tags: [{ type: String }],
  rating: { type: Number, default: 4.5 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

// Add indexes for faster querying
quizSchema.index({ categoryId: 1, isActive: 1 });
quizSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Quiz', quizSchema); 