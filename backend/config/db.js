import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    // Use MONGO_URI from .env (you have MONGO_URI not MONGODB_URI)
    const mongoURI = process.env.MONGO_URI;
    
    console.log("🔧 Database Configuration:");
    console.log("   MONGO_URI:", mongoURI ? "✓ Loaded" : "✗ Missing");
    
    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    console.log("🔗 Connecting to MongoDB...");
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('💡 Make sure:');
    console.log('   1. Your MongoDB Atlas cluster is running');
    console.log('   2. Your IP is whitelisted in MongoDB Atlas');
    console.log('   3. Your username/password are correct');
    process.exit(1);
  }
};

export default connectDB;