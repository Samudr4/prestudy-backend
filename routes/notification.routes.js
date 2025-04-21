const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

// Create a new notification
router.post('/', notificationController.createNotification);

// Get all notifications for a user
router.get('/user/:userId', notificationController.getAllNotifications);

// Update a notification
router.put('/:notificationId', notificationController.updateNotification);

// Delete a notification
router.delete('/:notificationId', notificationController.deleteNotification);
module.exports = router;
