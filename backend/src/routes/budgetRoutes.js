const express = require('express');
const router = express.Router();
const { setBudget, getBudgetStatus } = require('../controllers/budgetController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

// Set budget (admin/manager only)
router.post('/', protect, authorize('ADMIN'), setBudget);

// Get budget status (any authenticated user)
router.get('/status', protect, getBudgetStatus);

module.exports = router;
