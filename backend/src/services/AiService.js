const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get MIME type from file extension
 */
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.tiff': 'image/tiff',
    '.tif': 'image/tiff',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Extract invoice data using Gemini Vision API
 * Supports: PDF, JPG, PNG, WEBP, TIFF
 */
const extractInvoiceData = async (filePath) => {
  try {
    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY not set — returning mock data');
      return getMockData();
    }

    console.log(`🤖 Gemini AI: Processing ${path.basename(filePath)}...`);

    // Read file as base64
    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString('base64');
    const mimeType = getMimeType(filePath);

    console.log(`   📄 File type: ${mimeType}, Size: ${(fileBuffer.length / 1024).toFixed(1)} KB`);

    // Use Gemini Flash Latest (confirmed working in your environment)
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `You are an expert invoice data extractor. Extract the following fields from the invoice image and return them as a valid JSON object.
    
    Fields to extract:
    - companyName: The name of the vendor or supplier (look for "Société", "STE", or large text at top).
    - invoiceNumber: The unique number of the invoice (look for "Facture N°", "N° Facture").
    - matriculeFiscal: The tax identification number (Matricule Fiscal in Tunisia, usually formatted like 1234567A/P/M000 or similar).
    - date: The date of the invoice (formatted as YYYY-MM-DD).
    - client: The name of the client or customer (look for "Client", "Facturé à").
    - totalHT: The total amount before tax (Hors Taxe).
    - tva: The TVA percentage (e.g., 19, 13, 7).
    - tvaAmount: The total TVA amount.
    - timbre: The fiscal stamp amount (Timbre fiscal).
    - totalAmount: The total amount after tax (TTC or Net à Payer).
    - rawText: A short summary of the items or services.

    Return ONLY the JSON object inside a json code block.
    Example response structure:
    \`\`\`json
    {
      "companyName": "STE EXAMPLE",
      "invoiceNumber": "INV123",
      "matriculeFiscal": "1234567/A/P/M/000",
      "date": "2023-10-15",
      "client": "CLIENT NAME",
      "totalHT": 1000.00,
      "tva": 19,
      "tvaAmount": 190.00,
      "timbre": 1.000,
      "totalAmount": 1191.000,
      "rawText": "Purchase of equipment",
      "confidenceScores": {
        "overall": 0.95
      }
    }
    \`\`\``;

    // Send to Gemini with the file
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      },
    ]);

    const response = result.response;
    let text = "";
    
    try {
      text = response.text();
    } catch (e) {
      console.error('❌ Gemini Error (Blocked or Empty):', JSON.stringify(response.promptFeedback));
      throw new Error('AI response was blocked by safety filters or is empty.');
    }

    console.log(`   ✅ Gemini response received (${text.length} chars)`);

    // Parse JSON from response
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Fallback: Remove markdown code blocks if present
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1].trim());
      } else {
        throw new Error('Could not parse Gemini response as JSON');
      }
    }

    // Normalize the extracted data
    const extractedData = {
      companyName: parsed.companyName || null,
      invoiceNumber: parsed.invoiceNumber || null,
      matriculeFiscal: parsed.matriculeFiscal || null,
      date: parsed.date ? new Date(parsed.date) : null,
      client: parsed.client || null,
      totalHT: parseFloat(parsed.totalHT) || 0,
      tva: parseFloat(parsed.tva) || 19,
      tvaAmount: parseFloat(parsed.tvaAmount) || 0,
      timbre: parseFloat(parsed.timbre) || 0,
      totalAmount: parseFloat(parsed.totalAmount) || 0,
      rawText: parsed.rawText || text.substring(0, 500),
      confidenceScores: parsed.confidenceScores || { overall: 0.85 },
    };

    console.log(`   📊 Extracted: Invoice #${extractedData.invoiceNumber} | ${extractedData.companyName} | Total: ${extractedData.totalAmount}`);

    return extractedData;

  } catch (error) {
    console.error('❌ Gemini Extraction Error:', error.message);
    throw error;
  }
};

/**
 * Fallback mock data when API key is not configured
 */
function getMockData() {
  return {
    companyName: 'Mock Vendor LLC',
    invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
    date: new Date(),
    totalAmount: 119.00,
    totalHT: 100.00,
    tvaAmount: 19.00,
    timbre: 0,
    tva: 19,
    client: 'SmartFacture Demo User',
    confidenceScores: { overall: 0.50 },
    rawText: 'MOCK DATA — Gemini API key not configured',
  };
}

module.exports = { extractInvoiceData };

/**
 * Fallback mock data when API key is not configured
 */
function getMockData() {
  return {
    companyName: 'Mock Vendor LLC',
    invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
    date: new Date(),
    totalAmount: 119.00,
    totalHT: 100.00,
    tvaAmount: 19.00,
    timbre: 0,
    tva: 19,
    client: 'SmartFacture Demo User',
    confidenceScores: { overall: 0.50 },
    rawText: 'MOCK DATA — Gemini API key not configured',
  };
}

module.exports = { extractInvoiceData };
