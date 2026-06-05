require('dotenv').config();
const mongoose = require('mongoose');
const Invoice = require('./src/models/Invoice');
const ExtractedData = require('./src/models/ExtractedData');

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI).then(async () => {
  try {
    const rejectedInvoices = await Invoice.find({ status: 'REJECTED' });
    console.log(`Found ${rejectedInvoices.length} rejected invoices.`);
    
    if (rejectedInvoices.length > 0) {
      console.log('Sample invoice:', rejectedInvoices[0]);
      
      const extracted = await ExtractedData.findOne({ invoiceId: rejectedInvoices[0]._id });
      if (extracted) {
        console.log('Extracted data exists for this invoice.');
      } else {
        console.log('NO Extracted data for this invoice!');
      }
    }
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
});
