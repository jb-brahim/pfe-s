const mongoose = require('mongoose');
require('dotenv').config();

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const users = await db.collection('users').find().toArray();
  const latestUser = users[users.length - 1];
  if (latestUser) {
    await db.collection('users').updateOne({ _id: latestUser._id }, { $set: { managedBy: null } });
    console.log('Fixed managedBy for latest user:', latestUser.email);
  }
  process.exit(0);
}

fix();
