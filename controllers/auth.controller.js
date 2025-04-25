require('dotenv').config();

const admin = require('../config/firebase');
const User = require('../models/user.model');
const isDevelopment = process.env.NODE_ENV !== 'production';

// Helper function to verify Firebase token
const verifyFirebaseToken = async (token) => {
  try {
    // Check if Firebase Auth is properly initialized
    if (admin.auth && typeof admin.auth === 'function') {
      return await admin.auth().verifyIdToken(token);
    }
    throw new Error('Firebase auth not initialized');
  } catch (error) {
    console.error('Firebase verification error:', error);
    if (isDevelopment) {
      // For development, return a mock decoded token
      return { phone_number: '+919876543210' };
    }
    throw error;
  }
};

const requestOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    // In development mode, just acknowledge the OTP request
    if (isDevelopment) {
      console.log(`DEVELOPMENT MODE: OTP request for ${phoneNumber}`);
      return res.status(200).json({
        success: true,
        message: `DEVELOPMENT MODE: OTP sent successfully to ${phoneNumber}.`,
      });
    }

    // For production, you would trigger the OTP sending logic via Firebase Phone Auth
    // This is typically handled client-side in React Native using Firebase SDK

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
    const { idToken, phoneNumber } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: 'ID Token is required' });
    }

    // In a real implementation, you would verify with Firebase
    // For demo, we'll accept the token and create/find the user
    let user;
    let decodedPhoneNumber;
    
    try {
      // Try to verify with Firebase
      const decodedToken = await verifyFirebaseToken(idToken);
      decodedPhoneNumber = decodedToken.phone_number;
    } catch (firebaseError) {
      // If Firebase verification fails in development, use provided phone number
      if (isDevelopment && phoneNumber) {
        decodedPhoneNumber = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`;
        console.log(`DEVELOPMENT MODE: Using provided phone number ${decodedPhoneNumber}`);
      } else {
        return res.status(401).json({ success: false, message: 'Invalid token or missing phone number' });
      }
    }

    // Find or create user
    user = await User.findOne({ phoneNumber: decodedPhoneNumber });
    
    if (!user) {
      user = await User.create({ phoneNumber: decodedPhoneNumber });
      console.log(`Created new user with phone ${decodedPhoneNumber}`);
    }

    // Generate a JWT token for subsequent authenticated requests
    // In a real app, you would sign with a proper secret
    const token = isDevelopment ? `dev-token-${Date.now()}` : idToken;

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully!',
      user,
      token
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    // Verify the Firebase token or check for development mode
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    let phoneNumber;

    try {
      // Try to verify with Firebase
      const decodedToken = await verifyFirebaseToken(token);
      phoneNumber = decodedToken.phone_number;
    } catch (error) {
      // In development mode, try to extract phone from user token in AsyncStorage
      if (isDevelopment) {
        // Get the phone from request query or use a default for development
        phoneNumber = req.query.phone || '+919876543210';
        console.log(`DEVELOPMENT MODE: Using phone ${phoneNumber} for profile lookup`);
      } else {
        throw error;
      }
    }

    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Format the user data to match the front-end expectations
    const userData = {
      _id: user._id,
      phoneNumber: user.phoneNumber,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      gender: user.gender || '',
      dateOfBirth: user.dateOfBirth || ''
    };

    return res.status(200).json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve user profile' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    // Verify the Firebase token or check for development mode
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    let phoneNumber;

    try {
      // Try to verify with Firebase
      const decodedToken = await verifyFirebaseToken(token);
      phoneNumber = decodedToken.phone_number;
    } catch (error) {
      // In development mode, try to extract phone from user token in AsyncStorage
      if (isDevelopment) {
        // Get the phone from request query or body
        phoneNumber = req.query.phone || req.body.phoneNumber || '+919876543210';
        console.log(`DEVELOPMENT MODE: Using phone ${phoneNumber} for profile update`);
      } else {
        throw error;
      }
    }

    const { firstName, lastName, email, gender, dateOfBirth } = req.body;

    // Update the user in the database
    const updatedUser = await User.findOneAndUpdate(
      { phoneNumber },
      { 
        firstName, 
        lastName, 
        email, 
        gender, 
        dateOfBirth 
      },
      { new: true, runValidators: true, upsert: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Format the user data to match the front-end expectations
    const userData = {
      _id: updatedUser._id,
      phoneNumber: updatedUser.phoneNumber,
      firstName: updatedUser.firstName || '',
      lastName: updatedUser.lastName || '',
      email: updatedUser.email || '',
      gender: updatedUser.gender || '',
      dateOfBirth: updatedUser.dateOfBirth || ''
    };

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: userData
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user profile' });
  }
};

/**
 * Create a test user (DEVELOPMENT ONLY)
 * DELETE THIS FUNCTION BEFORE PRODUCTION
 */
const createTestUser = async (req, res) => {
  try {
    if (!isDevelopment) {
      return res.status(403).json({ success: false, message: 'This endpoint is only available in development mode' });
    }

    const { phoneNumber, firstName, lastName, email, gender, dateOfBirth } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    // Format phone with country code if not provided
    const formattedPhone = phoneNumber.startsWith("+") 
      ? phoneNumber 
      : `+91${phoneNumber}`;

    // Check if user already exists
    let user = await User.findOne({ phoneNumber: formattedPhone });
    
    if (user) {
      // Update existing user
      user = await User.findOneAndUpdate(
        { phoneNumber: formattedPhone },
        { 
          firstName: firstName || user.firstName, 
          lastName: lastName || user.lastName, 
          email: email || user.email,
          gender: gender || user.gender,
          dateOfBirth: dateOfBirth || user.dateOfBirth
        },
        { new: true }
      );
    } else {
      // Create new user
      user = await User.create({ 
        phoneNumber: formattedPhone,
        firstName: firstName || '',
        lastName: lastName || '',
        email: email || '',
        gender: gender || '',
        dateOfBirth: dateOfBirth || ''
      });
    }

    // Create a demo token
    const demoToken = "demo-token-for-testing-" + Date.now();

    return res.status(200).json({
      success: true,
      message: 'Test user created/updated successfully',
      user,
      token: demoToken
    });
  } catch (error) {
    console.error('Error creating test user:', error);
    return res.status(500).json({ success: false, message: 'Failed to create test user' });
  }
};

// Export functions
module.exports = { requestOTP, verifyOTP, getUserProfile, updateUserProfile, createTestUser };
