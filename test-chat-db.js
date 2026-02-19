const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app';

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000,
}).then(async () => {
  console.log('✓ Connected to MongoDB');
  
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));
  
  const chatsCollection = db.collection('chats');
  const count = await chatsCollection.countDocuments();
  console.log(`\n✓ Chat documents in DB: ${count}`);
  
  if (count > 0) {
    const sample = await chatsCollection.findOne();
    console.log('\nSample chat:', JSON.stringify(sample, null, 2));
  }
  
  const users = db.collection('users');
  const userCount = await users.countDocuments();
  console.log(`\n✓ User documents in DB: ${userCount}`);
  
  if (userCount > 0) {
    const sampleUser = await users.findOne();
    console.log('\nSample user:', JSON.stringify(sampleUser, null, 2));
  }
  
  mongoose.connection.close();
  process.exit(0);
}).catch(err => {
  console.error('✗ Connection error:', err.message);
  process.exit(1);
});
