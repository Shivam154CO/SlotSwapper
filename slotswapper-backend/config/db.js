import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    console.log(`[DB] Database Configuration:`);
    console.log("   MONGO_URI:", mongoURI ? "[OK]" : "[MISSING]");
    
    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    console.log("Connecting to MongoDB...");
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`[CONNECTED] MongoDB Connected: ${conn.connection.host}`);
    console.log(`[DATABASE] Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error("[ERROR] MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;