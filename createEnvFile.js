/**
 * This script checks for required environment variables and creates a .env file if needed
 * Run with: node createEnvFile.js
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const requiredEnvVars = [
  'MONGODB_URI',
  'FIREBASE_SERVICE_ACCOUNT',
  'FIREBASE_PROJECT_ID',
  'NODE_ENV'
];

// Check if .env file exists
const envFilePath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envFilePath);

// Function to generate a random string
function generateRandomString(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Create mock Firebase service account for development
function createMockFirebaseServiceAccount() {
  return {
    type: 'service_account',
    project_id: 'prestudy-app',
    private_key_id: generateRandomString(16),
    private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDDnM8JvA+XmLjD\nDummykey\n-----END PRIVATE KEY-----\n',
    client_email: 'firebase-adminsdk@prestudy-app.iam.gserviceaccount.com',
    client_id: generateRandomString(20),
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk%40prestudy-app.iam.gserviceaccount.com`
  };
}

// Default values for development
const defaultEnvValues = {
  NODE_ENV: 'development',
  MONGODB_URI: 'mongodb://localhost:27017/prestudy',
  PORT: '3000',
  FIREBASE_PROJECT_ID: 'prestudy-app',
  // Generate a dummy Firebase service account for development
  FIREBASE_SERVICE_ACCOUNT: JSON.stringify(createMockFirebaseServiceAccount()),
  JWT_SECRET: generateRandomString()
};

function createEnvFile() {
  console.log('Creating .env file for development...');
  
  let envContent = '';
  
  // Add each environment variable to the content
  Object.entries(defaultEnvValues).forEach(([key, value]) => {
    if (typeof value === 'string' && value.includes('\n')) {
      // For multiline values like JSON
      envContent += `${key}='${value}'\n`;
    } else {
      envContent += `${key}=${value}\n`;
    }
  });
  
  // Write the .env file
  fs.writeFileSync(envFilePath, envContent);
  console.log('✅ Created .env file with default development values');
  console.log(`📁 File location: ${envFilePath}`);
  
  console.log('\n⚠️ Warning: This .env file is for development purposes only.');
  console.log('⚠️ For production, replace these values with actual credentials.');
  
  // Also create a config directory if it doesn't exist
  const configDir = path.join(__dirname, 'config');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir);
    console.log('✅ Created config directory');
  }
  
  // Create necessary config files
  createConfigFiles();
  
  return true;
}

function createConfigFiles() {
  const configDir = path.join(__dirname, 'config');
  
  // Create db.config.js if it doesn't exist
  const dbConfigPath = path.join(configDir, 'db.config.js');
  if (!fs.existsSync(dbConfigPath)) {
    const dbConfigContent = `// config/db.config.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Database Connected: " + conn.connection.host);
    return conn;
  } catch (error) {
    console.error("❌ Error connecting to database:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
`;
    fs.writeFileSync(dbConfigPath, dbConfigContent);
    console.log('✅ Created db.config.js');
  }
  
  // Create firebase.config.js if it doesn't exist
  const firebaseConfigPath = path.join(configDir, 'firebase.config.js');
  if (!fs.existsSync(firebaseConfigPath)) {
    const firebaseConfigContent = `// config/firebase.config.js
const admin = require('firebase-admin');

// Initialize Firebase
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Parse the service account from environment variable
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    
    console.log('Firebase Admin SDK initialized successfully');
  } else {
    console.warn('Firebase service account not provided. Firebase auth will not work.');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // In development, we'll continue even without Firebase
  if (process.env.NODE_ENV === 'production') {
    throw error;
  }
}

module.exports = admin;
`;
    fs.writeFileSync(firebaseConfigPath, firebaseConfigContent);
    console.log('✅ Created firebase.config.js');
  }
}

function checkEnvVariables() {
  console.log('Checking environment variables...');
  
  if (!envExists) {
    console.log('❌ .env file not found');
    return createEnvFile();
  }
  
  // Read existing .env file
  const envContent = fs.readFileSync(envFilePath, 'utf8');
  const existingVars = {};
  
  // Parse .env file
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      existingVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  // Check if all required variables are present
  const missingVars = requiredEnvVars.filter(varName => !existingVars[varName]);
  
  if (missingVars.length > 0) {
    console.log(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    return createEnvFile();
  }
  
  // Check for config directory and create it if needed
  const configDir = path.join(__dirname, 'config');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir);
    console.log('✅ Created config directory');
    createConfigFiles();
  } else {
    // Check for required config files
    const dbConfigPath = path.join(configDir, 'db.config.js');
    const firebaseConfigPath = path.join(configDir, 'firebase.config.js');
    
    if (!fs.existsSync(dbConfigPath) || !fs.existsSync(firebaseConfigPath)) {
      createConfigFiles();
    }
  }
  
  console.log('✅ All required environment variables are present');
  return true;
}

// Run the check
const result = checkEnvVariables();

// Instructions for next steps
if (result) {
  console.log('\n=== NEXT STEPS ===');
  console.log('1. Start the backend server:');
  console.log('   npm run dev');
  console.log('\n2. Initialize the database with test data:');
  console.log('   node createTestData.js');
  console.log('\n3. Start the frontend app:');
  console.log('   cd ../app_v1.2 && npm start');
}

module.exports = {
  checkEnvVariables,
  createEnvFile
}; 