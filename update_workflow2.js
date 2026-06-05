const fs = require('fs');
const path = 'c:/Users/brahi/OneDrive/Desktop/pfe sarah/My workflow 2.json';
const wf = JSON.parse(fs.readFileSync(path, 'utf8'));

wf.nodes.forEach(node => {
  // 1. Update Groq System Prompt to use TND
  if (node.name === 'HTTP Request2') {
    node.parameters.jsonBody = node.parameters.jsonBody.replace(
      'Do not invent any numbers. Keep your response concise, professional, and friendly.',
      'Do not invent any numbers. Always format currency amounts as TND (Tunisian Dinar) instead of Dollars ($). Keep your response concise, professional, and friendly. Never mention n8n or add a signature.'
    );
  }

  // 2. Disable n8n attribution in Telegram nodes
  if (node.type === 'n8n-nodes-base.telegram') {
    if (!node.parameters.additionalFields) {
      node.parameters.additionalFields = {};
    }
    node.parameters.additionalFields.appendAttribution = false;
  }
});

fs.writeFileSync(path, JSON.stringify(wf, null, 2));
console.log('Workflow updated with TND and removed attribution.');
