const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    
    // Check if MongoDB URI is properly set
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set");
    }
    
    // Connect with better options for reliability
    await mongoose.connect(process.env.MONGODB_URI, {
      // The connection options are automatically set in newer mongoose versions
    });
    
    // Add event listeners for connection issues
    mongoose.connection.on('error', err => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
    return mongoose.connection;
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    // Don't exit the process here, let the calling code decide
    throw err;
  }
};

module.exports = connectDB;
