require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI).then(async () => {
  try {
    const users = await User.find({ telegramId: { $ne: null } });
    console.log(`Found ${users.length} users with telegramId.`);
    users.forEach(u => console.log(u.email, u.telegramId));
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
});
