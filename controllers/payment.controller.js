// controllers/payment.controller.js
const Payment = require('../models/payment.model');

exports.createPayment = async (req, res) => {
  try {
    const { userId, quizId, amount } = req.body;
    const payment = await Payment.create({ userId, quizId, amount, status: 'initiated' });
    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json({ success: true, data: payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const updatedData = req.body;

    const payment = await Payment.findByIdAndUpdate(paymentId, updatedData, { new: true });

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }
    res.json({ success: true, data: payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findByIdAndDelete(paymentId);
    if(!payment) return res.status(404).json({ success: false, error: "Payment not found" })
    res.json({ success: true, data: {} });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
