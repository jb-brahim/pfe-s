const express = require('express');
const router = express.Router();
const { getDashboardStats, getMonthlyStats, getSuppliers } = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

// Dashboard overview
router.get('/dashboard', protect, authorize('ACCOUNTANT', 'ADMIN'), getDashboardStats);

// Monthly stats for charts
router.get('/monthly', protect, authorize('ACCOUNTANT', 'ADMIN'), getMonthlyStats);

// Suppliers summary
router.get('/suppliers', protect, authorize('ACCOUNTANT', 'ADMIN'), getSuppliers);

module.exports = router;
