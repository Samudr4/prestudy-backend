/**
 * Test script to create sample data for the application
 * This will add categories, quizzes, and a test user
 * Run with: node createTestData.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const fetch = require('node-fetch');

// Import models
const Category = require('./models/category.model');
const Quiz = require('./models/quiz.model');
const User = require('./models/user.model');

// Configuration
const PORT = process.env.PORT || 3000;
const API_URL = `http://localhost:${PORT}/api`;

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

// Check if server is running
async function checkServer() {
  try {
    console.log(`Checking if server is running at ${API_URL}...`);
    const response = await fetch(`${API_URL}`);
    if (response.ok) {
      console.log('✅ Server is running');
      return true;
    } else {
      console.error(`❌ Server returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Server is not running or not accessible');
    console.error('Start the server with: npm run dev');
    return false;
  }
}

// Sample course categories
const courseCategories = [
  {
    name: "Mathematics",
    type: "course",
    description: "Learn mathematics concepts from basic to advanced",
    image: "https://example.com/math.jpg",
    order: 1,
    isActive: true
  },
  {
    name: "Science",
    type: "course",
    description: "Physics, Chemistry, and Biology concepts",
    image: "https://example.com/science.jpg",
    order: 2,
    isActive: true
  },
  {
    name: "English",
    type: "course",
    description: "Grammar, vocabulary, and language skills",
    image: "https://example.com/english.jpg",
    order: 3,
    isActive: true
  }
];

// Sample exam categories
const examCategories = [
  {
    name: "ADRE Exam",
    type: "exam",
    description: "Assam Direct Recruitment Examination preparation",
    image: "https://example.com/adre.jpg",
    order: 1,
    isActive: true
  },
  {
    name: "Banking Exams",
    type: "exam",
    description: "Prepare for IBPS, SBI, and other banking entrance exams",
    image: "https://example.com/banking.jpg",
    order: 2,
    isActive: true
  },
  {
    name: "Civil Services",
    type: "exam",
    description: "UPSC and state civil services exam preparation",
    image: "https://example.com/civil.jpg",
    order: 3,
    isActive: true
  }
];

// Sample quiz data
function createSampleQuiz(categoryId, name, index) {
  return {
    name: name,
    description: `Test your knowledge on ${name} concepts`,
    duration: 30,
    totalQuestions: 5,
    categoryId: categoryId,
    questions: [
      {
        text: `Sample question 1 for ${name}?`,
        options: [
          { id: "A", text: "Option A" },
          { id: "B", text: "Option B" },
          { id: "C", text: "Option C" },
          { id: "D", text: "Option D" }
        ],
        correctOptionId: "A",
        explanation: "This is the explanation for the correct answer A",
        difficulty: "medium",
        order: 1
      },
      {
        text: `Sample question 2 for ${name}?`,
        options: [
          { id: "A", text: "Option A" },
          { id: "B", text: "Option B" },
          { id: "C", text: "Option C" },
          { id: "D", text: "Option D" }
        ],
        correctOptionId: "B",
        explanation: "This is the explanation for the correct answer B",
        difficulty: "easy",
        order: 2
      },
      {
        text: `Sample question 3 for ${name}?`,
        options: [
          { id: "A", text: "Option A" },
          { id: "B", text: "Option B" },
          { id: "C", text: "Option C" },
          { id: "D", text: "Option D" }
        ],
        correctOptionId: "C",
        explanation: "This is the explanation for the correct answer C",
        difficulty: "hard",
        order: 3
      },
      {
        text: `Sample question 4 for ${name}?`,
        options: [
          { id: "A", text: "Option A" },
          { id: "B", text: "Option B" },
          { id: "C", text: "Option C" },
          { id: "D", text: "Option D" }
        ],
        correctOptionId: "D",
        explanation: "This is the explanation for the correct answer D",
        difficulty: "medium",
        order: 4
      },
      {
        text: `Sample question 5 for ${name}?`,
        options: [
          { id: "A", text: "Option A" },
          { id: "B", text: "Option B" },
          { id: "C", text: "Option C" },
          { id: "D", text: "Option D" }
        ],
        correctOptionId: "A",
        explanation: "This is the explanation for the correct answer A",
        difficulty: "easy",
        order: 5
      }
    ],
    price: (index % 3 === 0) ? 0 : 99, // Make every third quiz free
    isLocked: (index % 3 === 0) ? false : true,
    isActive: true,
    tags: ["sample", "test", name.toLowerCase()],
    rating: 4.5
  };
}

// Create a test user
const testUser = {
  phoneNumber: "9876543210",
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
  gender: "male",
  dateOfBirth: "1990-01-01"
};

// Reset and create data
async function resetAndCreateData() {
  if (process.env.NODE_ENV !== 'development') {
    console.error('❌ This script should only be run in development environment');
    console.error('Set NODE_ENV=development in your .env file');
    return;
  }

  const dbConnected = await connectDB();
  const serverRunning = await checkServer();

  if (!dbConnected || !serverRunning) {
    console.error('❌ Cannot continue due to connection issues');
    process.exit(1);
  }

  try {
    // Clean existing data
    console.log('Cleaning existing data...');
    await Category.deleteMany({});
    await Quiz.deleteMany({});
    await User.deleteMany({ phoneNumber: testUser.phoneNumber });
    console.log('✅ Existing data cleaned');

    // Create categories
    console.log('Creating course categories...');
    const createdCourseCategories = await Category.insertMany(courseCategories);
    console.log(`✅ Created ${createdCourseCategories.length} course categories`);

    console.log('Creating exam categories...');
    const createdExamCategories = await Category.insertMany(examCategories);
    console.log(`✅ Created ${createdExamCategories.length} exam categories`);

    // Create quizzes for each category
    console.log('Creating quizzes...');
    let quizCount = 0;

    // For course categories
    for (const category of createdCourseCategories) {
      const quizzes = [];
      for (let i = 1; i <= 3; i++) {
        quizzes.push(createSampleQuiz(category._id, `${category.name} Quiz ${i}`, i));
      }
      await Quiz.insertMany(quizzes);
      quizCount += quizzes.length;
    }

    // For exam categories
    for (const category of createdExamCategories) {
      const quizzes = [];
      for (let i = 1; i <= 3; i++) {
        quizzes.push(createSampleQuiz(category._id, `${category.name} Quiz ${i}`, i));
      }
      await Quiz.insertMany(quizzes);
      quizCount += quizzes.length;
    }

    console.log(`✅ Created ${quizCount} quizzes`);

    // Create test user
    console.log('Creating test user...');
    const createdUser = await User.create(testUser);
    console.log('✅ Created test user');

    // Generate a simple token for testing
    console.log('\n=== TEST APP CREDENTIALS ===');
    console.log(`Phone: ${testUser.phoneNumber}`);
    console.log('Use any 6 digits as OTP for login in development mode');
    console.log('==========================\n');

    console.log('✅ All test data created successfully!');
    console.log('\nYou can now start the app with:');
    console.log('cd app_v1.2 && npm start');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
resetAndCreateData(); 