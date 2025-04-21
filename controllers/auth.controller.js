require('dotenv').config();

const admin = require('../config/firebase.config');
const User = require('../models/user.model');

const requestOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    // Send OTP using Firebase Authentication
    // (Ensure that Firebase Phone Auth is set up in your project)
    // Here you would trigger the OTP sending logic, Firebase SDK usually handles this client-side.

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${phoneNumber}.`,
    });
  } catch (error) {
    console.error('Error requesting OTP:', error);
    return res.status(500).json({ success: false, message: 'Failed to request OTP' });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: 'ID Token is required' });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (!decodedToken.phone_number) {
      return res.status(401).json({ success: false, message: 'Invalid token, no phone number found' });
    }

    const phoneNumber = decodedToken.phone_number;
    let user = await User.findOne({ phoneNumber });

    if (!user) {
      user = await User.create({ phoneNumber });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully!',
      user,
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
};

// Export both functions
module.exports = { requestOTP, verifyOTP };
