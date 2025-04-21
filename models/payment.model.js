// models/payment.model.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    amount: { type: Number, required: true },
    status: { type: String, default: 'pending' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
