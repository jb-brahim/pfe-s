require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI).then(async () => {
  try {
    const users = await User.find();
    console.log('All Users:');
    users.forEach(u => console.log(`ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, ManagedBy: ${u.managedBy}`));
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
});
