require('dotenv').config();
const mongoose = require('mongoose');
const Budget = require('./src/models/Budget');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  
  try {
    const rootAdminId = new mongoose.Types.ObjectId(); // fake id
    const year = 2026;
    const month = 5;
    const monthlyLimit = 15000;
    const alertThreshold = 80;

    console.log('Dropping old index...');
    try {
      await Budget.collection.dropIndex('year_1_month_1');
      console.log('Old index dropped');
    } catch (e) {
      console.log('Index drop failed or index does not exist:', e.message);
    }
    
    console.log('Syncing new indexes...');
    await Budget.syncIndexes();
    console.log('Indexes synced');

    console.log('Trying to upsert...');
    const budget = await Budget.findOneAndUpdate(
      { year, month, createdBy: rootAdminId },
      { monthlyLimit, alertThreshold },
      { upsert: true, new: true }
    );
    console.log('Success:', budget);
  } catch (error) {
    console.error('Error occurred:', error.message, error.stack);
  } finally {
    mongoose.disconnect();
  }
}

test();
