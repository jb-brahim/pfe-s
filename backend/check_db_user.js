require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI).then(async () => {
  try {
    const user = await User.findById('6a1f465055d56577ec27e3f8');
    console.log('User telegramId:', user ? user.telegramId : 'User not found');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
});
