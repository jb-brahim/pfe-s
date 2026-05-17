const express = require('express');
const router = express.Router();
const { getMails, createMail } = require('../controllers/mailController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Get all mails (Protected)
router.get('/', protect, getMails);

// Create a mail (Webhook from n8n)
// Accepts a file named 'invoiceFile' and other email fields
router.post('/', upload.single('invoiceFile'), createMail);

module.exports = router;
