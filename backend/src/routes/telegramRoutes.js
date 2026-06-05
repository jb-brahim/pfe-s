const express = require('express');
const router = express.Router();
const { linkAccount } = require('../controllers/telegramController');
const { protect } = require('../middlewares/authMiddleware');

// Route is protected so only authorized agents (like n8n via x-api-key) can call it
router.post('/link-account', protect, linkAccount);

module.exports = router;
