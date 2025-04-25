// server.js

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// Import configuration and initialization files
const connectDB = require("./config/db.config");
const admin = require("./config/firebase.config"); // Initialize Firebase once

// Import routes
const authRoutes = require("./routes/auth.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const leaderboardRoutes = require("./routes/leaderboard.routes");
const notificationRoutes = require("./routes/notification.routes");
const paymentRoutes = require("./routes/payment.routes");
const categoryRoutes = require("./routes/category.routes");

const app = express();

// Check for required environment variables
const requiredEnvVars = ['MONGODB_URI', 'FIREBASE_SERVICE_ACCOUNT', 'FIREBASE_PROJECT_ID'];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

// Middleware
app.use(
    cors({
        origin: "http://localhost:8081", // Replace with your frontend's Expo development URL
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);
app.use(morgan('dev'));
app.use(express.json()); // Parses JSON bodies
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded bodies

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/category', categoryRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("Pre-Study App Backend is Running!");
});

// API root endpoint for health check
app.get("/api", (req, res) => {
  res.json({ 
    success: true, 
    message: "API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'development'
  });
});

// List all registered endpoints for debugging
const listEndpoints = require('express-list-endpoints');
console.log('Registered Endpoints:', listEndpoints(app));

// Connect to the database
connectDB()
  .then(() => {
    console.log("✅ Database Connected");
    const PORT = process.env.PORT || 3000;
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
