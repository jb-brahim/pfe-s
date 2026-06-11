require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI).then(async () => {
  try {
    const users = await User.find();
    let updated = 0;
    for (let user of users) {
      let needsUpdate = false;
      if (user.billing.plan === 'Pro' && user.billing.aiScansLimit !== 5000) {
        user.billing.aiScansLimit = 5000;
        needsUpdate = true;
      }
      if (user.billing.plan === 'Basic' && user.billing.aiScansLimit !== 15) {
        user.billing.aiScansLimit = 15;
        needsUpdate = true;
      }
      if (user.billing.plan === 'Premium' && user.billing.aiScansLimit !== 999999) {
        user.billing.aiScansLimit = 999999;
        needsUpdate = true;
      }
      if (needsUpdate) {
        await user.save();
        updated++;
      }
    }
    console.log(`Updated ${updated} users.`);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
});
