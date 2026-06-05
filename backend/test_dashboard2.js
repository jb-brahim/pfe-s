const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('http://localhost:5000/api/analytics/dashboard', {
      headers: {
        'x-api-key': 'n8n-secret-api-key-123',
        'x-telegram-id': '9999999999' // Fake ID
      }
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
test();
