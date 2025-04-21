// controllers/notification.controller.js
const Notification = require('../models/notification.model');

exports.createNotification = async (req, res) => {
  try {
    const { userId, title, body } = req.body;
    const notification = await Notification.create({ userId, title, body });
    // Optionally, push notification via Firebase Admin
    res.json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({userId});
    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.updateNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const updatedData = req.body;

    const notification = await Notification.findByIdAndUpdate(notificationId, updatedData, { new: true });
    if(!notification){
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }
    res.json({ success: true, data: notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndDelete(notificationId);
    if(!notification){
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }


    res.json({ success: true, message: 'Notification deleted' });


  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
