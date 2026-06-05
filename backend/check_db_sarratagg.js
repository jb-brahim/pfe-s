require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI).then(async () => {
  try {
    const user = await User.findOne({ email: 'sarratagg@gmail.com' });
    console.log(user._id, user.telegramId);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
});
