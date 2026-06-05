require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Invoice = require('./src/models/Invoice');

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI).then(async () => {
  try {
    const user = await User.findOne({ email: 'sarratagg@gmail.com' });
    console.log('User ID:', user._id);
    
    const invoices = await Invoice.find();
    let counts = {};
    invoices.forEach(i => {
      const uId = i.userId.toString();
      counts[uId] = (counts[uId] || 0) + 1;
    });
    console.log('Invoice counts by user ID:', counts);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
});
