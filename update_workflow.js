const fs = require('fs');
const path = 'c:/Users/brahi/OneDrive/Desktop/pfe sarah/My workflow 2.json';
const wf = JSON.parse(fs.readFileSync(path, 'utf8'));

// 1. Add x-telegram-id header to HTTP Request and HTTP Request1
wf.nodes.forEach(node => {
  if (node.name === 'HTTP Request' || node.name === 'HTTP Request1') {
    if (!node.parameters.headerParameters) {
      node.parameters.headerParameters = { parameters: [] };
    }
    const hasHeader = node.parameters.headerParameters.parameters.find(p => p.name === 'x-telegram-id');
    if (!hasHeader) {
      node.parameters.headerParameters.parameters.push({
        name: "x-telegram-id",
        value: "={{ $node[\"Telegram Trigger\"].json.message.chat.id }}"
      });
    }
  }
});

// 2. We need to add an If Node at the very start to catch "/start" commands.
const startIfNode = {
  "parameters": {
    "conditions": {
      "options": {
        "caseSensitive": true,
        "leftValue": "",
        "typeValidation": "loose",
        "version": 3
      },
      "conditions": [
        {
          "id": "abc-start-check",
          "leftValue": "={{ $json.message.text || '' }}",
          "rightValue": "/start",
          "operator": {
            "type": "string",
            "operation": "startsWith"
          }
        }
      ],
      "combinator": "and"
    },
    "looseTypeValidation": true,
    "options": {}
  },
  "type": "n8n-nodes-base.if",
  "typeVersion": 2.3,
  "position": [ 192, -200 ],
  "id": "start-if-node-id",
  "name": "Check for Start Command"
};

const linkAccountNode = {
  "parameters": {
    "method": "POST",
    "url": "https://unsupervised-filamented-eartha.ngrok-free.dev/api/users/link-telegram",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        { "name": "x-api-key", "value": "n8n-secret-api-key-123" }
      ]
    },
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={{\nJSON.stringify({\n  telegramId: $json.message.chat.id,\n  token: $json.message.text.split(' ')[1]\n})\n}}",
    "options": {}
  },
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.4,
  "position": [ 416, -350 ],
  "id": "link-account-node",
  "name": "Link Account HTTP Request"
};

const sendSuccessNode = {
  "parameters": {
    "chatId": "={{ $node[\"Telegram Trigger\"].json.message.chat.id }}",
    "text": "✅ Account linked successfully! You can now send me photos of your invoices or ask questions about your company's financials.",
    "additionalFields": {}
  },
  "type": "n8n-nodes-base.telegram",
  "typeVersion": 1.2,
  "position": [ 624, -350 ],
  "id": "success-msg-node",
  "name": "Send Success Message",
  "credentials": {
    "telegramApi": {
      "id": "7FkCK6pRriLvUh7R",
      "name": "Telegram account"
    }
  }
};

// Push new nodes
wf.nodes.push(startIfNode, linkAccountNode, sendSuccessNode);

// Move the old "If" node to right
const oldIfNode = wf.nodes.find(n => n.name === 'If');
if (oldIfNode) oldIfNode.position[0] = 416; // Shift it right to make space
const getFileNode = wf.nodes.find(n => n.name === 'Get a file');
if (getFileNode) getFileNode.position[0] += 200;
const http1Node = wf.nodes.find(n => n.name === 'HTTP Request');
if (http1Node) http1Node.position[0] += 200;
const send1Node = wf.nodes.find(n => n.name === 'Send a text message');
if (send1Node) send1Node.position[0] += 200;
const http2Node = wf.nodes.find(n => n.name === 'HTTP Request1');
if (http2Node) http2Node.position[0] += 200;
const http3Node = wf.nodes.find(n => n.name === 'HTTP Request2');
if (http3Node) http3Node.position[0] += 200;
const send2Node = wf.nodes.find(n => n.name === 'Send a text message1');
if (send2Node) send2Node.position[0] += 200;

// Rewrite connections
wf.connections["Telegram Trigger"] = {
  "main": [
    [
      {
        "node": "Check for Start Command",
        "type": "main",
        "index": 0
      }
    ]
  ]
};

wf.connections["Check for Start Command"] = {
  "main": [
    [
      {
        "node": "Link Account HTTP Request",
        "type": "main",
        "index": 0
      }
    ],
    [
      {
        "node": "If", // The old IF node (Photo vs Text)
        "type": "main",
        "index": 0
      }
    ]
  ]
};

wf.connections["Link Account HTTP Request"] = {
  "main": [
    [
      {
        "node": "Send Success Message",
        "type": "main",
        "index": 0
      }
    ]
  ]
};

fs.writeFileSync(path, JSON.stringify(wf, null, 2));
console.log('Workflow updated successfully.');
