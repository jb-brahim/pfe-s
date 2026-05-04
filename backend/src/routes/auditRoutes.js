const express = require('express');
const router = express.Router();
const { getAuditTrail, getAllAuditLogs } = require('../controllers/auditController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

// Get audit trail for a specific invoice (any authenticated user)
router.get('/:invoiceId', protect, getAuditTrail);

// Get all audit logs (admin only)
router.get('/', protect, authorize('ADMIN'), getAllAuditLogs);

module.exports = router;
