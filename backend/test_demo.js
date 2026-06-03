const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testDemoExtract() {
  try {
    const formData = new FormData();
    // create a dummy text file to act as the invoice
    fs.writeFileSync('dummy.jpg', 'dummy content');
    formData.append('invoiceFile', fs.createReadStream('dummy.jpg'));
    
    console.log('Sending request...');
    const res = await axios.post('http://localhost:5000/api/invoices/demo-extract', formData, {
      headers: formData.getHeaders()
    });
    console.log('Response:', res.data);
  } catch (err) {
    console.error('Error Response:', err.response ? err.response.data : err.message);
  }
}

testDemoExtract();
