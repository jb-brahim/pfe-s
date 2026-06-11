require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI).then(async () => {
  try {
    const result = await User.updateMany(
      { 'billing.plan': 'Basic' },
      { $set: { 'billing.aiScansUsed': 15, 'billing.aiScansLimit': 15 } }
    );
    console.log(`Successfully updated ${result.modifiedCount} user(s) to 15/15 scans.`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
});
