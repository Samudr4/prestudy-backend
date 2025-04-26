/**
 * Clean Database Script
 * This will remove all test data from the database but keep the structure intact
 * Run with: node cleanDatabase.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const Category = require('./models/category.model');
const Quiz = require('./models/quiz.model');
const User = require('./models/user.model');
const QuizResult = require('./models/quizResult.model');
const Notification = require('./models/notification.model');
const Payment = require('./models/payment.model');
const Feedback = require('./models/feedback.model');
const Leaderboard = require('./models/leaderboard.model');

// Connect to the database
async function connectDB() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return false;
  }
}

// Clean all collections
async function cleanDatabase() {
  if (process.env.NODE_ENV !== 'development') {
    console.error('❌ This script should only be run in development environment');
    console.error('Set NODE_ENV=development in your .env file');
    return;
  }

  const connected = await connectDB();
  if (!connected) {
    console.error('❌ Cannot continue due to connection issues');
    process.exit(1);
  }

  try {
    console.log('Cleaning database...');
    
    // Get collection counts before cleaning
    const categoriesCount = await Category.countDocuments();
    const quizzesCount = await Quiz.countDocuments();
    const usersCount = await User.countDocuments();
    const quizResultsCount = await QuizResult.countDocuments();
    const notificationsCount = await Notification.countDocuments();
    const paymentsCount = await Payment.countDocuments();
    const feedbackCount = await Feedback.countDocuments();
    const leaderboardCount = await Leaderboard.countDocuments();
    
    console.log('\nCurrent data counts:');
    console.log(`- Categories: ${categoriesCount}`);
    console.log(`- Quizzes: ${quizzesCount}`);
    console.log(`- Users: ${usersCount}`);
    console.log(`- Quiz Results: ${quizResultsCount}`);
    console.log(`- Notifications: ${notificationsCount}`);
    console.log(`- Payments: ${paymentsCount}`);
    console.log(`- Feedback: ${feedbackCount}`);
    console.log(`- Leaderboard: ${leaderboardCount}`);
    
    // Ask for confirmation before proceeding
    console.log('\n⚠️ WARNING: This will delete ALL data from the database!');
    console.log('Press Ctrl+C to cancel or wait 5 seconds to continue...');
    
    // Wait 5 seconds before proceeding
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Clean all collections
    await Category.deleteMany({});
    await Quiz.deleteMany({});
    await User.deleteMany({});
    await QuizResult.deleteMany({});
    await Notification.deleteMany({});
    await Payment.deleteMany({});
    await Feedback.deleteMany({});
    await Leaderboard.deleteMany({});
    
    console.log('\n✅ All test data has been removed from the database');
    console.log('Database is now clean and ready for production data');
    
    console.log('\n=== NEXT STEPS ===');
    console.log('1. Start the backend server:');
    console.log('   npm run dev');
    console.log('\n2. Start the frontend app:');
    console.log('   cd ../app_v1.2 && npm start');
    console.log('\n3. Add real data using Postman following the README.md instructions');

  } catch (error) {
    console.error('❌ Error cleaning database:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
cleanDatabase(); 