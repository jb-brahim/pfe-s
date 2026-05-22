const mongoose = require('mongoose');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const users = await mongoose.connection.db.collection('users').find().toArray();
  const newUser = users[users.length - 1];
  
  console.log('NEW USER:', newUser._id, 'role:', newUser.role, 'managedBy:', newUser.managedBy);
  
  const rootAdminId = newUser.managedBy || newUser._id;
  console.log('rootAdminId:', rootAdminId);
  
  const teamUsers = await mongoose.connection.db.collection('users').find({
    $or: [{ _id: rootAdminId }, { managedBy: rootAdminId }]
  }).toArray();
  
  console.log('TEAM USERS:', teamUsers.map(u => u._id));
  
  const teamUserIds = teamUsers.map(u => u._id);
  const invoices = await mongoose.connection.db.collection('invoices').find({
    userId: { $in: teamUserIds }
  }).toArray();
  
  console.log('INVOICES FOR TEAM:', invoices.length);
  process.exit(0);
}

test();
