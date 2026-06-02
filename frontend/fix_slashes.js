const fs = require('fs');

const filePath = 'lib/api.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Replace apiClient.post('/something') with apiClient.post('something')
// Do this for get, post, put, delete
content = content.replace(/apiClient\.get\('\//g, "apiClient.get('");
content = content.replace(/apiClient\.post\('\//g, "apiClient.post('");
content = content.replace(/apiClient\.put\('\//g, "apiClient.put('");
content = content.replace(/apiClient\.delete\('\//g, "apiClient.delete('");

// Same for double quotes or template literals if any exist inside api.ts (though usually single quotes)
content = content.replace(/apiClient\.get\(`\//g, "apiClient.get(`");
content = content.replace(/apiClient\.post\(`\//g, "apiClient.post(`");
content = content.replace(/apiClient\.put\(`\//g, "apiClient.put(`");
content = content.replace(/apiClient\.delete\(`\//g, "apiClient.delete(`");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed leading slashes in api.ts successfully!');
