// controllers/feedback.controller.js
const Feedback = require('../models/feedback.model');

exports.createFeedback = async (req, res) => {
  try {
    const { userId, message } = req.body;
    const feedback = await Feedback.create({ userId, message });
    res.status(201).json({ success: true, data: feedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.updateFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { message } = req.body;

    const feedback = await Feedback.findByIdAndUpdate(feedbackId, { message }, { new: true });

    if (!feedback) {
      return res.status(404).json({ success: false, error: 'Feedback not found' });
    }

    res.json({ success: true, data: feedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.deleteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;

    const feedback = await Feedback.findByIdAndDelete(feedbackId);

    if (!feedback) {
      return res.status(404).json({ success: false, error: 'Feedback not found' });
    }

    res.json({ success: true, data: {} });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate('userId', 'phoneNumber');
    res.json({ success: true, data: feedbacks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
