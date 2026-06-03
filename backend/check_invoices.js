const mongoose = require('mongoose');
const Invoice = require('./src/models/Invoice');
const ExtractedData = require('./src/models/ExtractedData');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aura-finance', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const invoiceCount = await Invoice.countDocuments();
  const extractedCount = await ExtractedData.countDocuments();
  console.log('Total invoices:', invoiceCount);
  console.log('Total extracted data:', extractedCount);
  
  const statuses = await Invoice.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  console.log('Invoice statuses:', statuses);
  
  process.exit(0);
});
