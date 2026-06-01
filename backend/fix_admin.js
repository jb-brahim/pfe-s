const mongoose = require('mongoose');

const uri = 'mongodb+srv://sarahpfe:sarahpfe@cluster0.yt1j3z6.mongodb.net/?appName=Cluster0';

async function fixUser() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  await db.collection('users').updateOne(
    { email: 'superadmin@admin.com' },
    { $set: { isEmailVerified: true } }
  );
  console.log('Fixed super admin isEmailVerified');
  await mongoose.disconnect();
}

fixUser();
