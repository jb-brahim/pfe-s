const express = require('express');
const router = express.Router();
const { syncData } = require('../controllers/externalController');
const { apiKeyProtect } = require('../middlewares/authMiddleware');

// @route   GET /api/external/sync
// @desc    Export all organization data (Invoices, Users, etc.)
// @access  Private (API Key)
router.get('/sync', apiKeyProtect, syncData);

module.exports = router;
