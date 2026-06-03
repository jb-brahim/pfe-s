const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aura-finance', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const users = await User.find({});
  let ttnCount = 0;
  users.forEach(u => {
    if (u.integrations?.ttnAccountId || u.integrations?.ttnIntegrationKey) {
      ttnCount++;
      console.log('User has TTN:', u.email, u.integrations.ttnAccountId, u.integrations.ttnIntegrationKey);
    }
  });
  console.log('Total users with TTN:', ttnCount);
  
  process.exit(0);
});
