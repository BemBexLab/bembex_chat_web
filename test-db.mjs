import mongoose from 'mongoose';
import Chat from './app/api/models/Chat.js';
import User from './app/api/models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app';

async function checkDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✓ Connected to MongoDB');
    
    const chatCount = await Chat.countDocuments();
    console.log(`Chat documents: ${chatCount}`);
    
    if (chatCount > 0) {
      const chats = await Chat.find().limit(3).lean();
      console.log('Sample chats:', JSON.stringify(chats, null, 2));
    }
    
    const userCount = await User.countDocuments();
    console.log(`\nUser documents: ${userCount}`);
    
    if (userCount > 0) {
      const users = await User.find().select('email username').limit(2).lean();
      console.log('Sample users:', JSON.stringify(users, null, 2));
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkDB();
