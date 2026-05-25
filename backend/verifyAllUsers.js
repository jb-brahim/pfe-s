require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const result = await User.updateMany({}, { isEmailVerified: true });
    console.log(`Updated ${result.modifiedCount} users to be email verified.`);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB', err);
    process.exit(1);
  });
