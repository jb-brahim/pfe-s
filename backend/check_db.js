const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = 'mongodb+srv://sarahpfe:sarahpfe@cluster0.yt1j3z6.mongodb.net/?appName=Cluster0';

async function checkUser() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ email: 'superadmin@admin.com' });
  
  if (!user) {
    console.log('User not found in DB!');
  } else {
    console.log('User found:', user.email);
    console.log('Password hash:', user.passwordHash);
    const isMatch = await bcrypt.compare('SuperSecretPassword123!', user.passwordHash);
    console.log('Password matches?', isMatch);
    console.log('isEmailVerified?', user.isEmailVerified);
  }
  await mongoose.disconnect();
}

checkUser();
