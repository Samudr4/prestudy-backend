const express = require('express');
const router = express.Router();
const { requestOTP, verifyOTP } = require('../controllers/auth.controller');

// Route to request OTP
router.post('/request-otp', requestOTP);

// Route to verify OTP
router.post('/verify-otp', verifyOTP);

module.exports = router;
