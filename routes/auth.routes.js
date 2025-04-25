const express = require('express');
const router = express.Router();
const { requestOTP, verifyOTP, getUserProfile, updateUserProfile, createTestUser } = require('../controllers/auth.controller');

// Route to request OTP
router.post('/request-otp', requestOTP);

// Route to verify OTP
router.post('/verify-otp', verifyOTP);

// Route to get user profile
router.get('/profile', getUserProfile);

// Route to update user profile
router.put('/profile', updateUserProfile);

// DEVELOPMENT ONLY: Route to create test users
// DELETE THIS ROUTE BEFORE PRODUCTION
router.post('/dev/create-test-user', createTestUser);

module.exports = router;
