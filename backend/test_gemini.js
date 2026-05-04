/**
 * 🧪 Test Gemini Invoice Extraction
 * Run: node test_gemini.js
 */
require('dotenv').config();
const { extractInvoiceData } = require('./src/services/AiService');
const path = require('path');
const fs = require('fs');

async function runTest() {
  console.log('═══════════════════════════════════════════');
  console.log('🧪 GEMINI INVOICE EXTRACTION TEST');
  console.log('═══════════════════════════════════════════\n');

  // Find test files in root directory
  const testFiles = [
    'invoice_100_page1.jpg',
    'invoice_100 (3)_page1.jpg',
    'invoice_100_page1.pdf',
  ];

  for (const filename of testFiles) {
    const filePath = path.join(__dirname, filename);

    if (!fs.existsSync(filePath)) {
      console.log(`⏭️  Skipping ${filename} (file not found)\n`);
      continue;
    }

    console.log(`\n─────────────────────────────────────────`);
    console.log(`📄 Testing: ${filename}`);
    console.log(`   Size: ${(fs.statSync(filePath).size / 1024).toFixed(1)} KB`);
    console.log(`─────────────────────────────────────────`);

    try {
      const startTime = Date.now();
      const result = await extractInvoiceData(filePath);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`\n✅ SUCCESS (${duration}s)\n`);
      console.log('📊 Extracted Data:');
      console.log('┌──────────────────┬───────────────────────────────────────┐');
      console.log(`│ Company Name     │ ${(result.companyName || 'N/A').padEnd(37)} │`);
      console.log(`│ Invoice Number   │ ${(result.invoiceNumber || 'N/A').padEnd(37)} │`);
      console.log(`│ Matricule Fiscal │ ${(result.matriculeFiscal || 'N/A').padEnd(37)} │`);
      console.log(`│ Date             │ ${(result.date ? result.date.toISOString().split('T')[0] : 'N/A').padEnd(37)} │`);
      console.log(`│ Client           │ ${(result.client || 'N/A').padEnd(37)} │`);
      console.log(`│ Total HT         │ ${String(result.totalHT || 0).padEnd(37)} │`);
      console.log(`│ TVA Rate         │ ${(String(result.tva || 0) + '%').padEnd(37)} │`);
      console.log(`│ TVA Amount       │ ${String(result.tvaAmount || 0).padEnd(37)} │`);
      console.log(`│ Timbre           │ ${String(result.timbre || 0).padEnd(37)} │`);
      console.log(`│ Total TTC        │ ${String(result.totalAmount || 0).padEnd(37)} │`);
      console.log('├──────────────────┼───────────────────────────────────────┤');
      console.log(`│ Confidence       │ ${String(result.confidenceScores?.overall || 'N/A').padEnd(37)} │`);
      console.log('└──────────────────┴───────────────────────────────────────┘');

      if (result.rawText) {
        console.log(`\n📝 Raw Text Preview (first 200 chars):`);
        console.log(`   "${result.rawText.substring(0, 200)}..."`);
      }

    } catch (error) {
      console.log(`\n❌ FAILED: ${error.message}`);
    }

    console.log('');
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('🏁 TEST COMPLETE');
  console.log('═══════════════════════════════════════════');
}

runTest().catch(console.error);
