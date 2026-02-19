import mongoose from 'mongoose';

let cachedConn: any = null;

export const connectDB = async () => {
  try {
    if (cachedConn && cachedConn.connection.readyState === 1) {
      return cachedConn;
    }

    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp',
      {
        maxPoolSize: 10,
        minPoolSize: 1,
        maxIdleTimeMS: 45000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    );

    cachedConn = conn;
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error: any) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
};
