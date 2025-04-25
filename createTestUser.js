/**
 * Test script to create a test user
 * Run with: node createTestUser.js
 */
const fetch = require('node-fetch');
require('dotenv').config();

// Configuration
const PORT = process.env.PORT || 3000;
const API_URL = `http://localhost:${PORT}/api`; 

// Test user data
const TEST_USER = {
  phoneNumber: '9876543210',  // Will be formatted with +91 prefix if missing
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  gender: 'male',
  dateOfBirth: '1990-01-01'
};

async function createTestUser() {
  try {
    console.log('Creating test user...');
    console.log(`Using API URL: ${API_URL}`);
    
    // First check if the server is running
    try {
      await fetch(`${API_URL}`);
    } catch (connectionError) {
      console.error('❌ Server connection error!');
      console.error('Make sure your backend server is running with:');
      console.error('cd prestudy-backend && npm start');
      process.exit(1);
    }
    
    const response = await fetch(`${API_URL}/auth/dev/create-test-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_USER),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.success) {
      console.log('\n✅ Test user created successfully!');
      console.log('\nUser details:');
      console.log(`Phone: ${data.user.phoneNumber}`);
      console.log(`Name: ${data.user.firstName} ${data.user.lastName}`);
      console.log(`Email: ${data.user.email}`);
      console.log('\nTest token:');
      console.log(data.token);
      
      console.log('\n----------------------------------------------');
      console.log('HOW TO TEST THE APP:');
      console.log('----------------------------------------------');
      console.log('1. Start the React Native app:');
      console.log('   cd app_v1.2 && npm start');
      console.log('\n2. Login with the phone number:', TEST_USER.phoneNumber);
      console.log('3. Enter any 6 digits as OTP');
      console.log('4. The app will proceed in development mode');
      console.log('5. Navigate to the Profile tab to see and edit user data');
      console.log('----------------------------------------------');
    } else {
      console.error('❌ Failed to create test user:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nMake sure:');
    console.log('1. Your backend server is running at:', API_URL);
    console.log('2. NODE_ENV is set to "development" in your .env file');
    console.log('3. The create-test-user endpoint is properly defined in routes');
  }
}

createTestUser(); 