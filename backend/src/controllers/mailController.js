const Mail = require('../models/Mail');
const Invoice = require('../models/Invoice');
const ExtractedData = require('../models/ExtractedData');
const User = require('../models/User');
const { extractInvoiceData } = require('../services/AiService');

// Get all mails
const getMails = async (req, res, next) => {
  try {
    const mails = await Mail.find().sort({ createdAt: -1 });
    res.json({ data: mails });
  } catch (error) {
    next(error);
  }
};

// Create a new mail (Webhook from n8n)
const createMail = async (req, res, next) => {
  try {
    const { sender, name, subject, body } = req.body;
    const hasAttachment = !!req.file;

    // Create mail record
    const mail = await Mail.create({
      sender,
      name,
      subject,
      body,
      hasAttachment,
      status: hasAttachment ? 'processing' : 'ignored',
      snippet: body ? body.substring(0, 100) : ''
    });

    // If there is an attachment, process it as an invoice
    if (hasAttachment) {
      try {
        console.log('🔍 [Mail] Starting AI Extraction for attachment...');
        
        // Find an admin user to assign as the uploader, or fallback to any user
        const admin = await User.findOne({ role: 'ADMIN' });
        let userId = admin ? admin._id : null;

        if (!userId) {
          console.log('⚠️ [Mail] No admin user found, falling back to any user.');
          const anyUser = await User.findOne();
          userId = anyUser ? anyUser._id : null;
        }

        if (!userId) {
          console.error('❌ [Mail] No user found in database to assign the invoice.');
        }

        const invoice = await Invoice.create({
          userId: userId,
          fileUrl: req.file.path,
          status: 'PROCESSING'
        });

        const aiResponse = await extractInvoiceData(req.file.path);
        
        await ExtractedData.create({
          invoiceId: invoice._id,
          ...aiResponse
        });

        invoice.status = 'EXTRACTED';
        await invoice.save();

        // Update mail status and invoiceId
        mail.status = 'extracted';
        mail.invoiceId = invoice._id;
        await mail.save();

        console.log('✅ [Mail] AI Extraction Done.');
      } catch (err) {
        console.error('❌ [Mail] AI Pipeline Error:', err);
        mail.status = 'ignored'; // or failed
        await mail.save();
      }
    }

    res.status(201).json({ success: true, data: mail });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMails, createMail };
