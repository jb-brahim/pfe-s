const express = require('express');
const router = express.Router();
const { processApproval } = require('../controllers/workflowController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.post('/:invoiceId/approve', protect, authorize('MANAGER', 'ADMIN'), processApproval);

module.exports = router;
