const axios = require('axios');

// Replace this with your actual API key from the Settings Page
const API_KEY = 'YOUR_API_KEY_HERE';
const BASE_URL = 'http://localhost:5000/api';

async function fetchMyInvoices() {
  try {
    console.log('Connecting to Aura Invoice AI...');
    
    // Pass the API key securely via headers
    const response = await axios.get(`${BASE_URL}/invoices`, {
      headers: { 
        'x-api-key': API_KEY 
      }
    });

    const invoices = response.data;
    console.log(`\n✅ Success! Retrieved ${invoices.length} invoices for your organization.`);

    if (invoices.length > 0) {
      console.log('================================================');
      console.log('📑 MOST RECENT INVOICE DETAILS');
      console.log('================================================');
      
      const latest = invoices[0];
      console.log(`Invoice ID:   ${latest._id}`);
      console.log(`Status:       ${latest.status}`);
      console.log(`Date Upload:  ${new Date(latest.createdAt).toLocaleString()}`);
      
      if (latest.extractedData) {
        console.log(`Company Name: ${latest.extractedData.companyName}`);
        console.log(`Invoice #:    ${latest.extractedData.invoiceNumber}`);
        console.log(`Total Amount: ${latest.extractedData.totalAmount} TND`);
        
        if (latest.extractedData.lineItems && latest.extractedData.lineItems.length > 0) {
          console.log('\n🛒 LINE ITEMS:');
          latest.extractedData.lineItems.forEach((item, index) => {
             console.log(`  ${index + 1}. ${item.description}`);
             console.log(`     Qty: ${item.quantity} | Unit Price: ${item.unitPrice} TND | Total: ${item.totalPrice} TND`);
          });
        }
      } else {
        console.log('\n(No AI extraction data available for this invoice yet)');
      }
      console.log('================================================\n');
    }
  } catch (error) {
    console.error('\n❌ API Error:');
    if (error.response) {
      console.error(`Status Code: ${error.response.status}`);
      console.error(`Message: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(error.message);
    }
  }
}

fetchMyInvoices();
