const mongoose = require('mongoose');
require('dotenv').config();

async function test() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to DB');

    require('../src/models/User');
    const User = mongoose.model('User');

    console.log('Fetching all users...');
    const users = await User.find({}).select('name email role');
    console.log('Users:', users);

  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB');
  }
}

test();
