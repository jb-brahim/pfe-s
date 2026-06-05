require('dotenv').config();
const mongoose = require('mongoose');
const Invoice = require('./src/models/Invoice');
const ExtractedData = require('./src/models/ExtractedData');

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI).then(async () => {
  try {
    const invoices = await Invoice.find({});
    const extData = await ExtractedData.find({});
    console.log(`Found ${invoices.length} invoices`);
    if (extData.length > 0) {
      console.log('Sample extracted data company:', extData[0].companyName);
      console.log('Sample companies:', extData.map(e => e.companyName).slice(0, 5));
    }
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
});
