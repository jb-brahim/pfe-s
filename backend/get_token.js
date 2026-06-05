require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI).then(async () => {
  try {
    const user = await User.findOne({ email: 'sarratagg@gmail.com' });
    if (user) {
      if (user.telegramLinkToken) {
        console.log('--- SUCCESS ---');
        console.log(`Link: https://t.me/sarrapfebot?start=${user.telegramLinkToken}`);
      } else {
        console.log('User found, but telegramLinkToken is currently null. They need to click the Request button.');
      }
    } else {
      console.log('User with email sarratagg@gmail.com not found.');
    }
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
});
